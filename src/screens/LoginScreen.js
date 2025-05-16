import React, { useState, useEffect } from 'react';
import { Dimensions, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, View, Animated } from 'react-native';
import loginImg from '../asserts/images/loginImg.jpg';

const { width, height } = Dimensions.get('window');

function LoginScreen({ navigation }) {
  const [mobile, setMobile] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0]; // Animation for fade-in effect

  useEffect(() => {
    // Start fade-in animation for the content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const navigateToDashboard = () => {
    navigation.navigate('Splash');
  };

  const handleContinue = () => {
    navigation.navigate('Dashboard');
  };

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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigateToDashboard()}
            >
              <Text style={styles.backButtonText}>{'< Back'}</Text>
            </TouchableOpacity>
            <View style={styles.textTop}>
              <Text style={styles.title}>MIGRANT WORKERS</Text>
              <Text style={styles.subtitle}>Login </Text>
            </View>
            <View style={styles.textBottom}>
              <View style={styles.inputBox}>
                <TextInput
                  placeholder="Mobile Number"
                  placeholderTextColor="#D3B58F"
                  keyboardType="phone-pad"
                  style={styles.input}
                  value={mobile}
                  onChangeText={setMobile}
                />
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay for better text readability
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 80,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 242, 224, 0.2)', // Subtle background for the back button
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
    fontSize: 32, // Slightly larger for emphasis
    color: '#FFF2E0',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)', // Shadow for better readability
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    color: '#FFECD2',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  textBottom: {
    // marginTop: 399, // Adjusted slightly for better positioning
    marginTop: 415, // Adjusted slightly for better positioning
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems: 'center',
  },
  inputBox: {
    backgroundColor: 'rgba(96, 51, 0, 0.9)', // Slightly more opaque for better contrast
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 25,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFF2E0', // Subtle border to match the theme
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  input: {
    fontSize: 16,
    color: '#FFF7E7',
  },
  button: {
    backgroundColor: '#FFF2E0',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    elevation: 5, // Increased shadow for a "popping" effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#FFECD2',
  },
  buttonText: {
    color: '#3D2A1A',
    fontSize: 18,
    fontWeight: 'bold',
  },
});