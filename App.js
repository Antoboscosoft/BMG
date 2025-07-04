import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen.js';
import LoginScreen from './src/screens/LoginScreen.js';
import React, { createContext, useEffect, useState } from 'react'
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
import { Alert, Linking, LogBox, Platform, Text, View } from 'react-native';
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
import LocationHistory from './src/screens/LocationHistory.js';
import { checkIfLocationEnabled, requestLocationPermissions01 } from './src/services/LocationService.js';
import { notificationPermission } from './src/context/utils.js';

LogBox.ignoreAllLogs(); // just for testing crash


// Custom Toast configuration
const toastConfig = {
  /*
    Overwrite 'success' type,
    modifying the existing BaseToast component
  */
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: 'green', backgroundColor: '#f8f9fa' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17,
        fontWeight: 'bold',
        color: '#28a745'
      }}
      text2Style={{
        fontSize: 15,
        color: '#6c757d'
      }}
    />
  ),
  /*
    Overwrite 'error' type,
    modifying the existing ErrorToast component
  */
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: 'red', backgroundColor: '#f8f9fa' }}
      text1Style={{
        fontSize: 17,
        fontWeight: 'bold',
        color: '#dc3545'
      }}
      text2Style={{
        fontSize: 15,
        color: '#6c757d'
      }}
    />
  ),
  /*
    Or create a completely new type - 'info',
    building the layout from scratch
  */
  info: (props) => (
    <View style={{
      width: '90%',
      padding: 15,
      backgroundColor: '#d1ecf1',
      borderLeftColor: '#0dcaf0',
      borderLeftWidth: 6,
      borderRadius: 8
    }}>
      <Text style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0c5460',
        marginBottom: 4
      }}>
        {props.text1}
      </Text>
      <Text style={{
        fontSize: 14,
        color: '#0c5460'
      }}>
        {props.text2}
      </Text>
    </View>
  )
};

const Stack = createNativeStackNavigator();
export const ContextProps = createContext(null);

function App() {
  const [appUpdate, setAppUpdate] = useState(true);

  useEffect(() => {
    const init = async () => {
      const granted = await requestLocationPermissions01();
      if (granted) {
        const isLocationEnabled = await checkIfLocationEnabled();

        if (!isLocationEnabled) {
          Alert.alert(
            'Turn On Location',
            'Please enable location services to get your current location.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => {
                  if (Platform.OS === 'android') {
                    Linking.openSettings(); // or use IntentLauncher
                  }
                },
              },
            ]
          );
          return;
        }
      }
      notificationPermission();

      // initBackgroundFetch();
    };
    init();
  }, []);

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

              {/* <Stack.Screen name="WorkersList" component={WorkersScreen} options={{ title: 'Workers List' }} /> */}
              <Stack.Screen name="ContactUs" component={ContactUs} options={{ title: 'Contact Us' }} />
              <Stack.Screen name="LocationHistory" component={LocationHistory} options={{ title: 'Location History' }} />

            </Stack.Navigator>
            {/* <Toast config={toastConfig} /> */}
          </NavigationContainer>
          <NetworkStatus />
        </ContextProps.Provider>
      </LanguageProvider>
    </SafeAreaProvider>
  )
}

export default App