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
// import loginImg from "../asserts/images/sps2.jpg";
// import loginImg from "../asserts/images/sps4.jpg";
// import loginImg from "../asserts/images/imgLogin.jpg";
import CountryPicker from "react-native-country-picker-modal";
import Toast from "react-native-toast-message";
import { getLoginOtp, verifyOtp } from "../api/auth";
import { setAuthToken } from "../api/axiosInstance";

const { width, height } = Dimensions.get("window");
const OTP_TIMEOUT = 30; // 30 seconds countdown

function LoginScreen({ navigation }) {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(OTP_TIMEOUT);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [countryCode, setCountryCode] = useState("IN");
  const [callingCode, setCallingCode] = useState("91");
  const [error, setError] = useState("");
  const textInputRef = useRef(null);
  const countdownRef = useRef(null);
  const [blinkAnim] = useState(new Animated.Value(0));

  // Refs for scrolling to input
  const scrollViewRef = useRef(null);
  const mobileInputRef = useRef(null);
  const otpInputRef = useRef(null);
  
  console.log("otp", otp);
  const [yourOtp, setYourOtp] = useState([]);
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


  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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

  const validatePhoneNumber = () => {
    if (!mobile || mobile.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }
    setError("");
    return true;
  };

  const handleSendOtp = async () => {
    if (!validatePhoneNumber()) return;

    setLoading(true);
    try {
      console.log("Sending OTP...");

      const response = await getLoginOtp(callingCode, mobile);
      console.log("OTP Response:", response); // Log the response for debugging
      setYourOtp(response.otp);
      if (!response.status) {
        // User not registered
        Toast.show({
          type: "error",
          text1: "User Not Registered",
          text2: "Please register first to continue",
        });

        // Highlight the register text
        setError("User not registered. Please register first.");
        setShowOtpField(false);
        return;
      }

      // User is registered - proceed with OTP flow
      const receivedOtp = response.otp; // Ensure the response has an 'otp' field

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

//   console.log("Showing toast...");
// Toast.show({ type: 'success', text1: 'Success', text2: 'Your account has been created successfully!' });
  // Handle keyboard show/hide events to scroll to the focused input
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {

        // const focusedInput = showOtpField ? otpInputRef.current : mobileInputRef.current;
        // if (focusedInput) {
        //   focusedInput.measureLayout(
        //     scrollViewRef.current,
        //     (x, y) => {
        //       scrollViewRef.current.scrollTo({ y: y - 50, animated: true }); // Adjust offset as needed
        //     },
        //     (error) => console.log("Error measuring layout:", error)
        //   );
        // }

        setTimeout(() => {
      const focusedInput = showOtpField ? otpInputRef.current : mobileInputRef.current;
      focusedInput?.measure((x, y, width, height, pageX, pageY) => {
        scrollViewRef.current?.scrollTo({ y: pageY - 100, animated: true });
      });
    }, 100); // delay helps with layout settling
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, [showOtpField]);


  const handleResendOtp = async () => {
    setCanResendOtp(false);
    setCountdown(OTP_TIMEOUT);
    setOtp("");
    await handleSendOtp();
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setVerifying(true);
    try {
      const response = await verifyOtp(callingCode, mobile, otp);
      console.log("Verify OTP Response:", response); // Log the response for debugging
      console.log("response.access_token", response.access_token);

      if (response?.status) {
        await setAuthToken(response.access_token)
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

            <View style={styles.textBottom}>
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
                        }}
                        containerButtonStyle={styles.countryPicker}
                      />
                      <Text style={styles.callingCode}>+{callingCode}</Text>
                      <TextInput
                        // ref={textInputRef}
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
                  </TouchableOpacity>

                  <Text style={styles.registerText}>
                    New user?{" "}
                    <Animated.Text
                      onPress={() => navigation.navigate("Register")}
                      style={[
                        styles.registerBold,
                        error.includes("not registered") && styles.highlightedRegister // Add this style
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
                      // ref={textInputRef}
                      ref={otpInputRef}
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor="#D3B58F"
                      keyboardType="numeric"
                      style={[styles.input, { textAlign: "center" }]}
                      value={otp}
                      onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ""))}
                      maxLength={6}
                    />
                  </View>
                  {/* <View style={styles.otpFooter}>
                    <Text style={styles.countdownText}>
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : ""}
                    </Text>
                    <TouchableOpacity
                      style={[styles.resendButton, !canResendOtp && styles.disabledButton]}
                      onPress={handleResendOtp}
                      disabled={!canResendOtp}
                    >
                      <Text style={styles.resendButtonText}>Resend OTP</Text>
                    </TouchableOpacity>
                  </View> */}
                  {/* 👇 New OTP text row */}
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

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
            </View>
          </Animated.View>
        </ScrollView>
      </ImageBackground>
      <Toast />
    </KeyboardAvoidingView>
  );
}

// Styles remain unchanged
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
    marginBottom: 450,
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
  otpFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 5,
  },
  countdownText: {
    color: "#FFECD2",
    fontSize: 14,
    flex: 1,
  },
  resendButton: {
    backgroundColor: "rgba(255, 242, 224, 0.2)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#FFECD2",
  },
  resendButtonText: {
    color: "#FFECD2",
    fontSize: 14,
    fontWeight: "500",
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
    bottom: 10,
  },
  registerBold: {
    fontWeight: "bold",
    color: "#FFD699",
  },
  highlightedRegister: {
    color: '#FF0000', // Red color
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
    color: "#FFD700", // Golden color to highlight
    marginLeft: 4,
    marginRight: 8,
  },
  resendText: {
    fontSize: 14,
    color: "#00BFFF", // Light Blue
    textDecorationLine: "underline",
  },

});

export default LoginScreen;