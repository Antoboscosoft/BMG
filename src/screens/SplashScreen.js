import React, { useEffect, useRef } from 'react'
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
// import splashImg from '../asserts/images/splashscreen.png'
// import splashImg from '../asserts/images/splashscreen01.png'
import splashImg from '../asserts/images/sps1.jpg'
function SplashScreen({ navigation }) {

  //   useEffect(() => {
  //   // Simulate loading (3 sec), then navigate to Login
  //   const timer = setTimeout(() => {
  //     navigation.replace('Login');
  //   }, 533000);
  //   return () => clearTimeout(timer);
  // }, []);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image
        // source={require('../../assets/images/splash.png')} // replace with your image path
        source={splashImg}
        style={styles.logo}
        resizeMode="cover" // change to 'contain' if you want it to show entire image without cropping
      />
      {/* Overlay to improve text readability */}
      <View style={styles.overlay} />
      <View style={styles.bottomContainer}>
        <Text style={styles.titleTexttop}>DON BOSCO MIGRANT DBMS</Text>
        <Text style={styles.titleText}>
          Works with the Unorganised workers & Migrants, Employers, Government, for a Decent work agenda
          and Dignified labour for intra and interstate workers.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

export default SplashScreen


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    // height: '70%',
    height: '100%',
    // resizeMode: 'stretch',
    position: 'absolute'
  },
  // button: {
  //   // marginTop: 30,
  //   position: 'absolute',
  //   bottom: 50, // Position near the bottom, adjusted to align with the image
  //   paddingHorizontal: 30,
  //   paddingVertical: 12,
  //   backgroundColor: '#b8c9dd',
  //   borderRadius: 10,
  //   // color: '#000'
  // },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay to improve text readability
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 40, // Adjust this value as needed
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  titleTexttop: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff', // White for contrast against the image
    marginBottom: 15, // Space between title and button
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)', // Add shadow for better readability
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f0f0f0', // White for contrast against the image
    marginBottom: 25, // Space between title and button
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    backgroundColor: '#2753b2',
    borderRadius: 12,
    elevation: 3, // Add shadow for depth (Android)
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,

  },
});