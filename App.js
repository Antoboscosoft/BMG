import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen.js';
import LoginScreen from './src/screens/LoginScreen.js';
import React from 'react'
import ProfileScreen from './src/screens/ProfileScreen.js';
import DashboardPage from './src/pages/DashboardPage.js';
import ServicesDirectory from './src/pages/ServicesDirectory.js';
import MultilingualSupportPage from './src/pages/MultilingualSupportPage.js';
import NotificationsPage from './src/pages/NotificationsPage.js';
import HelpRequestPage from './src/pages/HelpRequestPage.js';
import EventCalendarPage from './src/pages/EventCalendarPage.js';
import CreateEventPage from './src/pages/CreateEventPage.js';
import RegisterScreen from './src/screens/RegisterScreen.js';
import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Dashboard" component={DashboardPage} />
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ServicesDirectory" component={ServicesDirectory} />
        <Stack.Screen name="MultilingualSupport" component={MultilingualSupportPage} />
        <Stack.Screen name="Notifications" component={NotificationsPage} />
        <Stack.Screen name="HelpRequest" component={HelpRequestPage} />
        <Stack.Screen name="EventCalendar" component={EventCalendarPage} />
        <Stack.Screen name="CreateEvent" component={CreateEventPage} options={{ title: 'Create Event' }} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  )
}

export default App