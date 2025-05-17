import React, { useState, useEffect, useRef } from 'react';
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
  Animated
} from 'react-native';
import loginImg from '../asserts/images/loginImg.jpg';
import CountryPicker from 'react-native-country-picker-modal';
import { CountryCode } from 'react-native-country-picker-modal';

const { width, height } = Dimensions.get('window');
const OTP_TIMEOUT = 30; // 30 seconds countdown

function LoginScreen({ navigation }) {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(OTP_TIMEOUT);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0]; // Corrected destructuring
  // const [countryCode, setCountryCode] = useState<CountryCode>('IN');
  const [countryCode, setCountryCode] = useState('IN');
  const [callingCode, setCallingCode] = useState('91');
  const [error, setError] = useState('');
  // const textInputRef = React.useRef(null);
    const textInputRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    // Start fade-in animation for the content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    if (otpSent && countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown(prev => prev - 1);
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
    navigation.navigate('Splash');
  };

  const validatePhoneNumber = () => {
    if (!mobile || mobile.length < 5) {
      setError('Please enter a valid mobile number.');
      return;
    }
    setError('');
    return true;
    navigation.navigate('Dashboard');
  };

  const handleSendOtp = () => {
    if (validatePhoneNumber()) {
      // Here you would typically call your OTP sending API
      console.log('OTP sent to', mobile);
      setShowOtpField(true);
      setOtpSent(true);
      setCountdown(OTP_TIMEOUT);
      setCanResendOtp(false);
    }
  }

  const handleResendOtp = () => {
    console.log('Resending OTP to', mobile);
    setCountdown(OTP_TIMEOUT);
    setCanResendOtp(false);
    setOtp('');
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  const handleVerifyOtp = () => {
    // Basic OTP validation - in real app you would verify with your backend
    if (otp.length === 6) { // Assuming 6-digit OTP
      navigation.navigate('Dashboard');
    } else {
      setError('Please enter a valid 6-digit OTP');
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
                <Text style={styles.backButtonText}>{'< Back'}</Text>
              </TouchableOpacity>

              {/* <View style={styles.textTop}> */}
              <Text style={styles.title}>MIGRANT WORKERS</Text>
              <View style={{ width: 60 }} /> 
            </View>

            <Text style={styles.subtitle}>Login</Text>

            <View style={styles.textBottom}>
              {/* <View style={styles.inputBox}>
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
                    placeholder="Mobile Number"
                    placeholderTextColor="#D3B58F"
                    keyboardType="phone-pad"
                    style={styles.input}
                    value={mobile}
                    onChangeText={(text) => setMobile(text.replace(/[^0-9]/g, ''))}
                    maxLength={15}
                  />
                </View>
              </View> */}
              {/* Phone Number Input */}
              {!showOtpField ? (
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
                    ref={textInputRef}
                    placeholder="Mobile Number"
                    placeholderTextColor="#D3B58F"
                    keyboardType="phone-pad"
                    style={[styles.input, { flex: 1 }]}
                    value={mobile}
                    onChangeText={(text) => setMobile(text.replace(/[^0-9]/g, ''))}
                    maxLength={15}
                  />
                </View>
              </TouchableOpacity>
              ) : (
                /* OTP Input with Countdown */
                <View style={styles.otpContainer}>
                <View style={styles.inputBox}>
                  <TextInput
                    ref={textInputRef}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#D3B58F"
                    keyboardType="numeric"
                    // keyboardType="number-pad"
                    style={[styles.input, { textAlign: 'center' }]}
                    value={otp}
                    onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
                    maxLength={6}
                  />
                </View>
                <View style={styles.otpFooter}>
                    <Text style={styles.countdownText}>
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : ''}
                    </Text>
                    <TouchableOpacity
                      style={[styles.resendButton, !canResendOtp && styles.disabledButton]}
                      onPress={handleResendOtp}
                      disabled={!canResendOtp}
                    >
                      <Text style={styles.resendButtonText}>Resend OTP</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Action Buttons */}
              {!showOtpField ? (
                <TouchableOpacity
                  style={[styles.button, !mobile || mobile.length < 10 ? styles.disabledButton : null]}
                  onPress={handleSendOtp}
                  activeOpacity={0.8}
                  disabled={!mobile || mobile.length < 10}
                >
                  <Text style={styles.buttonText}>Send OTP</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.button, otp.length !== 6 ? styles.disabledButton : null]}
                  onPress={handleVerifyOtp}
                  activeOpacity={0.8}
                  disabled={otp.length !== 6}
                >
                  <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
              )}
              
              {otpSent && !showOtpField && (
                <Text style={styles.otpNote}>OTP sent to +{callingCode} {mobile}</Text>
              )}
            </View>

              {/* <TouchableOpacity
                style={styles.button}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity> */}
            {/* </View> */}
          </Animated.View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

// Keep your existing styles exactly the same
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    // paddingTop: 80,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  backButton: {
    // position: 'absolute',
    // top: 20,
    // left: 20,
    // padding: 10,
    // paddingVertical: 6,
    // paddingHorizontal: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 242, 224, 0.2)',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFF2E0',
    fontWeight: 'bold',
  },
  textTop: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    // fontSize: 26,
    // color: '#FFF2E0',
    // fontWeight: 'bold',
    // textAlign: 'center',
    // justifyContent: 'center',
    // letterSpacing: 1.5,
    // textShadowColor: 'rgba(0, 0, 0, 0.5)',
    // textShadowOffset: { width: 1, height: 1 },
    // textShadowRadius: 4,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 22,
    color: '#FFF2E0',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#FFECD2',
    textAlign: 'center',
    // marginTop: 15,
    marginBottom: 450,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  textBottom: {
    // marginTop: 415,
    marginTop: 20,
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems: 'center',
  },
  inputBox: {
    backgroundColor: 'rgba(96, 51, 0, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 25,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFF2E0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // otp & resend buttons:
  otpContainer: {
    width: '100%',
    alignItems: 'center',
  },
  otpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 5,
  },
  countdownText: {
    color: '#FFECD2',
    fontSize: 14,
    flex: 1,
  },
  resendButton: {
    backgroundColor: 'rgba(255, 242, 224, 0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#FFECD2',
  },
  resendButtonText: {
    color: '#FFECD2',
    fontSize: 14,
    fontWeight: '500',
  },
  // phone number style:
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryPicker: {
    marginRight: 8,
  },
  callingCode: {
    color: '#FFF7E7',
    fontSize: 18,
    marginRight: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    // marginTop: -20,
    marginBottom: 10,
    // alignSelf: 'flex-start',
    // paddingHorizontal: 10,
    alignSelf: 'center',
    textAlign: 'center',
  },
  input: {
    fontSize: 18,
    color: '#FFF7E7',
  },
  button: {
    backgroundColor: '#FFF2E0',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#FFECD2',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#3D2A1A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  otpNote: {
    color: '#FFECD2',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default LoginScreen;