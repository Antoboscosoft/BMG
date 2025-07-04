// src/services/LocationService.js

// import BackgroundFetch from 'react-native-background-fetch';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import { sendUserLocation } from '../api/auth';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';


// check if location is enabled
export const checkIfLocationEnabled = async () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      () => resolve(true),
      (error) => {
        if (error.code === 2) {
          // Location is disabled
          resolve(false);
        } else {
          reject(error);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 5 * 60 * 60 * 1000, // 5 hours
      }
    );
  });
};

// request location permissions
export const requestLocationPermissions01 = async () => {
  if (Platform.OS === 'android') {
    try {
      // Step 1: Request foreground location
      const fineLocation = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location to function properly.',
          buttonPositive: 'Allow',
        }
      );

      if (fineLocation !== PermissionsAndroid.RESULTS.GRANTED) {
        return false;
      }
      console.log("Platform.Version", Platform.Version);

      // Step 2: Request background location separately (only Android 10+)
      if (Platform.Version >= 29) {
        const backgroundLocation = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: 'Background Location Permission',
            message:
              'App needs access to your location in the background for continuous tracking.',
            buttonPositive: 'Allow',
          }
        );

        return backgroundLocation === PermissionsAndroid.RESULTS.GRANTED;
      }

      return true;
    } catch (err) {
      console.warn('[Permission Error]', err);
      return false;
    }
  }

  // iOS - you’ll use Info.plist + request in App code
  return true;
};

// request location permissions
export const requestLocationPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ];

      if (Platform.Version >= 29) {
        permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      // const fineGranted =
      //   granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;
      // const backgroundGranted =
      //   Platform.Version < 29 || granted['android.permission.ACCESS_BACKGROUND_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;

      // return fineGranted && backgroundGranted;

      const fineGranted = granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted';
      const coarseGranted = granted['android.permission.ACCESS_COARSE_LOCATION'] === 'granted';
      const backgroundGranted =
        Platform.Version < 29 || granted['android.permission.ACCESS_BACKGROUND_LOCATION'] === 'granted';

      return fineGranted && coarseGranted && backgroundGranted;
    } catch (err) {
      console.warn('[Permission Error]', err);
      return false;
    }
  }

  return true;
};

// get current location
export const getCurrentLocation = async (isBackground = false) => {
  const hasPermission = await requestLocationPermissions();
  if (!hasPermission) {
    Alert.alert(
      'Location Permission Required',
      'Please enable location permissions in Settings to continue using this app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
    return null;
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationData = {
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        };
        console.log('📍 [Foreground Location:]', locationData);
        resolve(locationData);
        // Save to backend/local if needed
        // saveLocation(locationData);
      },
      (error) => {
        console.log('[Location Error]', error.message);
        // fallback to watchPosition in background
        if (Platform.OS === 'android') {
          const watchId = Geolocation.watchPosition(
            (pos) => {
              Geolocation.clearWatch(watchId);
              const fallbackLocation = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                timestamp: new Date().toISOString(),
              };
              console.log('📍 [Watch Fallback Location]:', fallbackLocation);
              resolve(fallbackLocation);
            },
            (watchErr) => {
              console.log('[❌ Watch Fallback Error]', watchErr.message);
              reject(watchErr);
            },
            {
              enableHighAccuracy: true,
              distanceFilter: 0,
              interval: 10000,
              fastestInterval: 5000,
            }
          );
        } else {
          reject(error);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: isBackground ? 60000 : 15000,
        maximumAge: 5 * 60 * 60 * 1000, // 5 hours
        forceRequestLocation: true,
      }
    );
  });
};

// save location in local if device offline
const saveLocationOffline = async () => {
  let pastLocations = (await AsyncStorage.getItem('locationHistory') || "[]");
  pastLocations = JSON.parse(pastLocations);
  pastLocations.push(position);
  await AsyncStorage.setItem('locationHistory', JSON.stringify(pastLocations));
}

// Background task to fetch & send location
export const onBackgroundFetch = async (taskId) => {
  try {
    const isConnected = (await NetInfo.fetch()).isConnected;

    const position = await getCurrentLocation(true); // Get current location
    if (position) {
      if (isConnected) {
        sendUserLocation(position).catch(saveLocationOffline); // save to DB
      } else {
        saveLocationOffline();
      }
    }
  } catch (e) {
    console.log('❌ Location Error:', e.message);
  }
};

// Send saved locations
export const sendSavedLocations = async () => {
  const locations = await AsyncStorage.getItem('locationHistory');
  if (locations) {
    const parsedLocations = JSON.parse(locations);
    try {
      for (const location of parsedLocations) {
        await sendUserLocation(location);
      }
    } catch (e) {
      console.log(e);
    }
    await AsyncStorage.removeItem('locationHistory');
  }
}