// /**
//  * @format
//  */

// import { AppRegistry } from 'react-native';

// import App from './App';
// import { name as appName } from './app.json';
// import { getApp } from '@react-native-firebase/app';
// import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
// import BackgroundFetch from 'react-native-background-fetch';
// // import { getCurrentLocation, saveLocation } from './src/services/LocationService';
// import notifee from '@notifee/react-native';
// export const firebaseApp = getApp(); // initialize firebase
// export const messaging = getMessaging(firebaseApp)

// // const HeadlessTask = async (event) => {
// //   console.log('[📦 Headless Fetch Event]', event);

// //   // You can add location fetch here again if needed
// //   BackgroundFetch.finish();
// // };

// // const HeadlessTask1 = async ({ taskId }) => {
// //   console.log('[📦 Headless Fetch Event]', { taskId, timestamp: new Date().toISOString() });

// //   // try {
// //     const locationData = await getCurrentLocation();
// //     if (locationData) {
// //       console.log('📍 [Headless Location]:', locationData);
// //       await saveLocation(locationData);
// //     }
// //   // } catch (error) {
// //   //   console.log('[Headless Location Error]', error.message);
// //   // }

// //   BackgroundFetch.finish(taskId);
// // };

// // index.js
// // const HeadlessTask01 = async ({ taskId }) => {
// //   console.log('[HeadlessTask] Started');
  
// //   try {
// //     const { getCurrentLocation, storePendingLocation, syncPendingLocations } = require('./src/services/LocationService');
    
// //     const location = await getCurrentLocation(true); // true for background
// //     if (location) {
// //       await storePendingLocation(location);
      
// //       // Try to sync if online
// //       const NetInfo = require('@react-native-community/netinfo');
// //       const state = await NetInfo.fetch();
// //       if (state.isConnected) {
// //         await syncPendingLocations();
// //       }
// //     }
// //   } catch (error) {
// //     console.error('[HeadlessTask Error]', error);
// //   }
  
// //   BackgroundFetch.finish(taskId);
// // };

// const HeadlessTask = async ({ taskId }) => {
//   console.log('[HeadlessTask] Started');
  
//   try {
//     const { getCurrentLocation, storePendingLocation } = require('./src/services/LocationService');
    
//     // Short timeout for background (Android kills tasks after ~30s)
//     const location = await Promise.race([
//       getCurrentLocation(true),
//       new Promise((_, reject) => setTimeout(() => reject('Timeout'), 10000))
//     ]);
    
//     if (location) {
//       await storePendingLocation(location);
//       console.log('[HeadlessTask] Location saved (will sync later)');
//     }
//   } catch (error) {
//     console.error('[HeadlessTask Error]', error);
//   } finally {
//     BackgroundFetch.finish(taskId);
//   }
// };

// // const HeadlessTask = async ({ taskId }) => {
// //   console.log('[HeadlessTask] Started');
  
// //   try {
// //     const { getCurrentLocation, storePendingLocation, syncPendingLocations } = require('./src/services/LocationService');
    
// //     const location = await getCurrentLocation(true); // true for background
// //     if (location) {
// //       await storePendingLocation(location);
      
// //       // Try to sync if online
// //       const NetInfo = require('@react-native-community/netinfo');
// //       const state = await NetInfo.fetch();
// //       if (state.isConnected) {
// //         await syncPendingLocations();
// //       } else {
// //         console.log('[HeadlessTask] Network not connected, skipping sync.');
// //       }
// //     }
// //   } catch (error) {
// //     console.error('[HeadlessTask Error]', error);
// //   } finally {
  
// //   BackgroundFetch.finish(taskId);
// //   }
// // };

// notifee.onBackgroundEvent(async ({ type, detail }) => {
//   console.log('Notifee background event:', type, detail);
//   // Handle background events if needed
// });

// // const notifee = require('@notifee/react-native');

// // await notifee.createChannel({
// //   id: 'location',
// //   name: 'Location Service',
// // });

// // await notifee.displayNotification({
// //   title: '📍 Tracking in Background',
// //   body: 'App is fetching your location.',
// //   android: {
// //     channelId: 'location',
// //     smallIcon: 'ic_launcher', // must exist in res/drawable
// //     ongoing: true,
// //     pressAction: {
// //       id: 'default',
// //     },
// //   },
// // });

// // BackgroundFetch.registerHeadlessTask(HeadlessTask);

// // Move these to an async function
// const initializeNotifications = async () => {
//   try {  
//   await notifee.createChannel({
//     id: 'location',
//     name: 'Location Service',
//   });

//   await notifee.displayNotification({
//     title: '📍 Tracking in Background',
//     body: 'App is fetching your location.',
//     android: {
//       channelId: 'location',
//       smallIcon: 'ic_launcher', // must exist in res/drawable
//       ongoing: true,
//       pressAction: {
//         id: 'default',
//       },
//     },
//   });
//   } catch (error) {
//     console.error('Notification initialization error:', error);
//   }
// };

// // Call the function
// initializeNotifications();
// // initializeNotifications().catch(console.error);
// const MainApp = () => {
//     return (
//         <App />
//     );
// };
// // Register background handler
// setBackgroundMessageHandler(messaging, async remoteMessage => {
//   console.log('Message handled in the background!', remoteMessage);
//   // You can handle background messages here
//   // For example, you can save the message to AsyncStorage or show a local notification
// });

// BackgroundFetch.registerHeadlessTask(HeadlessTask);

// AppRegistry.registerComponent(appName, () => MainApp);



/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import BackgroundFetch from 'react-native-background-fetch';
import notifee from '@notifee/react-native';

export const firebaseApp = getApp(); // initialize firebase
export const messaging = getMessaging(firebaseApp);

// Background Location Tracking Task
const HeadlessLocationTask = async ({ taskId }) => {
  console.log('[📍 HeadlessTask] Started:', taskId, new Date().toISOString());
  
  try {
    // Import location service functions
    const { getCurrentLocation, storePendingLocation, syncPendingLocations } = require('./src/services/LocationService');
    const NetInfo = require('@react-native-community/netinfo');

    // Get location with timeout (keep it short for headless tasks)
    const location = await Promise.race([
      getCurrentLocation(true), // true for background mode
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('HeadlessTask timeout')), 20000)
      )
    ]);
    
    if (location) {
      // Always store location first
      await storePendingLocation(location);
      console.log('[📍 HeadlessTask] Location stored:', location.timestamp);
      
      // Try to sync if network is available
      try {
        const netState = await NetInfo.fetch();
        if (netState.isConnected && netState.isInternetReachable !== false) {
          const syncSuccess = await syncPendingLocations();
          console.log('[📍 HeadlessTask] Sync result:', syncSuccess ? 'success' : 'partial');
        } else {
          console.log('[📍 HeadlessTask] No network, location stored for later sync');
        }
      } catch (syncError) {
        console.log('[📍 HeadlessTask] Sync error (location still stored):', syncError.message);
      }
    } else {
      console.log('[📍 HeadlessTask] No location obtained');
    }
    
  } catch (error) {
    console.error('[📍 HeadlessTask] Error:', error.message || error);
  } finally {
    console.log('[📍 HeadlessTask] Completed:', taskId);
    BackgroundFetch.finish(taskId);
  }
};

// Handle background notification events
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('[📍 Notifee] Background event:', type, detail?.notification?.id);
  
  // Handle notification actions if needed
  if (type === 'ACTION_PRESS' && detail?.pressAction?.id === 'stop-tracking') {
    try {
      const { stopLocationTracking } = require('./src/services/LocationService');
      await stopLocationTracking();
      console.log('[📍 Notifee] Location tracking stopped by user');
    } catch (error) {
      console.error('[📍 Notifee] Error stopping tracking:', error);
    }
  }
});

// Register the headless task for background location tracking
BackgroundFetch.registerHeadlessTask(HeadlessLocationTask);

// Handle background Firebase messages
setBackgroundMessageHandler(messaging, async remoteMessage => {
  console.log('[📍 Firebase] Background message:', remoteMessage?.messageId);
  // Handle background push notifications here if needed
});

// Main App Component
const MainApp = () => {
  return <App />;
};

// Register the main app component
AppRegistry.registerComponent(appName, () => MainApp);