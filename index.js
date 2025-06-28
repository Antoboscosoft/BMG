/**
 * @format
 */

import { AppRegistry } from 'react-native';

import App from './App';
import { name as appName } from './app.json';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import BackgroundFetch from 'react-native-background-fetch';
import { getCurrentLocation, saveLocation } from './src/services/LocationService';

export const firebaseApp = getApp(); // initialize firebase
export const messaging = getMessaging(firebaseApp)

// const HeadlessTask = async (event) => {
//   console.log('[📦 Headless Fetch Event]', event);

//   // You can add location fetch here again if needed
//   BackgroundFetch.finish();
// };

const HeadlessTask = async ({ taskId }) => {
  console.log('[📦 Headless Fetch Event]', { taskId, timestamp: new Date().toISOString() });

  // try {
    const locationData = await getCurrentLocation();
    if (locationData) {
      console.log('📍 [Headless Location]:', locationData);
      saveLocation(locationData);
    }
  // } catch (error) {
  //   console.log('[Headless Location Error]', error.message);
  // }

  BackgroundFetch.finish(taskId);
};

const MainApp = () => {
    return (
        <App />
    );
};
// Register background handler
setBackgroundMessageHandler(messaging, async remoteMessage => {});

BackgroundFetch.registerHeadlessTask(HeadlessTask);

AppRegistry.registerComponent(appName, () => MainApp);
