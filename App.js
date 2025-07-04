// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import SplashScreen from './src/screens/SplashScreen.js';
// import LoginScreen from './src/screens/LoginScreen.js';
// import React, { createContext, useEffect, useState } from 'react'
// import ProfileScreen from './src/screens/ProfileScreen.js';
// import DashboardPage from './src/pages/DashboardPage.js';
// import ServicesDirectory from './src/pages/ServicesDirectory.js';
// import MultilingualSupportPage from './src/pages/MultilingualSupportPage.js';
// import HelpRequestPage from './src/pages/HelpRequestPage.js';
// import EventCalendarPage from './src/pages/EventCalendarPage.js';
// import CreateEventPage from './src/pages/CreateEventPage.js';
// import RegisterScreen from './src/screens/RegisterScreen.js';
// import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
// import ProfileEdit from './src/screens/ProfileEdit.js';
// import CreateService from './src/pages/CreateService.js';
// import { navigationRef } from './src/api/navigationRef.js';
// import CreateRegister from './src/pages/CreateRegister.js';
// import { LanguageProvider } from './src/language/commondir.js';
// import MigrantsList from './src/pages/MigrantsList.js';
// import ProfileView from './src/pages/UserProfileView.js';
// import NetworkStatus from './src/context/NetworkStatus.js';
// import { Alert, AppState, Linking, LogBox, NativeModules, Platform, Text, View } from 'react-native';
// import CreateEvent from './src/pages/CreateEvent.js';
// import NewsList from './src/pages/news/NewsList.js';
// import NewsDetail from './src/pages/news/NewsDetail.js';
// import CreateNews from './src/pages/news/CreateNews.js';
// // import WorkersScreen from './src/pages/news/WorkersScreen.js';
// import ContactUs from './src/pages/contactus/ContactUs.js';
// import CategotryServices from './src/pages/CategotryServices.js';
// import CategoryHelp from './src/pages/help/CategoryHelp.js';
// import CreateHelp from './src/pages/help/CreateHelp.js';
// import { SafeAreaProvider } from 'react-native-safe-area-context';

// // notification
// import NotificationList from './src/pages/notifications/NotificationList.jsx';
// import NotificationView from './src/pages/notifications/NotificationView.jsx';
// import JobView from './src/pages/job/JobView.js';
// import ViewApplicants from './src/pages/job/ViewApplicants.js';
// import LocationViewScreen from './src/screens/LocationViewScreen.js';
// import LocationHistory from './src/screens/LocationHistory.js';
// import { checkIfLocationEnabled, getCurrentLocation, initBackgroundLocationTracking, requestLocationPermissions, requestLocationPermissions01 } from './src/services/LocationService.js';
// import { triggerBackgroundFetch } from './src/services/LocationService.js';
// import { startLocationTracking } from './src/services/LocationService.js';
// import { stopLocationTracking } from './src/services/LocationService.js';
// import { handleAppStateChange } from './src/services/LocationService.js';
// LogBox.ignoreAllLogs(); // just for testing crash


// const Stack = createNativeStackNavigator();
// export const ContextProps = createContext(null);

// function App() {
//   const [appUpdate, setAppUpdate] = useState(true);

//   // useEffect(() => {
//   //   const init = async () => {
//   //     // Request permissions
//   //     const granted = await requestLocationPermissions();
//   //     if (!granted) {
//   //       Alert.alert(
//   //         'Location Permission Required',
//   //         'Please enable location permissions in settings.',
//   //         [
//   //           { text: 'Cancel', style: 'cancel' },
//   //           { text: 'Open Settings', onPress: () => Linking.openSettings() },
//   //         ]
//   //       );
//   //       return;
//   //     }

//   //     // Start location tracking
//   //     await startLocationTracking();

//   //     // Handle app state changes
//   //     const subscription = AppState.addEventListener('change', handleAppStateChange);

//   //     // Check battery optimization (Android)
//   //     if (Platform.OS === 'android') {
//   //       const PowerManager = NativeModules.PowerManager;
//   //       if (PowerManager) {
//   //         const isIgnoring = await PowerManager.isIgnoringBatteryOptimizations();
//   //         if (!isIgnoring) {
//   //           Alert.alert(
//   //             'Battery Optimization',
//   //             'For reliable background location, please disable battery optimization.',
//   //             [
//   //               { text: 'Later' },
//   //               { text: 'Open Settings', onPress: () => PowerManager.openBatterySettings() },
//   //             ]
//   //           );
//   //         }
//   //       }
//   //     }

//   //     return () => {
//   //       stopLocationTracking();
//   //       subscription.remove();
//   //     };
//   //   };

//   //   init();
//   // }, []);

//   useEffect(() => {
//     const initLocationTracking = async () => {
//       // Start location tracking
//       await startLocationTracking();

//       // Handle app state changes
//       const subscription = AppState.addEventListener('change', handleAppStateChange);

//       // Cleanup on unmount
//       return () => {
//         stopLocationTracking();
//         subscription.remove();
//       };
//     };

//     initLocationTracking();
//   }, []);
  
//   useEffect(() => {
//     const init = async () => {
//       // Request location permissions
//       const granted = await requestLocationPermissions();
//       if (!granted) {
//         Alert.alert(
//           'Location Permission Required',
//           'Please enable location permissions in settings.',
//           [
//             { text: 'Cancel', style: 'cancel' },
//             { text: 'Open Settings', onPress: () => Linking.openSettings() },
//           ]
//         );
//         return;
//       }

//       // Start location tracking
//       await startLocationTracking();

//       // Handle app state changes
//       const subscription = AppState.addEventListener('change', handleAppStateChange);

//       // Check battery optimization (Android)
//       if (Platform.OS === 'android') {
//         const PowerManager = NativeModules.PowerManager;
//         if (PowerManager) {
//           const isIgnoring = await PowerManager.isIgnoringBatteryOptimizations();
//           if (!isIgnoring) {
//             Alert.alert(
//               'Battery Optimization',
//               'For reliable background location, please disable battery optimization.',
//               [
//                 { text: 'Later' },
//                 { text: 'Open Settings', onPress: () => PowerManager.openBatterySettings() },
//               ]
//             );
//           }
//         }
//       }

//       return () => {
//         stopLocationTracking();
//         subscription.remove();
//       };
//     };

//     init();
//   }, []);
  
//   // Check battery optimization on Android
//   // This will prompt the user to disable battery optimization for the app                    
//   useEffect(() => {
//     const checkBatteryOptimization = async () => {
//       if (Platform.OS === 'android') {
//         const PowerManager = NativeModules.PowerManager;
//         const isIgnoring = await PowerManager.isIgnoringBatteryOptimizations();
//         if (!isIgnoring) {
//           Alert.alert(
//             'Battery Optimization',
//             'For reliable background location, please disable battery optimization',
//             [
//               { text: 'Later' },
//               { text: 'Open Settings', onPress: () => PowerManager.openBatterySettings() }
//             ]
//           );
//         }
//       }
//     };

//     checkBatteryOptimization();
//   }, []);

//   return (
//     <SafeAreaProvider>
//       <LanguageProvider>
//         <ContextProps.Provider value={{ appUpdate, setAppUpdate }}>
//           <NavigationContainer ref={navigationRef}>
//             <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
//               <Stack.Screen name="Dashboard" component={DashboardPage} />
//               <Stack.Screen name="Splash" component={SplashScreen} />
//               <Stack.Screen name="Login" component={LoginScreen} />
//               <Stack.Screen name="Register" component={RegisterScreen} />
//               <Stack.Screen name="Profile" component={ProfileScreen} />
//               <Stack.Screen name="ProfileEdit" component={ProfileEdit} />
//               <Stack.Screen name="ServicesDirectory" component={ServicesDirectory} />
//               <Stack.Screen name="CreateService" component={CreateService} />
//               <Stack.Screen name="CategoryServices" component={CategotryServices} />

//               <Stack.Screen name="JobView" component={JobView} />
//               <Stack.Screen name="ViewApplicants" component={ViewApplicants} />

//               <Stack.Screen name="MultilingualSupport" component={MultilingualSupportPage} />
//               <Stack.Screen name="Notifications" component={NotificationList} />
//               <Stack.Screen name="NotificationView" component={NotificationView} />

//               <Stack.Screen name="HelpRequest" component={HelpRequestPage} />
//               <Stack.Screen name="CategoryHelp" component={CategoryHelp} />
//               <Stack.Screen name="CreateHelp" component={CreateHelp} />

//               <Stack.Screen name="EventCalendar" component={EventCalendarPage} />
//               <Stack.Screen name="CreateRegister" component={CreateRegister} options={{ title: 'Create Register' }} />

//               <Stack.Screen name="CreateEventPage" component={CreateEventPage} options={{ title: 'Create Event Page' }} />

//               <Stack.Screen name="MigrantsList" component={MigrantsList} />
//               <Stack.Screen name="ProfileView" component={ProfileView} />
//               <Stack.Screen name="CreateEvent" component={CreateEvent} options={{ title: 'Create Event' }} />
//               <Stack.Screen name="NewsList" component={NewsList} options={{ title: 'News' }} />
//               <Stack.Screen name="NewsDetail" component={NewsDetail} options={{ title: 'News Detail' }} />
//               <Stack.Screen name="CreateNews" component={CreateNews} options={{ title: 'Create News' }} />

//               {/* <Stack.Screen name="WorkersList" component={WorkersScreen} options={{ title: 'Workers List' }} /> */}
//               <Stack.Screen name="ContactUs" component={ContactUs} options={{ title: 'Contact Us' }} />
//               <Stack.Screen name="LocationHistory" component={LocationHistory} options={{ title: 'Location History' }} />

//             </Stack.Navigator>
//             {/* <Toast config={toastConfig} /> */}
//           </NavigationContainer>
//           <NetworkStatus />
//         </ContextProps.Provider>
//       </LanguageProvider>
//     </SafeAreaProvider>
//   )
// }

// export default App



import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen.js';
import LoginScreen from './src/screens/LoginScreen.js';
import React, { createContext, useEffect, useState, useRef } from 'react'
import ProfileScreen from './src/screens/ProfileScreen.js';
import DashboardPage from './src/pages/DashboardPage.js';
import ServicesDirectory from './src/pages/ServicesDirectory.js';
import MultilingualSupportPage from './src/pages/MultilingualSupportPage.js';
import HelpRequestPage from './src/pages/HelpRequestPage.js';
import EventCalendarPage from './src/pages/EventCalendarPage.js';
import CreateEventPage from './src/pages/CreateEventPage.js';
import RegisterScreen from './src/screens/RegisterScreen.js';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import ProfileEdit from './src/screens/ProfileEdit.js';
import CreateService from './src/pages/CreateService.js';
import { navigationRef } from './src/api/navigationRef.js';
import CreateRegister from './src/pages/CreateRegister.js';
import { LanguageProvider } from './src/language/commondir.js';
import MigrantsList from './src/pages/MigrantsList.js';
import ProfileView from './src/pages/UserProfileView.js';
import NetworkStatus from './src/context/NetworkStatus.js';
import { Alert, AppState, Linking, LogBox, NativeModules, Platform, Text, View } from 'react-native';
import CreateEvent from './src/pages/CreateEvent.js';
import NewsList from './src/pages/news/NewsList.js';
import NewsDetail from './src/pages/news/NewsDetail.js';
import CreateNews from './src/pages/news/CreateNews.js';
import ContactUs from './src/pages/contactus/ContactUs.js';
import CategotryServices from './src/pages/CategotryServices.js';
import CategoryHelp from './src/pages/help/CategoryHelp.js';
import CreateHelp from './src/pages/help/CreateHelp.js';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// notification
import NotificationList from './src/pages/notifications/NotificationList.jsx';
import NotificationView from './src/pages/notifications/NotificationView.jsx';
import JobView from './src/pages/job/JobView.js';
import ViewApplicants from './src/pages/job/ViewApplicants.js';
import LocationViewScreen from './src/screens/LocationViewScreen.js';
import LocationHistory from './src/screens/LocationHistory.js';
import { 
  startLocationTracking, 
  stopLocationTracking, 
  handleAppStateChange,
  requestLocationPermissions,
  checkBatteryOptimization,
  getTrackingStatus
} from './src/services/LocationService.js';

LogBox.ignoreAllLogs(); // just for testing crash

const Stack = createNativeStackNavigator();
export const ContextProps = createContext(null);

function App() {
  const [appUpdate, setAppUpdate] = useState(true);
  const appState = useRef(AppState.currentState);
  const [isLocationInitialized, setIsLocationInitialized] = useState(false);

  // Single useEffect for location tracking initialization
  useEffect(() => {
    let appStateSubscription;
    
    const initializeLocationTracking = async () => {
      try {
        console.log('[📍] Initializing location tracking...');
        
        // Request permissions first
        const hasPermissions = await requestLocationPermissions();
        if (!hasPermissions) {
          console.log('[📍] Location permissions denied');
          Alert.alert(
            'Location Permission Required',
            'Please enable location permissions in settings for the app to work properly.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }

        // Check battery optimization on Android
        if (Platform.OS === 'android') {
          await checkBatteryOptimization();
        }

        // Start location tracking
        const trackingStarted = await startLocationTracking();
        if (trackingStarted) {
          setIsLocationInitialized(true);
          console.log('[📍] Location tracking initialized successfully');
        } else {
          console.error('[📍] Failed to initialize location tracking');
        }

        // Set up app state listener
        appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
          console.log('[📍] App state transition:', appState.current, '->', nextAppState);
          
          if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
            console.log('[📍] App has come to the foreground');
          }
          
          appState.current = nextAppState;
          handleAppStateChange(nextAppState);
        });

      } catch (error) {
        console.error('[📍] Location tracking initialization error:', error);
      }
    };

    initializeLocationTracking();

    // Cleanup function
    return () => {
      console.log('[📍] Cleaning up location tracking...');
      if (appStateSubscription) {
        appStateSubscription.remove();
      }
      if (isLocationInitialized) {
        stopLocationTracking();
      }
    };
  }, []); // Empty dependency array - run once on mount

  // Optional: Add a status check effect (for debugging)
  useEffect(() => {
    if (isLocationInitialized) {
      const checkStatus = () => {
        const status = getTrackingStatus();
        console.log('[📍] Tracking status:', status);
      };
      
      const interval = setInterval(checkStatus, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [isLocationInitialized]);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ContextProps.Provider value={{ appUpdate, setAppUpdate }}>
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Dashboard" component={DashboardPage} />
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="ProfileEdit" component={ProfileEdit} />
              <Stack.Screen name="ServicesDirectory" component={ServicesDirectory} />
              <Stack.Screen name="CreateService" component={CreateService} />
              <Stack.Screen name="CategoryServices" component={CategotryServices} />

              <Stack.Screen name="JobView" component={JobView} />
              <Stack.Screen name="ViewApplicants" component={ViewApplicants} />

              <Stack.Screen name="MultilingualSupport" component={MultilingualSupportPage} />
              <Stack.Screen name="Notifications" component={NotificationList} />
              <Stack.Screen name="NotificationView" component={NotificationView} />

              <Stack.Screen name="HelpRequest" component={HelpRequestPage} />
              <Stack.Screen name="CategoryHelp" component={CategoryHelp} />
              <Stack.Screen name="CreateHelp" component={CreateHelp} />

              <Stack.Screen name="EventCalendar" component={EventCalendarPage} />
              <Stack.Screen name="CreateRegister" component={CreateRegister} options={{ title: 'Create Register' }} />

              <Stack.Screen name="CreateEventPage" component={CreateEventPage} options={{ title: 'Create Event Page' }} />

              <Stack.Screen name="MigrantsList" component={MigrantsList} />
              <Stack.Screen name="ProfileView" component={ProfileView} />
              <Stack.Screen name="CreateEvent" component={CreateEvent} options={{ title: 'Create Event' }} />
              <Stack.Screen name="NewsList" component={NewsList} options={{ title: 'News' }} />
              <Stack.Screen name="NewsDetail" component={NewsDetail} options={{ title: 'News Detail' }} />
              <Stack.Screen name="CreateNews" component={CreateNews} options={{ title: 'Create News' }} />

              <Stack.Screen name="ContactUs" component={ContactUs} options={{ title: 'Contact Us' }} />
              <Stack.Screen name="LocationHistory" component={LocationHistory} options={{ title: 'Location History' }} />
            </Stack.Navigator>
          </NavigationContainer>
          <NetworkStatus />
        </ContextProps.Provider>
      </LanguageProvider>
    </SafeAreaProvider>
  )
}

export default App


// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import SplashScreen from './src/screens/SplashScreen.js';
// import LoginScreen from './src/screens/LoginScreen.js';
// import React, { createContext, useEffect, useState } from 'react'
// import ProfileScreen from './src/screens/ProfileScreen.js';
// import DashboardPage from './src/pages/DashboardPage.js';
// import ServicesDirectory from './src/pages/ServicesDirectory.js';
// import MultilingualSupportPage from './src/pages/MultilingualSupportPage.js';
// import HelpRequestPage from './src/pages/HelpRequestPage.js';
// import EventCalendarPage from './src/pages/EventCalendarPage.js';
// import CreateEventPage from './src/pages/CreateEventPage.js';
// import RegisterScreen from './src/screens/RegisterScreen.js';
// import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
// import ProfileEdit from './src/screens/ProfileEdit.js';
// import CreateService from './src/pages/CreateService.js';
// import { navigationRef } from './src/api/navigationRef.js';
// import CreateRegister from './src/pages/CreateRegister.js';
// import { LanguageProvider } from './src/language/commondir.js';
// import MigrantsList from './src/pages/MigrantsList.js';
// import ProfileView from './src/pages/UserProfileView.js';
// import NetworkStatus from './src/context/NetworkStatus.js';
// import { Alert, AppState, Linking, LogBox, NativeModules, Platform, Text, View } from 'react-native';
// import CreateEvent from './src/pages/CreateEvent.js';
// import NewsList from './src/pages/news/NewsList.js';
// import NewsDetail from './src/pages/news/NewsDetail.js';
// import CreateNews from './src/pages/news/CreateNews.js';
// import ContactUs from './src/pages/contactus/ContactUs.js';
// import CategotryServices from './src/pages/CategotryServices.js';
// import CategoryHelp from './src/pages/help/CategoryHelp.js';
// import CreateHelp from './src/pages/help/CreateHelp.js';
// import { SafeAreaProvider } from 'react-native-safe-area-context';

// // notification
// import NotificationList from './src/pages/notifications/NotificationList.jsx';
// import NotificationView from './src/pages/notifications/NotificationView.jsx';
// import JobView from './src/pages/job/JobView.js';
// import ViewApplicants from './src/pages/job/ViewApplicants.js';
// import LocationViewScreen from './src/screens/LocationViewScreen.js';
// import LocationHistory from './src/screens/LocationHistory.js';
// import { startLocationTracking, stopLocationTracking, handleAppStateChange, requestLocationPermissions } from './src/services/LocationService.js';

// LogBox.ignoreAllLogs(); // just for testing crash

// const Stack = createNativeStackNavigator();
// export const ContextProps = createContext(null);

// function App() {
//   const [appUpdate, setAppUpdate] = useState(true);
//   const [locationTrackingStarted, setLocationTrackingStarted] = useState(false);

//   // Initialize location tracking once
//   useEffect(() => {
//     let appStateSubscription = null;

//     const initializeLocationTracking = async () => {
//       try {
//         console.log('[📍] Initializing location tracking...');
        
//         // Request permissions first
//         const hasPermissions = await requestLocationPermissions();
//         if (!hasPermissions) {
//           Alert.alert(
//             'Location Permission Required',
//             'This app requires location permissions to function properly. Please enable location permissions in your device settings.',
//             [
//               { 
//                 text: 'Cancel', 
//                 style: 'cancel',
//                 onPress: () => console.log('[📍] User cancelled permission request')
//               },
//               { 
//                 text: 'Open Settings', 
//                 onPress: () => Linking.openSettings()
//               },
//             ]
//           );
//           return;
//         }

//         // Start location tracking
//         const trackingStarted = await startLocationTracking();
//         if (trackingStarted) {
//           setLocationTrackingStarted(true);
//           console.log('[📍] Location tracking initialized successfully');
//         } else {
//           console.error('[📍] Failed to start location tracking');
//           Alert.alert(
//             'Location Tracking Error',
//             'Failed to start location tracking. Some features may not work properly.',
//             [{ text: 'OK' }]
//           );
//         }

//         // Set up app state change listener
//         appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

//       } catch (error) {
//         console.error('[📍] Location tracking initialization error:', error);
//         Alert.alert(
//           'Initialization Error', 
//           'Failed to initialize location services. Please restart the app.',
//           [{ text: 'OK' }]
//         );
//       }
//     };

//     initializeLocationTracking();

//     // Cleanup function
//     return () => {
//       if (appStateSubscription) {
//         appStateSubscription.remove();
//       }
//       if (locationTrackingStarted) {
//         stopLocationTracking().catch(error => 
//           console.error('[📍] Error stopping location tracking:', error)
//         );
//       }
//     };
//   }, []); // Empty dependency array - run only once

//   // Check battery optimization on Android
//   useEffect(() => {
//     const checkBatteryOptimization = async () => {
//       if (Platform.OS === 'android') {
//         try {
//           const { PowerManager } = NativeModules;
//           if (PowerManager) {
//             const isIgnoring = await PowerManager.isIgnoringBatteryOptimizations();
//             if (!isIgnoring) {
//               setTimeout(() => {
//                 Alert.alert(
//                   'Battery Optimization',
//                   'For reliable background location tracking, please disable battery optimization for this app. This helps ensure location updates work properly even when the app is in the background.',
//                   [
//                     { text: 'Later', style: 'cancel' },
//                     { 
//                       text: 'Open Settings', 
//                       onPress: () => PowerManager.openBatterySettings()
//                     }
//                   ]
//                 );
//               }, 3000); // Delay to avoid showing immediately with permission dialogs
//             }
//           }
//         } catch (error) {
//           console.error('[📍] Battery optimization check error:', error);
//         }
//       }
//     };

//     // Check battery optimization after a delay to ensure app is fully loaded
//     const timer = setTimeout(checkBatteryOptimization, 5000);
//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <SafeAreaProvider>
//       <LanguageProvider>
//         <ContextProps.Provider value={{ appUpdate, setAppUpdate, locationTrackingStarted }}>
//           <NavigationContainer ref={navigationRef}>
//             <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
//               <Stack.Screen name="Dashboard" component={DashboardPage} />
//               <Stack.Screen name="Splash" component={SplashScreen} />
//               <Stack.Screen name="Login" component={LoginScreen} />
//               <Stack.Screen name="Register" component={RegisterScreen} />
//               <Stack.Screen name="Profile" component={ProfileScreen} />
//               <Stack.Screen name="ProfileEdit" component={ProfileEdit} />
//               <Stack.Screen name="ServicesDirectory" component={ServicesDirectory} />
//               <Stack.Screen name="CreateService" component={CreateService} />
//               <Stack.Screen name="CategoryServices" component={CategotryServices} />

//               <Stack.Screen name="JobView" component={JobView} />
//               <Stack.Screen name="ViewApplicants" component={ViewApplicants} />

//               <Stack.Screen name="MultilingualSupport" component={MultilingualSupportPage} />
//               <Stack.Screen name="Notifications" component={NotificationList} />
//               <Stack.Screen name="NotificationView" component={NotificationView} />

//               <Stack.Screen name="HelpRequest" component={HelpRequestPage} />
//               <Stack.Screen name="CategoryHelp" component={CategoryHelp} />
//               <Stack.Screen name="CreateHelp" component={CreateHelp} />

//               <Stack.Screen name="EventCalendar" component={EventCalendarPage} />
//               <Stack.Screen name="CreateRegister" component={CreateRegister} options={{ title: 'Create Register' }} />

//               <Stack.Screen name="CreateEventPage" component={CreateEventPage} options={{ title: 'Create Event Page' }} />

//               <Stack.Screen name="MigrantsList" component={MigrantsList} />
//               <Stack.Screen name="ProfileView" component={ProfileView} />
//               <Stack.Screen name="CreateEvent" component={CreateEvent} options={{ title: 'Create Event' }} />
//               <Stack.Screen name="NewsList" component={NewsList} options={{ title: 'News' }} />
//               <Stack.Screen name="NewsDetail" component={NewsDetail} options={{ title: 'News Detail' }} />
//               <Stack.Screen name="CreateNews" component={CreateNews} options={{ title: 'Create News' }} />

//               <Stack.Screen name="ContactUs" component={ContactUs} options={{ title: 'Contact Us' }} />
//               <Stack.Screen name="LocationHistory" component={LocationHistory} options={{ title: 'Location History' }} />

//             </Stack.Navigator>
//           </NavigationContainer>
//           <NetworkStatus />
//         </ContextProps.Provider>
//       </LanguageProvider>
//     </SafeAreaProvider>
//   )
// }

// export default App