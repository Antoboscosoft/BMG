/**
 * @format
 */

import { AppRegistry } from 'react-native';

import App from './App';
import { name as appName } from './app.json';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';

export const firebaseApp = getApp(); // initialize firebase
export const messaging = getMessaging(firebaseApp)

const MainApp = () => {
    return (
        <App />
    );
};
// Register background handler
setBackgroundMessageHandler(messaging, async remoteMessage => {});

AppRegistry.registerComponent(appName, () => MainApp);
