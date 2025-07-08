import { ActivityIndicator, Alert, Linking, PermissionsAndroid, View } from 'react-native';
import VersionCheck from 'react-native-version-check';
import notifee, { AndroidImportance } from '@notifee/react-native';

import { getToken } from '@react-native-firebase/messaging';
import { messaging } from '../../index';
import { onBackgroundFetch } from '../services/LocationService';

export const checkAppVersion = async (appUpdate, setAppUpdate) => {
  const isNeeded = await VersionCheck.needUpdate();

  if (isNeeded?.isNeeded && appUpdate) {
    setAppUpdate(false);
    Alert.alert(
      "Update Available",
      "A new version of the app is available. Please update to continue.",
      [
        { text: "Later", style: "cancel" },
        { text: "Update Now", onPress: () => Linking.openURL(isNeeded.storeUrl) }
      ]
    );
  }
};

export const appVersion = 'V1.17';

export const everyTimeSendLocationtoBackendTime = 5;

export const Loader = ({ loading }) => {
  return (
    loading ?
      <View style={{ justifyContent: 'center', alignItems: 'center', zIndex: 1, position: 'absolute', width: '100%', height: '100%' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
      : <View />
  )
}

export const ScrollLoader = ({ loading }) => {
  return (
    loading ?
      <View style={{ justifyContent: 'center', alignItems: 'center', zIndex: 1, width: '100%', height: 80 }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
      : <View />
  )
}


export const notificationPermission = async () => {
  if (Platform.OS === 'android') {
    const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    if (permission === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Notification permission granted');
      return true;
    } else {
      console.log('Notification permission denied');
      return false;
    }
  }

}

export const getFirebaseToken = async () => {
  try {
    // Get the token
    const token = await getToken(messaging);
    return token;
  } catch (error) {
    console.log("Failed to register device for remote messages:", error);
  }
}

// foreground notification using notify
export const handleNotification = async (remoteMessage) => {

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'high_importance_channel',
    name: 'High Importance Notifications',
    importance: AndroidImportance.HIGH, // This is key for pop-up
    description: 'Notifications that pop up on the screen.',
    sound: 'default', // Optional: use 'default' or a custom sound
    vibration: true, // Optional: enable vibration
    // You can also set a custom light color
    // lightColor: '#FF0000',
  });

  if (remoteMessage.notification?.title) {
    // Display a notification
    await notifee.displayNotification({
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data,
      android: {
        channelId, // Use the channel ID you created
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
        // pressAction is needed if you want the notification to open the app when pressed
        pressAction: {
          id: 'default',
        },
      },
    });
  } else {
    // triggered for get location
    console.log("foreground get location ");
    onBackgroundFetch();

  }
}

export const page_limit = 25

export const dateFormat = (date, time = false) => {
  // format dd/mm/yyyy
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (time) {
    const hoursRaw = d.getHours();
    const hours = String(hoursRaw % 12 || 12).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const am_pm = hoursRaw >= 12 ? 'PM' : 'AM';
    return `${day}/${month}/${year} ${hours}:${minutes} ${am_pm}`
  }
  return `${day}/${month}/${year}`
}

// Handle Scroll reach end for scroll view
export const handleReachEnd = (nativeEvent, skip, limit, total, setLoading, setSkip) => {
  const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;

  // Check if the user has scrolled to the end    
  if (Math.floor(layoutMeasurement?.height + contentOffset?.y) >= Math.floor(contentSize?.height) - 100) {

    if (skip + limit < total) {
      // setLoading(true);
      setSkip(skip + limit);
    }
  }
}

// Handle remove duplicate object from array
export const removeDuplicates = (arr, uniqueKey) => {

  return arr?.reduce((acc, currValue) => {
    if (!acc.some(item => item?.[uniqueKey] === currValue?.[uniqueKey])) {
      acc.push(currValue);
    }
    return acc;
  }, []); // empty array refers to initial value of acc
}

export const placeholderTextColor = '#999'