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
          {
            text: "Update Now",
            onPress: () => Linking.openURL(isNeeded.storeUrl),
          },
          {
            text: "Later",
            style: "cancel"
          }
        ]
      );
    }
  };