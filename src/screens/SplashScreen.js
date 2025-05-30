import React, { useState, useRef, useEffect } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  FlatList,
} from 'react-native';

import splashImg1 from '../asserts/images/ss1c.jpg';
import splashImg2 from '../asserts/images/splash1c.jpg';
import splashImg3 from '../asserts/images/spss4c.jpg';
import splashImg4 from '../asserts/images/ss2c.jpg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: 'slide1',
    titleTop: 'DON BOSCO MIGRANT SERVICES',
    description:
      'Works with the Unorganised workers & Migrants, Employers, Government, for a Decent work agenda and Dignified labour for intra and interstate workers.',
    image: splashImg1,
  },
  {
    key: 'slide2',
    titleTop: 'Support for Migrants',
    description:
      'Providing legal assistance, job support, health services, and language support to migrants.',
    image: splashImg2,
  },
  {
    key: 'slide3',
    titleTop: 'DON BOSCO MIGRANT SERVICES',
    description:
      'Works with the Unorganised workers & Migrants, Employers, Government, for a Decent work agenda and Dignified labour for intra and interstate workers.',
    image: splashImg4,
  },
  {
    key: 'slide4',
    titleTop: 'Your Journey Starts Here',
    description:
      'Join us to improve the lives of migrants and unorganized workers.',
    image: splashImg3,
  },
];

function SplashScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef();
  // smooth slide moovement:
  const scrollX = useRef(new Animated.Value(0)).current;

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  useEffect(() => {
    const checkTokenAndNavigate = async () => {
      try {
        // Check if token exists in AsyncStorage
        const token = await AsyncStorage.getItem('accessToken');
        // console.log("Token in SplashScreen:", token);

        // Simulate a delay for the splash screen (e.g., 2 seconds)
        setTimeout(() => {
          if (token) {
            console.log("Token found, navigating to Dashboard");
            navigation.replace('Dashboard');
          } else {
            console.log("No token found, navigating to Login");
            // navigation.replace('Login');
          }
          // navigation.replace(token ? 'Dashboard' : 'Login');
        },  1000);
      } catch (error) {
        console.error("Error checking token in SplashScreen:", error);
        // If there's an error, navigate to Login as a fallback
        navigation.replace('Login');
      }
    };

    checkTokenAndNavigate();
  }, [navigation]);

  useEffect(() => {
    // Fade-in animation on slide change
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      // setCurrentIndex(currentIndex + 1);
      const nextIndex = currentIndex + 1;
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      });
      setCurrentIndex(nextIndex);
    } else {
      // Last slide - navigate to Login
      navigation.replace('Login');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      {/* <Image source={item.image} style={styles.logo} resizeMode="cover" /> */}
      <FastImage
      source={item.image}
      style={styles.logo}
      resizeMode={FastImage.resizeMode.cover}
    />
      <View style={styles.overlay} />
      <View style={styles.bottomContainer}>
        <Text style={styles.titleTexttop}>{item.titleTop}</Text>
        <Text style={styles.titleText}>{item.description}</Text>
      </View>
    </View>
  );

  const currentSlide = slides[currentIndex];

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={slides}
        ref={flatListRef}
        renderItem={renderItem}
        horizontal
        pagingEnabled={false}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        keyExtractor={(item) => item.key}
        scrollEventThrottle={16}
      />

      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { opacity: currentIndex === index ? 1 : 0.4 },
            ]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default SplashScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  slide: {
    width,
    height,
    justifyContent: 'flex-end',
  },
  logo: {
    width,
    height,
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bottomContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  titleTexttop: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f0f0f0',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  button: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#2753b2',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
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
  dotsContainer: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginHorizontal: 6,
  },
});
