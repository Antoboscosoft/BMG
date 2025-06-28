// src/services/LocationService.js

// import BackgroundFetch from 'react-native-background-fetch';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import notifee from '@notifee/react-native';
import { sendUserLocation } from '../api/auth';


// Optional - move this to a common utils file
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
        maximumAge: 5 * 60 * 60 * 1000 , // 5 hours
      }
    );
  });
};
let isConfigured = false;

export const checkIfLocationEnabled01 = async () => {
  const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
  return result === RESULTS.GRANTED;
};

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

export const requestLocationPermissions01opensettign = async () => {
  if (Platform.OS === 'android') {
    const fine = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    const background =
      Platform.Version >= 29
        ? await request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION)
        : RESULTS.GRANTED;

    const granted = fine === RESULTS.GRANTED && background === RESULTS.GRANTED;
    console.log('[📍 Permissions Granted]:', granted);
    return granted;
  }

  return true;
};


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


// TEST MODE: Fires fetch events more frequently (only for dev/testing)
// BackgroundFetch.start().then(status => {
//   console.log('[✅ BackgroundFetch start() success]:', status);
//   BackgroundFetch.scheduleTask({
//     taskId: 'com.boscosoft.dbms', // Unique ID
//     delay: 10000, // 10 seconds
//     forceAlarmManager: true, // More reliable for testing
//     periodic: true, // Set to true for recurring task
//     stopOnTerminate: false,
//     enableHeadless: true,
//   });
// }).catch(err => {
//   console.warn('[❌ BackgroundFetch start() error]:', err);
// });



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

export const checkAndGetLocation = async () => {
  Geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log('📍 Location:', latitude, longitude);
    },
    (error) => {
      console.log('❌ Location Error:', error.message);

      if (error.code === 2 || error.message.includes('provider')) {
        Alert.alert(
          'Turn On Location',
          'Please turn on location services (GPS) in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'android') {
                  Linking.openSettings(); // Opens system settings
                }
              },
            },
          ]
        );
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5 * 60 * 60 * 1000, // 5 hours
      forceRequestLocation: true,
    }
  );
};

let lastSentLocationTime = new Date(0);

export const saveLocation = async (locationData) => {
  const now = new Date();
  const timeDiff = now.getTime() - lastSentLocationTime.getTime();
  if (timeDiff > 5 * 60 * 60 * 1000) {
    // TODO: Save to backend API or local DB
    console.log('Saving Location: >>> ', locationData);
    try {
      console.log('[Sending Location to Backend]:');
      await sendUserLocation(locationData);
      lastSentLocationTime = now;
    } catch (err) {
      console.log('[Failed to Send Location]', err);
    }
  }
};



// export const initBackgroundLocationTracking01 = async () => {
//   console.log('🔁 Initializing Background Location Tracking...', isConfigured);
//   let lastFetchedTime = new Date();

//   if (isConfigured) {
//     console.log('🔁 BackgroundFetch already configured. Skipping...');
//     return;
//   }

//   const hasPermission = await requestLocationPermissions();
//   console.log('🔁 Location Permission:', hasPermission);

//   if (!hasPermission) {
//     Alert.alert(
//       'Location Permission Required',
//       'Please enable location permissions in Settings to continue using this app.',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'Open Settings', onPress: () => Linking.openSettings() },
//       ]
//     );
//     return;
//   }

//   // Create a notification channel for Android
//   await notifee.createChannel({
//     id: 'background-fetch',
//     name: 'Background Fetch Notifications',
//   });

//   BackgroundFetch.configure(
//     {
//       minimumFetchInterval: 15, // 15 minutes is the minimum allowed by Android
//       stopOnTerminate: false,
//       startOnBoot: true,
//       enableHeadless: true,
//       requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
//     },
//     async (taskId) => {
//       console.log('[🔁 BackgroundFetch Fired]', { taskId, timestamp: lastFetchedTime.toISOString() });

//       // Display a notification to confirm the task is running
//       await notifee.displayNotification({
//         title: 'Background Fetch',
//         body: `Task ${taskId} fired at ${new Date().toISOString()}`,
//         android: {
//           channelId: 'background-fetch',
//         },
//       });

//       Geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           // saveLocation({
//           //   latitude,
//           //   longitude,
//           //   timestamp: new Date().toISOString(),
//           // });
//           const locationData = {
//             latitude,
//             longitude,
//             timestamp: new Date().toISOString(),
//           };

//           console.log('📍 [Background Location]:', locationData);
//           saveLocation(locationData); // optional
//         },
//         (error) => {
//           console.log('[Location Error]', error.message);
//           // Notify user of error
//           notifee.displayNotification({
//             title: 'Background Location Error',
//             body: `Failed to get location: ${error.message}`,
//             android: {
//               channelId: 'background-fetch',
//             },
//           });
//         },
//         {
//           enableHighAccuracy: true,
//           timeout: 15000,
//           maximumAge: 10000,
//           forceRequestLocation: true,
//         }
//       );
//       BackgroundFetch.finish(taskId);
//     },
//     (error) => {
//       console.log('[BackgroundFetch] configure failed:', error);
//       notifee.displayNotification({
//         title: 'Background Fetch Error',
//         body: `Configuration failed: ${error}`,
//         android: {
//           channelId: 'background-fetch',
//         },
//       });
//       isConfigured = false; // Reset to allow retry
//     }
//   );

//   // Log status periodically to confirm scheduling
//   BackgroundFetch.status((status) => {
//     console.log('[BackgroundFetch Status]', {
//       status,
//       timestamp: new Date().toISOString(),
//     });
//   });

//   isConfigured = true;

//   // Schedule a recurring log to confirm the task is active (every minute)
//   setInterval(() => {
//     const now = new Date();
//     const diffInMin = Math.floor((now - lastFetchedTime) / 60000); // Minutes

//     console.log('[BackgroundFetch Heartbeat]', {
//       isConfigured,
//       elapsedMinutesSinceLastFetch: diffInMin,
//       now: now.toISOString(),

//       // timestamp: new Date().toISOString(),
//     });
//     BackgroundFetch.status((status) => {
//       console.log('[BackgroundFetch Status Check]', {
//         status,
//         timestamp: new Date().toISOString(),
//       });
//     });
//   }, 60 * 1000); // Every 1 minute
// };

// export const initBackgroundLocationTracking1 = () => {
//   BackgroundFetch.configure(
//     {
//       minimumFetchInterval: 15, // <-- 15 minutes
//       stopOnTerminate: false,
//       enableHeadless: true,
//       startOnBoot: true,
//       requiredNetworkType: BackgroundFetch.NETWORK_TYPE_NONE,
//       forceAlarmManager: true, // Use AlarmManager for more reliable scheduling
//     },
//     async (taskId) => {
//       console.log('[BackgroundFetch] taskId:', taskId);
//       try {
//         const location = await getCurrentLocation(true);
//         if (location) {
//           console.log('[BackgroundFetch][Location]:', location);
//           // TODO: Save location to DB here
//         }
//       } catch (e) {
//         console.log('[BackgroundFetch][Location Error]:', e);
//       }
//       BackgroundFetch.finish(taskId);
//     },
//     (error) => {
//       console.log('[BackgroundFetch] configure error:', error);
//     }
//   );
// };

export const initBackgroundLocationTracking = async () => {
  console.log('🔁 Starting Background Location Tracking...');

  const status = await BackgroundFetch.status();
  console.log('[🔁 BackgroundFetch Status]', status);

  const hasPermission = await requestLocationPermissions();
  if (!hasPermission) {
    Alert.alert('Permission Required', 'Location permission is needed.');
    return;
  }

  // 🔔 Foreground Service Notification (IMPORTANT for Android 10+)
  await notifee.createChannel({
    id: 'background-fetch',
    name: 'Background Fetch Notifications',
  });

  BackgroundFetch.configure(
    {
      minimumFetchInterval: 300, // ✅ 15 mins
      stopOnTerminate: false,
      startOnBoot: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      enableHeadless: true,
      forceAlarmManager: true,
    },
    async (taskId) => {
      const now = new Date().toISOString();
      console.log(`[✅ BackgroundFetch Triggered]: ${taskId} at ${now}`);

      try {
        const position = await getCurrentLocation(true);
        console.log('📍 Background Location:', position);
        saveLocation(position); // store in DB later
      } catch (e) {
        console.log('❌ Location Error:', e.message);
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString(),
          };
          console.log('📍 [Background Location]:', location);
          // ✅ You can now save to DB
        },
        (error) => {
          console.log('[❌ Location Error]', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 18000000, // 5 hours
          forceRequestLocation: true,
        }
      );

      BackgroundFetch.finish(taskId);
    },
    (error) => {
      console.log('[❌ BackgroundFetch failed to configure]', error);
    }
  );

  console.log('[✅ BackgroundFetch start() success]');

  // Add a heartbeat to see it's alive
  setInterval(() => {
    console.log('[⏱️ BackgroundFetch Heartbeat]', new Date().toISOString());
  }, 5 * 60 * 60 * 1000); // every 5 hours
  isConfigured = true; // Mark as configured
  console.log('[🔁 Background Location Tracking Initialized]');
};


// For testing: Manually trigger a background fetch event
export const triggerBackgroundFetch = async () => {
  console.log('[🔁 Manual Background Fetch Trigger]');
  await BackgroundFetch.scheduleTask({
    taskId: 'com.boscosoft.dbms',
    // delay: 1000, // 1 second delay
    // delay: 10000, // 10 seconds (for testing)
    delay: 300 * 60 * 1000, // ✅ 5 hours in ms
    periodic: false,
    requiresCharging: false,
    requiresDeviceIdle: false,
  });
};
