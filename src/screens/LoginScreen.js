import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import loginImg from "../asserts/images/loginImg.jpg";
// import loginImg from "../asserts/images/spm0.jpg";
import CountryPicker from "react-native-country-picker-modal";
import Toast from "react-native-toast-message";
import { getLoginOtp, staffLogin, verifyOtp } from "../api/auth";
import { setAuthToken } from "../api/axiosInstance";
import { Controller, useForm } from "react-hook-form";

const { width, height } = Dimensions.get("window");
const OTP_TIMEOUT = 30; // 30 seconds countdown

function LoginScreen({ navigation }) {
  // Tab state
  const [activeTab, setActiveTab] = useState("migrants");
  
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

  // Refs for scrolling to input
  const scrollViewRef = useRef(null);
  const mobileInputRef = useRef(null);
  const otpInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

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
  if (yourOtp && yourOtp.length === 6) {
    setOtp(yourOtp); // Auto-fill OTP when received
    otpInputRef.current?.focus(); // Focus the OTP input field
  }
}, [yourOtp]);

// // For production SMS auto-retrieval (Android)
// useEffect(() => {
//   if (Platform.OS === 'android') {
//     SmsRetriever.startSmsRetriever()
//       .then((result) => {
//         if (result) {
//           SmsRetriever.addSmsListener((event) => {
//             if (event && event.message) {
//               // Assuming OTP is a 6-digit number in the SMS
//               const otpRegex = /\b\d{6}\b/;
//               const match = event.message.match(otpRegex);
//               if (match) {
//                 setOtp(match[0]);
//                 otpInputRef.current?.focus();
//               }
//             }
//           });
//         }
//       })
//       .catch((error) => console.error('SMS Retriever Error:', error));

//     return () => {
//       SmsRetriever.removeSmsListener();
//     };
//   }
// }, []);

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
        Toast.show({
          type: "error",
          text1: "User Not Registered",
          text2: "Please register first to continue",
        });
        setError("User not registered. Please register first.");
        setShowOtpField(false);
        return;
      }

      const receivedOtp = response.otp;
      Toast.show({
        type: "success",
        text1: "OTP Sent Successfully",
        text2: `OTP has been sent to +${callingCode} ${mobile}`,
      });

      Toast.show({
        type: "info",
        text1: "Your OTP (for testing)",
        text2: `OTP: ${receivedOtp}`,
        visibilityTime: 5000,
      });

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
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setVerifying(true);
    try {
      const response = await verifyOtp(callingCode, mobile, otp);
      
      if (response?.status) {
        await setAuthToken(response.access_token);
        Toast.show({
          type: "success",
          position: "bottom",
          text1: "Login Successful",
          text2: "Welcome to the Dashboard!",
          visibilityTime: 5000,
        });
        setTimeout(() => {
          navigation.navigate("Dashboard", {
            accessToken: response.access_token,
          });
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

  const handleStaffLogin = async (data) => {
    // if (!validateStaffCredentials()) return;
    Keyboard.dismiss();
    setLoading(true);
    try {
      // Replace with your actual staff login API call
      // const response = await staffLogin(email, password);
      
      // Mock response for demonstration
      // const mockResponse = {
      //   status: true,
      //   access_token: "staff_access_token_123",
      //   user: {
      //     id: 1,
      //     email: email,
      //     role: "staff"
      //   }
      // };
      
      const response = await staffLogin(data.email, data.password); // Use the staffLogin API

      if (response?.status) {
        await setAuthToken(response.access_token);
        Toast.show({
          type: "success",
          position: "bottom",
          text1: "Login Successful",
          text2: "Welcome Staff!",
          visibilityTime: 5000,
        });
        setTimeout(() => {
          navigation.navigate("Dashboard", {
            accessToken: response.access_token,
          });
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
                      {error && !showOtpField && <Text style={styles.errorText}>{error}</Text>}
          </TouchableOpacity>

          <Text style={styles.registerText}>
            New user?{" "}
            <Animated.Text
              onPress={() => navigation.navigate("Register")}
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
              placeholder="Enter 6-digit OTP"
              placeholderTextColor="#D3B58F"
              keyboardType="numeric"
              style={[styles.input, { textAlign: "center" }]}
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ""))}
              maxLength={6}
            />
          
          <TouchableOpacity
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
          </TouchableOpacity></View>
          {error && showOtpField && <Text style={styles.errorText}>{error}</Text>}
        {otpSent && countdown > 0 && (
          <Text style={styles.countdownText}>Resend OTP in {countdown}s</Text>
        )}
        
          <View style={styles.otpInfoRow}>
            <Text style={styles.otpText}>Your otp: </Text>
            <Text style={styles.otpValue}>{yourOtp}</Text>
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
          style={[styles.button, otp.length !== 6 && styles.disabledButton]}
          onPress={handleVerifyOtp}
          activeOpacity={0.8}
          disabled={otp.length !== 6 || verifying}
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
              secureTextEntry
              maxLength={10}
            />
          )}
        />
      </View>
      {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
    </View>

    {error && !errors.email && !errors.password && (
      <Text style={styles.errorText}>{error}</Text>
    )}

    <TouchableOpacity
      style={[styles.button, !isValid && styles.disabledButton]}
      onPress={handleSubmit(handleStaffLogin)}
      activeOpacity={0.8}
      disabled={!isValid || loading}
    >
      {loading ? (
        <ActivityIndicator color="#3D2A1A" />
      ) : (
        <Text style={styles.buttonText}>Login</Text>
      )}
    </TouchableOpacity>
  </>
);


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
                <Text style={styles.backButtonText}>{"< Back"}</Text>
              </TouchableOpacity>
              <Text style={styles.title}>MIGRANT WORKERS</Text>
              <View style={{ width: 60 }} />
            </View>

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
                  reset(); // Reset staff login form
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
                onPress={() =>{
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
              
              {activeTab === "migrants" ? renderMigrantsLogin() : renderStaffLogin()}
            </View>
          </Animated.View>
        </ScrollView>
      </ImageBackground>
      <Toast />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: width,
    height: height,
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
    padding: 10,
    backgroundColor: "rgba(255, 242, 224, 0.2)",
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#FFF2E0",
    fontWeight: "bold",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    color: "#FFECD2",
    textAlign: "center",
    marginBottom: 350,
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  textBottom: {
    marginTop: 20,
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
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    alignSelf: "center",
    textAlign: "center",
  },
  input: {
    fontSize: 18,
    color: "#FFF7E7",
    height: 40,
    top: 2,
  },
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
    color: '#FF0000',
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
    marginBottom: 10, // Space between input fields
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
    position: "relative", // For cancel button positioning
  },
  input: {
    fontSize: 18,
    color: "#FFF7E7",
    height: 40,
    top: 2,
  },
  inputError: {
    borderColor: "red", // Highlight the input box border on error
  },
  cancelButton: {
    position: "absolute",
    top: 12,
    right: 15,
    padding: 5,
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
    color: "red",
    fontSize: 14,
    marginTop: 5, // Space between input box and error message
    alignSelf: "flex-start", // Align error text with input box
    textAlign: "left",
  },
});

export default LoginScreen;