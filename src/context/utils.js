import { Alert, Linking } from 'react-native';
import VersionCheck from 'react-native-version-check';

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

export const appVersion= 'V1.8'



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
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.log("Failed to register device for remote messages:", error);
  }
}

// foreground notification using notify
export const handleNotification = async (remoteMessage) => {
  console.log('New FCM message arrived!', remoteMessage, remoteMessage.notification?.title);
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  // Display a notification
  await notifee.displayNotification({
    title: remoteMessage.notification?.title,
    body: remoteMessage.notification?.body,
    android: {
      channelId,
      smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
      // pressAction is needed if you want the notification to open the app when pressed
      pressAction: {
        id: 'default',
      },
    },
  });
}

export const page_limit= 25

export const dateFormat = (date, time= false) =>{
  // format dd/mm/yyyy
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if(time){
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }
  return `${day}/${month}/${year}`
}