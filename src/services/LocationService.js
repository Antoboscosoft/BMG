// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Geolocation from 'react-native-geolocation-service';
// import { PermissionsAndroid, Platform, Alert, Linking, NativeModules } from 'react-native';
// import BackgroundFetch from 'react-native-background-fetch';
// import NetInfo from '@react-native-community/netinfo';
// import notifee, { AndroidImportance } from '@notifee/react-native';
// import { sendUserLocation } from '../api/auth'; // Adjust path as needed

// // Constants
// const PENDING_LOCATIONS_KEY = 'pending_locations';
// const LOCATION_STORAGE_KEY = 'last_location';
// const FAILED_ATTEMPTS_KEY = 'fetch_failed_attempts';
// const MIN_BACKEND_SAVE_INTERVAL = 10 * 60 * 1000; // 10 minutes
// const BACKGROUND_FETCH_INTERVAL = 15; // 15 minutes
// const LOCATION_TIMEOUT = 15000; // 15 seconds timeout

// let isTrackingInitialized = false;
// let netListener;

// // Request Location Permissions
// export const requestLocationPermissions = async () => {
//   if (Platform.OS === 'android') {
//     try {
//       const permissions = [
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
//       ];
//       if (Platform.Version >= 29) {
//         permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
//       }
//       const granted = await PermissionsAndroid.requestMultiple(permissions);
//       const allGranted =
//         granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted' &&
//         granted['android.permission.ACCESS_COARSE_LOCATION'] === 'granted' &&
//         (Platform.Version < 29 || granted['android.permission.ACCESS_BACKGROUND_LOCATION'] === 'granted');
//       if (!allGranted) {
//         console.warn('[📍] Some location permissions denied:', granted);
//         Alert.alert(
//           'Location Permission Denied',
//           'Please enable all location permissions in Settings for background tracking to work.',
//           [
//             { text: 'Cancel', style: 'cancel' },
//             { text: 'Open Settings', onPress: () => Linking.openSettings() },
//           ]
//         );
//       }
//       return allGranted;
//     } catch (err) {
//       console.error('[📍] Permission error:', err);
//       return false;
//     }
//   }
//   return true; // iOS permissions handled by Geolocation
// };

// // Check Battery Optimization (Android)
// const checkBatteryOptimization = async () => {
//   if (Platform.OS === 'android') {
//     try {
//       const PowerManager = NativeModules.PowerManager;
//       if (PowerManager) {
//         const isIgnoring = await PowerManager.isIgnoringBatteryOptimizations();
//         if (!isIgnoring) {
//           Alert.alert(
//             'Battery Optimization',
//             'For reliable background location tracking, please disable battery optimization for this app.',
//             [
//               { text: 'Later', style: 'cancel' },
//               { text: 'Open Settings', onPress: () => PowerManager.openBatterySettings() },
//             ]
//           );
//         }
//       }
//     } catch (error) {
//       console.error('[📍] Battery optimization check error:', error);
//     }
//   }
// };

// // Start Foreground Service (Android)
// const startForegroundService = async () => {
//   if (Platform.OS === 'android') {
//     try {
//       await notifee.createChannel({
//         id: 'location',
//         name: 'Location Tracking',
//         importance: AndroidImportance.HIGH,
//       });
//       await notifee.displayNotification({
//         id: 'location-tracking',
//         title: 'Location Tracking Active',
//         body: 'App is tracking your location in the background.',
//         android: {
//           channelId: 'location',
//           asForegroundService: true,
//           ongoing: true,
//           smallIcon: 'ic_launcher', // Ensure this exists in res/drawable
//           pressAction: { id: 'default' },
//         },
//       });
//     } catch (error) {
//       console.error('[📍] Foreground service error:', error);
//     }
//   }
// };

// // Stop Foreground Service
// const stopForegroundService = async () => {
//   if (Platform.OS === 'android') {
//     try {
//       await notifee.stopForegroundService();
//       await notifee.cancelNotification('location-tracking');
//     } catch (error) {
//       console.error('[📍] Stop foreground service error:', error);
//     }
//   }
// };

// // Get Current Location
// export const getCurrentLocation = async (isBackground = false) => {
//   return new Promise((resolve, reject) => {
//     const timeout = isBackground ? 60000 : LOCATION_TIMEOUT;

//     const watchId = Geolocation.getCurrentPosition(
//       (position) => {
//         const locationData = {
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//           timestamp: new Date().toISOString(),
//         };
//         console.log('[📍] Location captured:', locationData);
//         Geolocation.clearWatch(watchId);
//         resolve(locationData);
//       },
//       (error) => {
//         console.error('[📍] Location error:', error);
//         Geolocation.clearWatch(watchId);
//         reject(error);
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: timeout,
//         maximumAge: 0,
//         distanceFilter: 0,
//         forceRequestLocation: Platform.OS === 'android',
//         showLocationDialog: true,
//       }
//     );

//     setTimeout(() => {
//       Geolocation.clearWatch(watchId);
//       reject(new Error('Location request timed out'));
//     }, timeout + 1000);
//   });
// };

// // Fetch with Retry
// const fetchWithRetry = async (isBackground, retries = 3) => {
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       return await getCurrentLocation(isBackground);
//     } catch (error) {
//       console.error(`[📍] Location fetch attempt ${attempt} failed:`, error);
//       if (attempt === retries) throw error;
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//     }
//   }
// };

// // Store Pending Location
// export const storePendingLocation = async (locationData) => {
//   try {
//     const existingLocations = await getPendingLocations();
//     existingLocations.push(locationData);
//     await AsyncStorage.setItem(PENDING_LOCATIONS_KEY, JSON.stringify(existingLocations));
//     console.log('[📍] Stored pending location:', locationData);
//     await storeLastLocation(locationData);
//   } catch (error) {
//     console.error('[📍] Store pending location error:', error);
//   }
// };

// // Get Pending Locations
// const getPendingLocations = async () => {
//   try {
//     const locations = await AsyncStorage.getItem(PENDING_LOCATIONS_KEY);
//     return locations ? JSON.parse(locations) : [];
//   } catch (error) {
//     console.error('[📍] Get pending locations error:', error);
//     return [];
//   }
// };

// // Clear Pending Locations
// const clearPendingLocations = async () => {
//   try {
//     await AsyncStorage.removeItem(PENDING_LOCATIONS_KEY);
//     console.log('[📍] Cleared pending locations');
//   } catch (error) {
//     console.error('[📍] Clear pending locations error:', error);
//   }
// };

// // Store Last Location
// const storeLastLocation = async (locationData) => {
//   try {
//     await AsyncStorage.setItem(
//       LOCATION_STORAGE_KEY,
//       JSON.stringify({
//         ...locationData,
//         lastSentTimestamp: new Date().toISOString(),
//       })
//     );
//     console.log('[📍] Stored last location:', locationData);
//   } catch (error) {
//     console.error('[📍] Store last location error:', error);
//   }
// };

// // Get Last Location
// export const getLastLocation = async () => {
//   try {
//     const location = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
//     return location ? JSON.parse(location) : null;
//   } catch (error) {
//     console.error('[📍] Get last location error:', error);
//     return null;
//   }
// };

// // Sync Pending Locations with Backend
// export const syncPendingLocations = async () => {
//   try {
//     const pendingLocations = await getPendingLocations();
//     if (pendingLocations.length === 0) {
//       console.log('[📍] No pending locations to sync');
//       return;
//     }

//     const lastLocation = await getLastLocation();
//     const lastSentTime = lastLocation?.lastSentTimestamp
//       ? new Date(lastLocation.lastSentTimestamp).getTime()
//       : 0;
//     const now = Date.now();

//     // Only send if enough time has passed since last sync
//     if (now - lastSentTime < MIN_BACKEND_SAVE_INTERVAL) {
//       console.log('[📍] Skipping sync: within minimum interval');
//       return;
//     }

//     for (const location of pendingLocations) {
//       try {
//         await sendUserLocation(location); // Assumes this API call sends location to backend
//         console.log('[📍] Synced location:', location);
//       } catch (error) {
//         console.error('[📍] Failed to sync location:', location, error);
//         throw error; // Stop syncing to preserve failed locations
//       }
//     }

//     // Clear pending locations after successful sync
//     await clearPendingLocations();
//     console.log('[📍] All pending locations synced successfully');
//   } catch (error) {
//     console.error('[📍] Sync pending locations error:', error);
//     throw error;
//   }
// };

// // Configure Background Fetch
// const configureBackgroundFetch = async () => {
//   try {
//     await BackgroundFetch.configure(
//       {
//         minimumFetchInterval: BACKGROUND_FETCH_INTERVAL,
//         stopOnTerminate: false,
//         startOnBoot: true,
//         enableHeadless: true,
//         forceAlarmManager: true,
//       },
//       async (taskId) => {
//         console.log('[📍] Background fetch triggered:', taskId);
//         try {
//           const location = await fetchWithRetry(true);
//           if (location) {
//             await storePendingLocation(location);
//             const failedAttempts = parseInt(await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY) || '0');
//             try {
//               const state = await NetInfo.fetch();
//               if (state.isConnected) {
//                 await syncPendingLocations();
//                 await AsyncStorage.setItem(FAILED_ATTEMPTS_KEY, '0');
//               }
//             } catch (syncError) {
//               const newAttempts = failedAttempts + 1;
//               await AsyncStorage.setItem(FAILED_ATTEMPTS_KEY, newAttempts.toString());
//               console.log(`[📍] Sync failed. Attempt ${newAttempts}.`);
//             }
//           }
//         } catch (error) {
//           console.error('[📍] Background fetch error:', error);
//         } finally {
//           BackgroundFetch.finish(taskId);
//         }
//       },
//       async (taskId) => {
//         console.log('[📍] Background fetch timeout:', taskId);
//         const failedAttempts = parseInt(await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY) || '0') + 1;
//         await AsyncStorage.setItem(FAILED_ATTEMPTS_KEY, failedAttempts.toString());
//         BackgroundFetch.finish(taskId);
//       }
//     );

//     if (Platform.OS === 'android') {
//       await BackgroundFetch.scheduleTask({
//         taskId: 'com.boscosoft.dbms',
//         delay: 10 * 60 * 1000, // 10 minutes
//         periodic: true,
//         forceAlarmManager: true,
//         stopOnTerminate: false,
//         enableHeadless: true,
//       });
//     }
//     console.log('[📍] Background fetch configured');
//   } catch (error) {
//     console.error('[📍] Background fetch configuration error:', error);
//   }
// };

// // Start Location Tracking
// export const startLocationTracking = async () => {
//   if (isTrackingInitialized) {
//     console.log('[📍] Location tracking already initialized');
//     return;
//   }

//   const hasPermission = await requestLocationPermissions();
//   if (!hasPermission) {
//     console.log('[📍] Location permissions not granted');
//     return;
//   }

//   await checkBatteryOptimization();
//   await startForegroundService();
//   await configureBackgroundFetch();

//   // Initial location fetch
//   try {
//     const location = await fetchWithRetry(false);
//     if (location) {
//       await storePendingLocation(location);
//       const state = await NetInfo.fetch();
//       if (state.isConnected) {
//         await syncPendingLocations();
//       }
//     }
//   } catch (error) {
//     console.error('[📍] Initial location fetch error:', error);
//   }

//   // Monitor network state for syncing
//   netListener = NetInfo.addEventListener((state) => {
//     if (state.isConnected) {
//       console.log('[📍] Network connected, syncing pending locations');
//       syncPendingLocations().catch((error) =>
//         console.error('[📍] Network sync error:', error)
//       );
//     }
//   });

//   isTrackingInitialized = true;
//   console.log('[📍] Location tracking started');
// };

// // Stop Location Tracking
// export const stopLocationTracking = async () => {
//   if (!isTrackingInitialized) {
//     console.log('[📍] Location tracking not initialized');
//     return;
//   }
//   isTrackingInitialized = false;
//   if (netListener) netListener();
//   await stopForegroundService();
//   console.log('[📍] Location tracking stopped');
// };

// // Handle App State Changes
// export const handleAppStateChange = async (nextAppState) => {
//   console.log('[📍] App state changed to:', nextAppState);
//   if (nextAppState === 'active' && isTrackingInitialized) {
//     try {
//       const location = await fetchWithRetry(false);
//       if (location) {
//         await storePendingLocation(location);
//         const state = await NetInfo.fetch();
//         if (state.isConnected) {
//           await syncPendingLocations();
//         }
//       }
//     } catch (error) {
//       console.error('[📍] Foreground location fetch error:', error);
//     }
//   }
// };


import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert, Linking, NativeModules } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import NetInfo from '@react-native-community/netinfo';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { sendUserLocation } from '../api/auth';

// Constants
const PENDING_LOCATIONS_KEY = 'pending_locations';
const LOCATION_STORAGE_KEY = 'last_location';
const FAILED_ATTEMPTS_KEY = 'fetch_failed_attempts';
const MIN_BACKEND_SAVE_INTERVAL = 10 * 60 * 1000; // 10 minutes
const BACKGROUND_FETCH_INTERVAL = 15; // 15 minutes
const LOCATION_TIMEOUT = 30000; // 30 seconds timeout for background
const FOREGROUND_TIMEOUT = 15000; // 15 seconds for foreground

let isTrackingInitialized = false;
let netListener;
let backgroundTaskId = null;

// Request Location Permissions
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
      const allGranted =
        granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted' &&
        granted['android.permission.ACCESS_COARSE_LOCATION'] === 'granted' &&
        (Platform.Version < 29 || granted['android.permission.ACCESS_BACKGROUND_LOCATION'] === 'granted');
      
      if (!allGranted) {
        console.warn('[📍] Some location permissions denied:', granted);
        Alert.alert(
          'Location Permission Required',
          'Please enable all location permissions in Settings for background tracking to work properly.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
      return allGranted;
    } catch (err) {
      console.error('[📍] Permission error:', err);
      return false;
    }
  }
  return true;
};

// Check Battery Optimization (Android)
export const checkBatteryOptimization = async () => {
  if (Platform.OS === 'android') {
    try {
      const PowerManager = NativeModules.PowerManager;
      if (PowerManager) {
        const isIgnoring = await PowerManager.isIgnoringBatteryOptimizations();
        if (!isIgnoring) {
          Alert.alert(
            'Battery Optimization',
            'For reliable background location tracking, please disable battery optimization for this app.',
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Open Settings', onPress: () => PowerManager.openBatterySettings() },
            ]
          );
        }
        return isIgnoring;
      }
    } catch (error) {
      console.error('[📍] Battery optimization check error:', error);
    }
  }
  return true;
};

// Start Foreground Service (Android)
const startForegroundService = async () => {
  if (Platform.OS === 'android') {
    try {
      await notifee.createChannel({
        id: 'location',
        name: 'Location Tracking',
        importance: AndroidImportance.HIGH,
      });
      
      await notifee.displayNotification({
        id: 'location-tracking',
        title: 'Location Tracking Active',
        body: 'App is tracking your location every 10 minutes.',
        android: {
          channelId: 'location',
          asForegroundService: true,
          ongoing: true,
          smallIcon: 'ic_launcher',
          pressAction: { id: 'default' },
        },
      });
      console.log('[📍] Foreground service started');
    } catch (error) {
      console.error('[📍] Foreground service error:', error);
    }
  }
};

// Stop Foreground Service
const stopForegroundService = async () => {
  if (Platform.OS === 'android') {
    try {
      await notifee.stopForegroundService();
      await notifee.cancelNotification('location-tracking');
      console.log('[📍] Foreground service stopped');
    } catch (error) {
      console.error('[📍] Stop foreground service error:', error);
    }
  }
};

// Get Current Location with improved error handling
export const getCurrentLocation = async (isBackground = false) => {
  return new Promise((resolve, reject) => {
    const timeout = isBackground ? LOCATION_TIMEOUT : FOREGROUND_TIMEOUT;
    let timeoutId;
    
    const options = {
      enableHighAccuracy: true,
      timeout: timeout,
      maximumAge: isBackground ? 5 * 60 * 1000 : 0, // 5 minutes for background
      distanceFilter: 0,
      forceRequestLocation: Platform.OS === 'android',
      showLocationDialog: !isBackground,
    };

    const successCallback = (position) => {
      if (timeoutId) clearTimeout(timeoutId);
      
      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString(),
        source: isBackground ? 'background' : 'foreground',
      };
      
      console.log('[📍] Location captured:', locationData);
      resolve(locationData);
    };

    const errorCallback = (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      console.error('[📍] Location error:', error);
      reject(error);
    };

    // Set manual timeout
    timeoutId = setTimeout(() => {
      reject(new Error('Location request timed out'));
    }, timeout + 2000);

    Geolocation.getCurrentPosition(successCallback, errorCallback, options);
  });
};

// Fetch with Retry Logic
const fetchWithRetry = async (isBackground, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[📍] Location fetch attempt ${attempt}/${retries}`);
      const location = await getCurrentLocation(isBackground);
      return location;
    } catch (error) {
      console.error(`[📍] Location fetch attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        throw new Error(`Failed to get location after ${retries} attempts: ${error.message}`);
      }
      
      // Wait before retry (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
};

// Store Pending Location
export const storePendingLocation = async (locationData) => {
  try {
    const existingLocations = await getPendingLocations();
    const newLocation = {
      ...locationData,
      storedAt: new Date().toISOString(),
    };
    
    existingLocations.push(newLocation);
    await AsyncStorage.setItem(PENDING_LOCATIONS_KEY, JSON.stringify(existingLocations));
    console.log('[📍] Stored pending location:', newLocation);
    
    // Also store as last location
    await storeLastLocation(newLocation);
  } catch (error) {
    console.error('[📍] Store pending location error:', error);
  }
};

// Get Pending Locations
const getPendingLocations = async () => {
  try {
    const locations = await AsyncStorage.getItem(PENDING_LOCATIONS_KEY);
    return locations ? JSON.parse(locations) : [];
  } catch (error) {
    console.error('[📍] Get pending locations error:', error);
    return [];
  }
};

// Clear Pending Locations
const clearPendingLocations = async () => {
  try {
    await AsyncStorage.removeItem(PENDING_LOCATIONS_KEY);
    console.log('[📍] Cleared pending locations');
  } catch (error) {
    console.error('[📍] Clear pending locations error:', error);
  }
};

// Store Last Location
const storeLastLocation = async (locationData) => {
  try {
    await AsyncStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify({
        ...locationData,
        lastSentTimestamp: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error('[📍] Store last location error:', error);
  }
};

// Get Last Location
export const getLastLocation = async () => {
  try {
    const location = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
    return location ? JSON.parse(location) : null;
  } catch (error) {
    console.error('[📍] Get last location error:', error);
    return null;
  }
};

// Sync Pending Locations with Backend
export const syncPendingLocations = async () => {
  try {
    const pendingLocations = await getPendingLocations();
    if (pendingLocations.length === 0) {
      console.log('[📍] No pending locations to sync');
      return;
    }

    const lastLocation = await getLastLocation();
    const lastSentTime = lastLocation?.lastSentTimestamp
      ? new Date(lastLocation.lastSentTimestamp).getTime()
      : 0;
    const now = Date.now();

    // Check if enough time has passed
    if (now - lastSentTime < MIN_BACKEND_SAVE_INTERVAL) {
      console.log(`[📍] Skipping sync: only ${Math.round((now - lastSentTime) / 1000)}s since last sync`);
      return;
    }

    console.log(`[📍] Syncing ${pendingLocations.length} pending locations`);
    
    let syncedCount = 0;
    for (const location of pendingLocations) {
      try {
        await sendUserLocation(location);
        syncedCount++;
        console.log('[📍] Synced location:', location);
      } catch (error) {
        console.error('[📍] Failed to sync location:', location, error.message);
        // Don't break the loop, try to sync remaining locations
      }
    }

    if (syncedCount > 0) {
      await clearPendingLocations();
      console.log(`[📍] Successfully synced ${syncedCount}/${pendingLocations.length} locations`);
    }
  } catch (error) {
    console.error('[📍] Sync pending locations error:', error);
  }
};

// Background Fetch Handler
const backgroundFetchHandler = async (taskId) => {
  console.log(`[📍] Background fetch triggered: ${taskId} at ${new Date().toISOString()}`);
  
  try {
    // Get location with retry
    const location = await fetchWithRetry(true, 2); // Only 2 retries for background
    
    if (location) {
      await storePendingLocation(location);
      
      // Check network and try to sync
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        try {
          await syncPendingLocations();
          await AsyncStorage.setItem(FAILED_ATTEMPTS_KEY, '0');
        } catch (syncError) {
          console.error('[📍] Background sync failed:', syncError);
          const failedAttempts = parseInt(await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY) || '0') + 1;
          await AsyncStorage.setItem(FAILED_ATTEMPTS_KEY, failedAttempts.toString());
        }
      } else {
        console.log('[📍] No network connection, location stored for later sync');
      }
    }
  } catch (error) {
    console.error('[📍] Background fetch error:', error);
    const failedAttempts = parseInt(await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY) || '0') + 1;
    await AsyncStorage.setItem(FAILED_ATTEMPTS_KEY, failedAttempts.toString());
  } finally {
    BackgroundFetch.finish(taskId);
  }
};

// Background Fetch Timeout Handler
const backgroundFetchTimeoutHandler = async (taskId) => {
  console.log(`[📍] Background fetch timeout: ${taskId}`);
  const failedAttempts = parseInt(await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY) || '0') + 1;
  await AsyncStorage.setItem(FAILED_ATTEMPTS_KEY, failedAttempts.toString());
  BackgroundFetch.finish(taskId);
};

// Configure Background Fetch
const configureBackgroundFetch = async () => {
  try {
    await BackgroundFetch.configure(
      {
        minimumFetchInterval: BACKGROUND_FETCH_INTERVAL,
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
        forceAlarmManager: Platform.OS === 'android',
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE,
      },
      backgroundFetchHandler,
      backgroundFetchTimeoutHandler
    );

    // Schedule periodic task for Android
    if (Platform.OS === 'android') {
      backgroundTaskId = 'com.boscosoft.dbms.location';
      await BackgroundFetch.scheduleTask({
        taskId: backgroundTaskId,
        delay: 10 * 60 * 1000, // 10 minutes
        periodic: true,
        forceAlarmManager: true,
        stopOnTerminate: false,
        enableHeadless: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE,
      });
    }
    
    console.log('[📍] Background fetch configured successfully');
  } catch (error) {
    console.error('[📍] Background fetch configuration error:', error);
    throw error;
  }
};

// Start Location Tracking
export const startLocationTracking = async () => {
  if (isTrackingInitialized) {
    console.log('[📍] Location tracking already initialized');
    return true;
  }

  try {
    // Request permissions
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) {
      console.log('[📍] Location permissions not granted');
      return false;
    }

    // Check battery optimization
    await checkBatteryOptimization();

    // Start foreground service
    await startForegroundService();

    // Configure background fetch
    await configureBackgroundFetch();

    // Initial location fetch
    try {
      const location = await fetchWithRetry(false);
      if (location) {
        await storePendingLocation(location);
        
        // Try initial sync
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected) {
          await syncPendingLocations();
        }
      }
    } catch (error) {
      console.error('[📍] Initial location fetch failed:', error);
    }

    // Monitor network state for syncing
    netListener = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        console.log('[📍] Network connected, attempting to sync pending locations');
        syncPendingLocations().catch((error) =>
          console.error('[📍] Network sync error:', error)
        );
      }
    });

    isTrackingInitialized = true;
    console.log('[📍] Location tracking started successfully');
    return true;
  } catch (error) {
    console.error('[📍] Failed to start location tracking:', error);
    return false;
  }
};

// Stop Location Tracking
export const stopLocationTracking = async () => {
  if (!isTrackingInitialized) {
    console.log('[📍] Location tracking not initialized');
    return;
  }

  try {
    isTrackingInitialized = false;
    
    // Remove network listener
    if (netListener) {
      netListener();
      netListener = null;
    }

    // Stop foreground service
    await stopForegroundService();

    // Stop background fetch
    if (backgroundTaskId) {
      await BackgroundFetch.stop(backgroundTaskId);
      backgroundTaskId = null;
    }

    console.log('[📍] Location tracking stopped');
  } catch (error) {
    console.error('[📍] Error stopping location tracking:', error);
  }
};

// Handle App State Changes
export const handleAppStateChange = async (nextAppState) => {
  console.log('[📍] App state changed to:', nextAppState);
  
  if (nextAppState === 'active' && isTrackingInitialized) {
    try {
      // Sync any pending locations when app becomes active
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        await syncPendingLocations();
      }
      
      // Get fresh location
      const location = await fetchWithRetry(false);
      if (location) {
        await storePendingLocation(location);
        
        if (netInfo.isConnected) {
          await syncPendingLocations();
        }
      }
    } catch (error) {
      console.error('[📍] Foreground location fetch error:', error);
    }
  }
};

// Get tracking status
export const getTrackingStatus = () => {
  return {
    isInitialized: isTrackingInitialized,
    hasNetworkListener: !!netListener,
    backgroundTaskId: backgroundTaskId,
  };
};



// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Geolocation from 'react-native-geolocation-service';
// import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
// import BackgroundFetch from 'react-native-background-fetch';
// import NetInfo from '@react-native-community/netinfo';
// import notifee, { AndroidImportance } from '@notifee/react-native';
// import { sendUserLocation } from '../api/auth';

// // Constants
// const PENDING_LOCATIONS_KEY = 'pending_locations';
// const LOCATION_STORAGE_KEY = 'last_location';
// const BACKGROUND_FETCH_INTERVAL = 10; // 10 minutes in minutes
// const LOCATION_TIMEOUT = 15000; // 15 seconds
// const MAX_LOCATION_AGE = 60000; // 1 minute

// let isTrackingInitialized = false;
// let netListener = null;

// // Request Location Permissions
// export const requestLocationPermissions = async () => {
//   if (Platform.OS === 'android') {
//     try {
//       const permissions = [
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
//       ];
      
//       if (Platform.Version >= 29) {
//         permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
//       }
      
//       const granted = await PermissionsAndroid.requestMultiple(permissions);
      
//       const allGranted = Object.values(granted).every(permission => permission === 'granted');
      
//       if (!allGranted) {
//         console.warn('[📍] Some location permissions denied:', granted);
//         Alert.alert(
//           'Location Permission Required',
//           'Please enable all location permissions in Settings for background tracking to work properly.',
//           [
//             { text: 'Cancel', style: 'cancel' },
//             { text: 'Open Settings', onPress: () => Linking.openSettings() },
//           ]
//         );
//       }
      
//       return allGranted;
//     } catch (err) {
//       console.error('[📍] Permission error:', err);
//       return false;
//     }
//   }
//   return true; // iOS permissions handled by Geolocation
// };

// // Start Foreground Service (Android)
// const startForegroundService = async () => {
//   if (Platform.OS === 'android') {
//     try {
//       await notifee.createChannel({
//         id: 'location-tracking',
//         name: 'Location Tracking',
//         importance: AndroidImportance.LOW,
//         sound: null,
//       });
      
//       await notifee.displayNotification({
//         id: 'location-service',
//         title: 'Location Tracking Active',
//         body: 'App is tracking your location every 10 minutes',
//         android: {
//           channelId: 'location-tracking',
//           asForegroundService: true,
//           ongoing: true,
//           smallIcon: 'ic_launcher',
//           pressAction: { id: 'default' },
//           actions: [
//             {
//               title: 'Stop Tracking',
//               pressAction: { id: 'stop-tracking' },
//             },
//           ],
//         },
//       });
//     } catch (error) {
//       console.error('[📍] Foreground service error:', error);
//     }
//   }
// };

// // Stop Foreground Service
// const stopForegroundService = async () => {
//   if (Platform.OS === 'android') {
//     try {
//       await notifee.stopForegroundService();
//       await notifee.cancelNotification('location-service');
//     } catch (error) {
//       console.error('[📍] Stop foreground service error:', error);
//     }
//   }
// };

// // Get Current Location with improved error handling
// export const getCurrentLocation = async (isBackground = false) => {
//   return new Promise((resolve, reject) => {
//     const timeout = isBackground ? 30000 : LOCATION_TIMEOUT;
//     let watchId = null;
//     let hasResolved = false;

//     const options = {
//       enableHighAccuracy: true,
//       timeout: timeout,
//       maximumAge: isBackground ? MAX_LOCATION_AGE : 0,
//       distanceFilter: 0,
//       forceRequestLocation: Platform.OS === 'android',
//       showLocationDialog: !isBackground,
//     };

//     const timeoutId = setTimeout(() => {
//       if (!hasResolved) {
//         hasResolved = true;
//         if (watchId !== null) {
//           Geolocation.clearWatch(watchId);
//         }
//         reject(new Error('Location request timed out'));
//       }
//     }, timeout + 5000);

//     watchId = Geolocation.getCurrentPosition(
//       (position) => {
//         if (!hasResolved) {
//           hasResolved = true;
//           clearTimeout(timeoutId);
//           if (watchId !== null) {
//             Geolocation.clearWatch(watchId);
//           }
          
//           const locationData = {
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude,
//             accuracy: position.coords.accuracy,
//             timestamp: new Date().toISOString(),
//             source: isBackground ? 'background' : 'foreground',
//           };
          
//           console.log('[📍] Location captured:', locationData);
//           resolve(locationData);
//         }
//       },
//       (error) => {
//         if (!hasResolved) {
//           hasResolved = true;
//           clearTimeout(timeoutId);
//           if (watchId !== null) {
//             Geolocation.clearWatch(watchId);
//           }
//           console.error('[📍] Location error:', error);
//           reject(error);
//         }
//       },
//       options
//     );
//   });
// };

// // Store Pending Location
// export const storePendingLocation = async (locationData) => {
//   try {
//     const existingLocations = await getPendingLocations();
//     const newLocation = {
//       ...locationData,
//       id: Date.now().toString(),
//       stored_at: new Date().toISOString(),
//     };
    
//     existingLocations.push(newLocation);
//     await AsyncStorage.setItem(PENDING_LOCATIONS_KEY, JSON.stringify(existingLocations));
//     await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
    
//     console.log('[📍] Stored pending location:', newLocation);
//   } catch (error) {
//     console.error('[📍] Store pending location error:', error);
//   }
// };

// // Get Pending Locations
// const getPendingLocations = async () => {
//   try {
//     const locations = await AsyncStorage.getItem(PENDING_LOCATIONS_KEY);
//     return locations ? JSON.parse(locations) : [];
//   } catch (error) {
//     console.error('[📍] Get pending locations error:', error);
//     return [];
//   }
// };

// // Clear Pending Locations
// const clearPendingLocations = async () => {
//   try {
//     await AsyncStorage.removeItem(PENDING_LOCATIONS_KEY);
//     console.log('[📍] Cleared pending locations');
//   } catch (error) {
//     console.error('[📍] Clear pending locations error:', error);
//   }
// };

// // Get Last Location
// export const getLastLocation = async () => {
//   try {
//     const location = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
//     return location ? JSON.parse(location) : null;
//   } catch (error) {
//     console.error('[📍] Get last location error:', error);
//     return null;
//   }
// };

// // Sync Pending Locations with Backend
// export const syncPendingLocations = async () => {
//   try {
//     const pendingLocations = await getPendingLocations();
//     if (pendingLocations.length === 0) {
//       console.log('[📍] No pending locations to sync');
//       return true;
//     }

//     console.log(`[📍] Syncing ${pendingLocations.length} pending locations`);
//     const failedLocations = [];

//     for (const location of pendingLocations) {
//       try {
//         await sendUserLocation(location);
//         console.log('[📍] Successfully synced location:', location.id);
//       } catch (error) {
//         console.error('[📍] Failed to sync location:', location.id, error.message);
//         failedLocations.push(location);
//       }
//     }

//     if (failedLocations.length === 0) {
//       await clearPendingLocations();
//       console.log('[📍] All pending locations synced successfully');
//       return true;
//     } else {
//       // Keep only failed locations
//       await AsyncStorage.setItem(PENDING_LOCATIONS_KEY, JSON.stringify(failedLocations));
//       console.log(`[📍] ${failedLocations.length} locations failed to sync, keeping for retry`);
//       return false;
//     }
//   } catch (error) {
//     console.error('[📍] Sync pending locations error:', error);
//     return false;
//   }
// };

// // Background Fetch Task Handler
// const backgroundFetchHandler = async (taskId) => {
//   console.log('[📍] Background fetch triggered:', taskId, new Date().toISOString());
  
//   try {
//     // Get location with timeout
//     const location = await Promise.race([
//       getCurrentLocation(true),
//       new Promise((_, reject) => 
//         setTimeout(() => reject(new Error('Background fetch timeout')), 25000)
//       )
//     ]);

//     if (location) {
//       await storePendingLocation(location);
      
//       // Try to sync if connected
//       const netState = await NetInfo.fetch();
//       if (netState.isConnected && netState.isInternetReachable !== false) {
//         await syncPendingLocations();
//       } else {
//         console.log('[📍] No internet connection, location stored for later sync');
//       }
//     }
//   } catch (error) {
//     console.error('[📍] Background fetch error:', error);
//   } finally {
//     console.log('[📍] Background fetch completed:', taskId);
//     BackgroundFetch.finish(taskId);
//   }
// };

// // Background Fetch Timeout Handler
// const backgroundFetchTimeoutHandler = async (taskId) => {
//   console.log('[📍] Background fetch timeout:', taskId);
//   BackgroundFetch.finish(taskId);
// };

// // Configure Background Fetch
// const configureBackgroundFetch = async () => {
//   try {
//     const status = await BackgroundFetch.configure(
//       {
//         minimumFetchInterval: BACKGROUND_FETCH_INTERVAL,
//         stopOnTerminate: false,
//         startOnBoot: true,
//         enableHeadless: true,
//         forceAlarmManager: Platform.OS === 'android',
//         requiredNetworkType: 'NONE', // Don't require network for background task
//       },
//       backgroundFetchHandler,
//       backgroundFetchTimeoutHandler
//     );

//     console.log('[📍] Background fetch status:', status);

//     // Schedule additional task for Android
//     if (Platform.OS === 'android') {
//       await BackgroundFetch.scheduleTask({
//         taskId: 'location-tracking-task',
//         delay: 10 * 60 * 1000, // 10 minutes
//         periodic: true,
//         forceAlarmManager: true,
//         stopOnTerminate: false,
//         enableHeadless: true,
//         requiredNetworkType: 'NONE',
//       });
//       console.log('[📍] Android background task scheduled');
//     }

//     return true;
//   } catch (error) {
//     console.error('[📍] Background fetch configuration error:', error);
//     return false;
//   }
// };

// // Start Location Tracking
// export const startLocationTracking = async () => {
//   if (isTrackingInitialized) {
//     console.log('[📍] Location tracking already initialized');
//     return true;
//   }

//   try {
//     // Request permissions first
//     const hasPermission = await requestLocationPermissions();
//     if (!hasPermission) {
//       console.log('[📍] Location permissions not granted');
//       return false;
//     }

//     // Start foreground service
//     await startForegroundService();

//     // Configure background fetch
//     const backgroundConfigured = await configureBackgroundFetch();
//     if (!backgroundConfigured) {
//       console.error('[📍] Failed to configure background fetch');
//       return false;
//     }

//     // Get initial location
//     try {
//       const location = await getCurrentLocation(false);
//       if (location) {
//         await storePendingLocation(location);
        
//         // Try initial sync
//         const netState = await NetInfo.fetch();
//         if (netState.isConnected) {
//           await syncPendingLocations();
//         }
//       }
//     } catch (error) {
//       console.error('[📍] Initial location fetch failed:', error);
//       // Don't fail the entire setup for initial location failure
//     }

//     // Set up network listener for syncing when connection is restored
//     if (netListener) {
//       netListener(); // Clean up existing listener
//     }
    
//     netListener = NetInfo.addEventListener(async (state) => {
//       if (state.isConnected && state.isInternetReachable !== false) {
//         console.log('[📍] Network connected, syncing pending locations');
//         await syncPendingLocations();
//       }
//     });

//     isTrackingInitialized = true;
//     console.log('[📍] Location tracking started successfully');
//     return true;

//   } catch (error) {
//     console.error('[📍] Failed to start location tracking:', error);
//     return false;
//   }
// };

// // Stop Location Tracking
// export const stopLocationTracking = async () => {
//   if (!isTrackingInitialized) {
//     console.log('[📍] Location tracking not initialized');
//     return;
//   }

//   try {
//     // Stop background fetch
//     await BackgroundFetch.stop();
    
//     // Clean up network listener
//     if (netListener) {
//       netListener();
//       netListener = null;
//     }

//     // Stop foreground service
//     await stopForegroundService();

//     isTrackingInitialized = false;
//     console.log('[📍] Location tracking stopped');
//   } catch (error) {
//     console.error('[📍] Error stopping location tracking:', error);
//   }
// };

// // Handle App State Changes
// export const handleAppStateChange = async (nextAppState) => {
//   console.log('[📍] App state changed to:', nextAppState);
  
//   if (nextAppState === 'active' && isTrackingInitialized) {
//     try {
//       // Get location when app becomes active
//       const location = await getCurrentLocation(false);
//       if (location) {
//         await storePendingLocation(location);
        
//         // Sync if connected
//         const netState = await NetInfo.fetch();
//         if (netState.isConnected) {
//           await syncPendingLocations();
//         }
//       }
//     } catch (error) {
//       console.error('[📍] Foreground location fetch error:', error);
//     }
//   }
// };

// // Get tracking status
// export const getTrackingStatus = () => {
//   return {
//     isInitialized: isTrackingInitialized,
//     hasNetListener: netListener !== null,
//   };
// };