import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const NetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0)); // For fade animation

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected && state.isInternetReachable);
      setIsVisible(!state.isConnected);
    });

    // Fetch initial network state
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected && state.isInternetReachable);
        setIsVisible(!state.isConnected);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

//   useEffect(() => {
//     // Animate the message in/out based on connection status
//     Animated.timing(fadeAnim, {
//       toValue: isConnected ? 0 : 1,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   }, [isConnected, isVisible, fadeAnim]);

useEffect(() => {
  let timer;
  if (isConnected) {
    timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 3000); // Hide after 3 seconds
  } else {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }
  return () => clearTimeout(timer);
}, [isConnected, fadeAnim]);

  if (isConnected) return null; // Don't render anything if connected

    if (!isVisible) return null; // Don't render if not visible

  return (
    // <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
    //   <View style={styles.messageContainer}>
    //     <Text style={styles.messageText}>No Internet Connection</Text>
    //     <TouchableOpacity onPress={() => NetInfo.fetch().then((state) => setIsConnected(state.isConnected && state.isInternetReachable))}>
    //       <Text style={styles.retryText}>Retry</Text>
    //     </TouchableOpacity>
    //   </View>
    // </Animated.View>
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View
        style={[
          styles.messageContainer,
          { backgroundColor: isConnected ? '#4CAF50' : '#D32F2F' },
        ]}
      >
        <Text style={styles.messageText}>
          {isConnected ? 'Internet is Connected' : 'No Internet Connection'}
        </Text>
        <View style={styles.buttonContainer}>
          {!isConnected && (
            <TouchableOpacity
              onPress={() =>
                NetInfo.fetch().then((state) =>
                  setIsConnected(state.isConnected && state.isInternetReachable)
                )
              }
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setIsVisible(false)}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000, // Ensure it appears above other components
  },
  messageContainer: {
    backgroundColor: '#D32F2F', // Red background for visibility
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  messageText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  retryText: {
    color: '#FFD700', // Yellow for retry button
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
  },
});

export default NetworkStatus;