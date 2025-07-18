import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  View,
  Animated,
  ActivityIndicator,
  Keyboard,
  Modal,
  BackHandler,
} from "react-native";
// import loginImg from "../asserts/images/loginImg.jpg";
import loginImg from "../asserts/images/loginbg1.jpg";
import CountryPicker from "react-native-country-picker-modal";
import Toast from "react-native-toast-message";
import { getLoginOtp, staffLogin, verifyOtp } from "../api/auth";
import { setAuthToken } from "../api/axiosInstance";
import { Controller, useForm } from "react-hook-form";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ContextProps } from "../../App";
import { checkAppVersion } from "../context/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

// import OtpInputs from 'react-native-otp-inputs';
// import RNOtpVerify from 'react-native-otp-verify';

const { width, height } = Dimensions.get("window");
const OTP_TIMEOUT = 30;

function LoginScreen({ navigation }) {
  // Tab state
  const [activeTab, setActiveTab] = useState("migrants");
  // Prevent double submit after OTP or staff login success
  const [otpVerified, setOtpVerified] = useState(false);
  const [staffLoginVerified, setStaffLoginVerified] = useState(false);
  const { appUpdate, setAppUpdate } = useContext(ContextProps);
  // Migrants login state
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(OTP_TIMEOUT);
  const [canResendOtp, setCanResendOtp] = useState(false);

  // Common state
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [countryCode, setCountryCode] = useState("IN");
  const [callingCode, setCallingCode] = useState("91");
  const [error, setError] = useState("");
  const textInputRef = useRef(null);
  const countdownRef = useRef(null);
  const [blinkAnim] = useState(new Animated.Value(0));
  const [yourOtp, setYourOtp] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  // Refs for scrolling to input
  const scrollViewRef = useRef(null);
  const mobileInputRef = useRef(null);
  const otpInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [showNotRegisteredModal, setShowNotRegisteredModal] = useState(false);

  const [showExitModal, setShowExitModal] = useState(false);

  // react-hook-form setup for staff login
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Initialize OTP Verify
  // useEffect(() => {
  //   if (Platform.OS === 'android') {
  //     RNOtpVerify.getHash()
  //       .then(hash => console.log('App Hash:', hash))
  //       .catch(error => console.error('Hash Error:', error));
  //     RNOtpVerify.startOtpListener(message => {
  //       if (message) {
  //         const otpMatch = message.match(/(\d{5})/);
  //         if (otpMatch) {
  //           setOtp(otpMatch[0]);
  //           setError("");
  //           otpInputRef.current?.focus();
  //         }
  //       }
  //     });
  //     return () => RNOtpVerify.removeListener();
  //   }
  // }, []);

  // Add this effect when error occurs
  useEffect(() => {
    if (error.includes("not registered")) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      blinkAnim.setValue(0);
    }
  }, [error]);

  // Fade-in effect for the screen
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Inside your LoginScreen component, add this useEffect to auto-fill OTP
  useEffect(() => {
    if (yourOtp && yourOtp.length === 5) {
      setOtp(yourOtp); // Auto-fill OTP when received
      otpInputRef.current?.focus(); // Focus the OTP input field
    }
  }, [yourOtp]);

  // Countdown effect for OTP
  useEffect(() => {
    if (otpSent && countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResendOtp(true);
      clearTimeout(countdownRef.current);
    }

    return () => clearTimeout(countdownRef.current);
  }, [countdown, otpSent]);

  useEffect(() => {
    const onBackPress = () => {
      if (navigation.isFocused()) {
        setShowExitModal(true);
        return true;
      }
      return false;
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    // return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [navigation]);

  const handleExitApp = () => {
    setShowExitModal(false);
    setTimeout(() => {
      BackHandler.exitApp();
    }, 200);
  };

  const handleInputFocus = () => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  const navigateGoBack = () => {
    navigation.navigate("Splash");
  };

  // Migrants login functions
  const validatePhoneNumber = () => {
    if (!mobile || mobile.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }
    setError("");
    return true;
  };

  const handleSendOtp = async () => {
    Keyboard.dismiss();
    if (!validatePhoneNumber(mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const response = await getLoginOtp(callingCode, mobile);
      setYourOtp(response.otp);
      if (!response.status) {
        setShowNotRegisteredModal(true);
        return;
      }
      // if (!response.status) {
      //   Alert.alert(
      //     "You're not registered",
      //     "Please register to continue",
      //     [
      //       {
      //         text: "Cancel",
      //         onPress: () => console.log("Cancel Pressed"),
      //         style: "cancel",
      //       },
      //       {
      //         text: "Register",
      //         onPress: ()=>register(callingCode, mobile),
      //       },
      //     ],
      //     { cancelable: false }
      //   )
      //   // Toast.show({
      //   //   type: "error",
      //   //   text1: "User Not Registered",
      //   //   text2: "Please register first to continue",
      //   // });
      //   // setError("User not registered. Please register first.");
      //   // setShowOtpField(false);
      //   return;
      // }

      const receivedOtp = response.otp;
      Toast.show({
        type: "success",
        text1: "OTP Sent Successfully",
        text2: `OTP has been sent to +${callingCode} ${mobile}`,
      });
      setError("");
      // setMobile(""); // Store mobile number for later use
      // Toast.show({
      //   type: "info",
      //   text1: "Your OTP (for testing)",
      //   text2: `OTP: ${receivedOtp}`,
      //   visibilityTime: 5000,
      // });

      setShowOtpField(true);
      setOtpSent(true);
      setCountdown(OTP_TIMEOUT);
      setCanResendOtp(false);
    } catch (error) {
      console.error("Detailed OTP Error:", error);
      const errorMessage = error.message || "Failed to send OTP. Please check your network or server.";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    Keyboard.dismiss();
    setCanResendOtp(false);
    setCountdown(OTP_TIMEOUT);
    setOtp("");
    await handleSendOtp();
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  const handleVerifyOtp = async () => {
    Keyboard.dismiss();
    if (otp.length !== 5) {
      setError("Please enter a valid 5-digit OTP");
      return;
    }

    setVerifying(true);
    setOtpVerified(false);
    try {
      const response = await verifyOtp(callingCode, mobile, otp);

      if (response?.status) {
        setOtpVerified(true); // Prevent button re-enable
        await setAuthToken(response.access_token);
        Toast.show({
          type: "success",
          position: "top",
          text1: "Login Successful",
          text2: "Welcome to the Dashboard!",
          visibilityTime: 5000,
        });
        setError("");
        setTimeout(() => {
          navigation.navigate("Dashboard", {
            accessToken: response.access_token,
          });
          setOtpVerified(false); // Reset after navigation
        }, 2000);
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Detailed Verify OTP Error:", error);
      const errorMessage = error.message || "Verification failed. Please try again.";
      setError(errorMessage);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } finally {
      setVerifying(false);
    }
  };

  // Staff login functions
  const validateStaffCredentials = () => {
    if (!email) {
      setError("Please enter your email");
      return false;
    }
    if (!password) {
      setError("Please enter your password");
      return false;
    }
    setError("");
    return true;
  };

  const register = (mobileCode, mobile) => {
    navigation.navigate("Register", { from: "Login", mobileCode, mobile });
    setError("");
    setMobile("");
  }

  const handleStaffLogin = async (data) => {
    Keyboard.dismiss();
    setLoading(true);
    setStaffLoginVerified(false);
    try {
      const response = await staffLogin(data.email, data.password);
      if (response?.status) {
        setStaffLoginVerified(true); // Prevent button re-enable
        await setAuthToken(response.access_token);
        Toast.show({
          type: "success",
          position: "top",
          text1: "Login Successful",
          text2: "Welcome Staff!",
          visibilityTime: 5000,
        });
        setTimeout(() => {
          navigation.navigate("Dashboard", {
            accessToken: response.access_token,
          });
          setStaffLoginVerified(false); // Reset after navigation
        }, 2000);
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Staff Login Error:", error);
      const errorMessage = error.message || "Login failed. Please try again.";
      setError(errorMessage);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle keyboard show/hide events to scroll to the focused input
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        setTimeout(() => {
          let focusedInput;
          if (activeTab === "migrants") {
            focusedInput = showOtpField ? otpInputRef.current : mobileInputRef.current;
          } else {
            focusedInput = passwordInputRef.current;
          }

          focusedInput?.measure((x, y, width, height, pageX, pageY) => {
            scrollViewRef.current?.scrollTo({ y: pageY - 100, animated: true });
          });
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, [showOtpField, activeTab]);

  // Reset form when switching tabs
  useEffect(() => {
    if (activeTab === "migrants") {
      reset({ email: "", password: "" });
      setError("");
    } else {
      setMobile("");
      setOtp("");
      setShowOtpField(false);
      setOtpSent(false);
      setCountdown(OTP_TIMEOUT);
      setCanResendOtp(false);
      setError("");
    }
  }, [activeTab, reset]);

  const renderMigrantsLogin = () => (
    <>
      {!showOtpField ? (
        <>
          <TouchableOpacity
            style={styles.inputBox}
            activeOpacity={1}
            onPress={handleInputFocus}
          >
            <View style={styles.phoneRow}>
              <CountryPicker
                countryCode={countryCode}
                withCallingCode
                withFlag
                withFilter
                withEmoji
                onSelect={(country) => {
                  setCountryCode(country.cca2);
                  setCallingCode(country.callingCode[0]);
                  setError("");
                }}
                containerButtonStyle={styles.countryPicker}
              />
              <Text style={styles.callingCode}>+{callingCode}</Text>
              <TextInput
                ref={mobileInputRef}
                placeholder="Mobile Number"
                placeholderTextColor="#D3B58F"
                keyboardType="phone-pad"
                style={[styles.input, { flex: 1 }]}
                value={mobile}
                onChangeText={(text) => setMobile(text.replace(/[^0-9]/g, ""))}
                maxLength={12}
              />
            </View>
            {/* {error && !showOtpField && <Text style={styles.errorText}>{error}</Text>} */}
          </TouchableOpacity>

          <Text style={styles.registerText}>
            New user?{" "}
            <Animated.Text
              onPress={() => register()}
              style={[
                styles.registerBold,
                error.includes("not registered") && styles.highlightedRegister
              ]}
            >
              Register
            </Animated.Text>
          </Text>
        </>
      ) : (
        <View style={styles.otpContainer}>
          <View style={styles.inputBox}>
            <TextInput
              ref={otpInputRef}
              placeholder="Enter 5-digit OTP"
              placeholderTextColor="#D3B58F"
              keyboardType="numeric"
              style={[styles.input, { textAlign: "center" }]}
              value={otp}
              onChangeText={(text) => {
                setOtp(text.replace(/[^0-9]/g, ""));
                if (text.length === 5 && error) setError(""); // Clear error when OTP is correctly entered
              }}
              // onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ""))}
              maxLength={5}
            />

            {/* <OtpInputs
              ref={otpInputRef}
              handleChange={(code) => {
                setOtp(code.replace(/[^0-9]/g, ""));
                if (code.length === 5 && error) setError("");
              }}
              numberOfInputs={5}
              inputStyles={[styles.input, styles.otpInput]}
              inputContainerStyles={styles.otpInputContainer}
              autofillFromClipboard={false}
              keyboardType="numeric"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              autoFocus
            /> */}

            {/* Clear input icon (positioned at the right of the input) */}
            {otp.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setOtp("")}
              >
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}

            {/* Cancel OTP field icon (positioned at top-right corner) */}
            <TouchableOpacity
              style={styles.cancelOtpButton}
              onPress={() => {
                setShowOtpField(false);
                setOtp("");
                setOtpSent(false);
                setCountdown(OTP_TIMEOUT);
                setCanResendOtp(false);
                setError("");
                mobileInputRef.current?.focus();
              }}
            >
              <Text style={styles.cancelOtpText}>✕</Text>
            </TouchableOpacity>


            {/* <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowOtpField(false);
                setOtp("");
                setOtpSent(false);
                setCountdown(OTP_TIMEOUT);
                setCanResendOtp(false);
                setError("");
                mobileInputRef.current?.focus(); // Focus mobile input
              }}
            >
              <Text style={styles.cancelText}>✕</Text>
            </TouchableOpacity> */}
          </View>
          {/* {error && showOtpField && <Text style={styles.errorText}>{error}</Text>} */}
          {otpSent && countdown > 0 && (
            <Text style={styles.countdownText}>Resend OTP in {countdown}s</Text>
          )}

          <View style={styles.otpInfoRow}>
            {/* <Text style={styles.otpText}>Your otp: </Text>
            <Text style={styles.otpValue}>{yourOtp}</Text> */}
            {canResendOtp && (
              <TouchableOpacity onPress={handleResendOtp}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {!showOtpField ? (
        <TouchableOpacity
          style={[styles.button, (!mobile || mobile.length < 10) && styles.disabledButton]}
          onPress={handleSendOtp}
          activeOpacity={0.8}
          disabled={!mobile || mobile.length < 10 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#3D2A1A" />
          ) : (
            <Text style={styles.buttonText}>Send OTP</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.button, (otp.length !== 5 || verifying || otpVerified) && styles.disabledButton]}
          onPress={handleVerifyOtp}
          activeOpacity={0.8}
          disabled={otp.length !== 5 || verifying || otpVerified}
        >
          {verifying ? (
            <ActivityIndicator color="#3D2A1A" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      )}

      {otpSent && !showOtpField && (
        <Text style={styles.otpNote}>OTP sent to +{callingCode} {mobile}</Text>
      )}
    </>
  );

  const renderStaffLogin = () => (
    <>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Staff Login</Text>
        <View style={[styles.inputBox, errors.email && styles.inputError]}>
          <Controller
            control={control}
            name="email"
            rules={{
              required: "Please enter your email",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                ref={emailInputRef}
                placeholder="Email"
                placeholderTextColor="#D3B58F"
                keyboardType="email-address"
                style={styles.input}
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  if (isValid) setError(""); // Clear general error if form is valid
                }}
                autoCapitalize="none"
              />
            )}
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <View style={[styles.inputBox, errors.password && styles.inputError]}>
          <Controller
            control={control}
            name="password"
            rules={{
              required: "Please enter your password",
              minLength: {
                value: 4,
                message: "Password must be at least 4 characters",
              },
              maxLength: {
                value: 10,
                message: "Password cannot exceed 10 characters",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.passwordInputContainer}>
                <TextInput
                  ref={passwordInputRef}
                  placeholder="Password"
                  placeholderTextColor="#D3B58F"
                  style={styles.input}
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    if (isValid) setError(""); // Clear general error if form is valid
                  }}
                  secureTextEntry={showPassword ? false : true}
                  maxLength={10}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.eyeButton}
                >
                  <Icon
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#D3B58F"
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, (!isValid || loading || staffLoginVerified) && styles.disabledButton]}
        onPress={handleSubmit(handleStaffLogin)}
        activeOpacity={0.8}
        disabled={!isValid || loading || staffLoginVerified}
      >
        {loading ? (
          <ActivityIndicator color="#3D2A1A" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </>
  );


  useEffect(() => {
    checkAppVersion(appUpdate, setAppUpdate);
    AsyncStorage.setItem('lastSyncTime', '');
  }, []);


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ImageBackground
        source={loginImg}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigateGoBack()}
              >
                {/* <Icon name="arrow-left" size={24} color="#FFF2E0" /> */}
                <Text style={styles.backButtonText}>{"Back"}</Text>
                {/* <BackIcon name="arrow-back-ios" size={24} color="#ffffff" /> */}
              </TouchableOpacity>
              {/* <Text style={styles.title}>MIGRANT WORKERS</Text> */}
              {/* <Text style={styles.title}>Don Bosco Migrant Services</Text> */}
              <View style={{ width: 60 }} />
            </View>
            <Text style={styles.title}>Don Bosco Migrant Services</Text>

            <Text style={styles.subtitle}>Login</Text>

            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "migrants" && styles.activeTab
                ]}
                onPress={() => {
                  setActiveTab("migrants");
                  reset();
                  setError("");
                }}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === "migrants" && styles.activeTabText
                ]}>
                  Migrant
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "staff" && styles.activeTab
                ]}
                onPress={() => {
                  setActiveTab("staff");
                  setMobile("");
                  setOtp("");
                  setShowOtpField(false);
                  setOtpSent(false);
                  setError("");
                }}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === "staff" && styles.activeTabText
                ]}>
                  Staff
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.textBottom}>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {/* {renderStaffLogin()} */}
              {activeTab === "migrants" ? renderMigrantsLogin() : renderStaffLogin()}
            </View>
          </Animated.View>
        </ScrollView>
      </ImageBackground>
      <Toast />
      <Modal
        visible={showNotRegisteredModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotRegisteredModal(false)}
      >
        <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modelView, { backgroundColor: '#fff', padding: 24, borderRadius: 8, alignItems: 'center', minWidth: 280 }]}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>
              You're not registered
            </Text>
            <Text style={{ marginBottom: 24, color: '#333', textAlign: 'center' }}>
              Please register to continue
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity
                style={{ flex: 1, marginRight: 8, padding: 12, borderRadius: 6, backgroundColor: '#eee', alignItems: 'center' }}
                onPress={() => setShowNotRegisteredModal(false)}
              >
                <Text style={{ color: '#333', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, marginLeft: 8, padding: 12, borderRadius: 6, backgroundColor: '#007AFF', alignItems: 'center' }}
                onPress={() => {
                  setShowNotRegisteredModal(false);
                  register(callingCode, mobile);
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <TouchableOpacity
          style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }]}
          activeOpacity={1}
          onPressOut={() => setShowExitModal(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: '#fff', padding: 24, borderRadius: 8, alignItems: 'center', minWidth: 280 }]}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>
              Are you sure you want to close the app?
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity
                style={{ flex: 1, marginRight: 8, padding: 12, borderRadius: 6, backgroundColor: '#eee', alignItems: 'center' }}
                onPress={() => setShowExitModal(false)}
              >
                <Text style={{ color: '#333', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, marginLeft: 8, padding: 12, borderRadius: 6, backgroundColor: '#d9534f', alignItems: 'center' }}
                onPress={handleExitApp}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  modelView: {
    // flex: 1,
    width: '80%',
    // height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255, 242, 224, 0.2)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: "#FFF2E0",
    fontWeight: "bold",
  },
  title: {
    marginLeft: 10,
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 32,
    color: "#FFECD2",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 100,
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  textBottom: {
    marginTop: 10,
    justifyContent: "space-between",
    flexDirection: "column",
    alignItems: "center",
  },
  inputBox: {
    backgroundColor: "rgba(96, 51, 0, 0.9)",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 25,
    width: "100%",
    borderWidth: 1,
    borderColor: "#FFF2E0",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  otpContainer: {
    width: "100%",
    alignItems: "center",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryPicker: {
    marginRight: 8,
  },
  callingCode: {
    color: "#FFF7E7",
    fontSize: 18,
    marginRight: 8,
  },
  // errorText: {
  //   color: "red",
  //   color: "#FF0000",
  //   fontSize: 14,
  //   marginBottom: 10,
  //   alignSelf: "center",
  //   textAlign: "center",
  // },
  // input: {
  //   fontSize: 18,
  //   color: "#FFF7E7",
  //   height: 40,
  //   top: 2,
  // },
  button: {
    backgroundColor: "#FFF2E0",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: "#FFECD2",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#3D2A1A",
    fontSize: 18,
    fontWeight: "bold",
  },
  otpNote: {
    color: "#FFECD2",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  registerText: {
    color: "#FFF2E0",
    fontSize: 14,
    top: 5,
    marginTop: 10,
    marginBottom: 10,
    // bottom: 10,
  },
  registerBold: {
    fontWeight: "bold",
    color: "#FFD699",
  },
  highlightedRegister: {
    color: '##FFFF00',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  otpInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 5,
  },
  otpText: {
    fontSize: 14,
    color: "#fff",
  },
  otpValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFD700",
    marginLeft: 4,
    marginRight: 8,
  },
  resendText: {
    fontSize: 14,
    color: "#00BFFF",
    textDecorationLine: "underline",
  },
  // Tab styles
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "rgba(96, 51, 0, 0.7)",
    borderRadius: 10,
    padding: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "rgba(239, 235, 229, 0.3)",
  },
  tabText: {
    color: "#FFF2E0",
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#FFD699",
  },



  inputContainer: {
    width: "100%",
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    color: "#FFF2E0",
    marginBottom: 5,
  },
  inputBox: {
    backgroundColor: "rgba(96, 51, 0, 0.9)",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: "#FFF2E0",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    position: "relative",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  eyeButton: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  input: {
    fontSize: 18,
    color: "#FFF7E7",
    height: 40,
    flex: 1,
    top: 2,
  },
  inputError: {
    borderColor: "red",
  },
  cancelButton: {
    position: "absolute",
    top: 12,
    right: 15,
    padding: 5,
  },

  clearButton: {
    position: "absolute",
    right: 15,
    top: 12,
    padding: 5,
  },
  clearText: {
    color: "#FFF2E0",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelOtpButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "rgba(96, 51, 0, 0.9)",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFF2E0",
  },
  cancelOtpText: {
    color: "#FFF2E0",
    fontSize: 16,
    fontWeight: "bold",
  },


  countdownText: {
    color: "#FFF2E0",
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
    alignSelf: "center",
  },
  cancelText: {
    color: "#FFF2E0",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "#FFFF00",
    fontSize: 14,
    // marginTop: 5,
    marginBottom: 10,
    alignSelf: "center",
    // textAlign: "left",
  },

  // model for cancel app
  modalOverlay: {
    // flex: 1,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  }
});

export default LoginScreen;