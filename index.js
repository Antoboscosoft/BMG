/**
 * @format
 */

import { AppRegistry } from 'react-native';

import App from './App';
import { name as appName } from './app.json';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
// import BackgroundFetch from 'react-native-background-fetch';
// import { onBackgroundFetch } from './src/services/LocationService';

/*
    Background Fetch temporary disabled
*/

// firebase notifications
export const firebaseApp = getApp(); // initialize firebase
export const messaging = getMessaging(firebaseApp)

// Register background msg handler for firebase
setBackgroundMessageHandler(messaging, async remoteMessage => {
  if (!remoteMessage.notification?.title) { //handle slient push notification
    // console.log('Triggered for get location'); 
    // onBackgroundFetch();
  }

});

// // background fetch
// const MyHeadlessTask = async (event) => {
//   onBackgroundFetch(event.taskId);
// };

// BackgroundFetch.registerHeadlessTask(MyHeadlessTask);


AppRegistry.registerComponent(appName, () => App);
