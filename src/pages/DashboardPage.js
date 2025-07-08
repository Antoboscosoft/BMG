import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TouchableWithoutFeedback,
    PanResponder,
    Image,
    FlatList,
    ActivityIndicator,
    Modal,
    BackHandler,
    Pressable,
    StatusBar,
    PermissionsAndroid,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAccessToken, getUserData, sendUserLocation, updateFirebaseToken } from '../api/auth';
import { clearAuthToken } from '../api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { LanguageContext, useLanguage } from '../language/commondir';
import { appVersion, checkAppVersion, everyTimeSendLocationtoBackendTime, getFirebaseToken, handleNotification } from '../context/utils';
import { ContextProps } from '../../App';
import notifee from '@notifee/react-native';
import { messaging } from '../..';
import { initBackgroundLocationTracking } from '../services/LocationService';
import { checkIfLocationEnabled, getCurrentLocation, requestLocationPermissions, requestLocationPermissions01, sendSavedLocations } from '../services/LocationService.js';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

function DashboardPage({ navigation, route }) {
    const { appUpdate, setAppUpdate } = useContext(ContextProps);
    const { languageTexts, language } = useLanguage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const slideAnim = useState(new Animated.Value(-250))[0];
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef(null);
    const isSuperAdmin = userData?.data?.role?.name === "Super Admin" || userData?.data?.role?.name === "Admin" || userData?.data?.role?.name === "Staff";
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { setUser } = useContext(LanguageContext);
    const locationIntervalRef = useRef(null);
    const locationCheckIntervalRef = useRef(null);

    const dashboardMenuItems = [
        { id: '6', name: 'profile', screen: 'Profile', icon: 'account' },
        { id: '1', name: 'eventCalendar', screen: 'EventCalendar', icon: 'calendar-month' },
        { id: '2', name: 'servicesDirectory', screen: 'ServicesDirectory', icon: 'handshake' },
        { id: '3', name: 'notifications', screen: 'Notifications', icon: 'bell-outline' },
        { id: '4', name: 'multilingualSupport', screen: 'MultilingualSupport', icon: 'translate' },
        { id: '7', name: 'migrants', screen: 'MigrantsList', icon: 'account-group' },
        { id: '8', name: 'news', screen: 'NewsList', icon: 'newspaper' },
        { id: '9', name: 'helpRequest', screen: 'HelpRequest', icon: 'life-ring' }, // Icon field kept for consistency, but we'll use the local image
    ];

    // function to send firebase token to API
    const sendToken = async () => {
        try {
            let token = await getFirebaseToken();
            updateFirebaseToken(token).then((response) => {
                // console.log('Firebase token sent successfully:', response);
            }).catch((error) => {
                console.error('Failed to send Firebase token:', error);
            })
        } catch (error) {
            console.error('Failed to send Firebase token:', error);
        }
    }


    // Function to handle location tracking every 5 minutes
    const startLocationTracking = async () => {
        try {
            console.log('🚀 [Dashboard] Starting location tracking...');

            // Check if location is enabled
            const isLocationEnabled = await checkIfLocationEnabled();
            if (!isLocationEnabled) {
                console.log('❌ [Dashboard] Location services are disabled');
                return;
            }

            // Check permissions
            const hasPermission = await requestLocationPermissions01();
            if (!hasPermission) {
                console.log('❌ [Dashboard] Location permissions not granted');
                // Optional: Still proceed with foreground-only tracking if fine location was granted
                const fineLocation = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                if (fineLocation) {
                    console.log('✅ [Dashboard] Proceeding with foreground-only location tracking');
                    await handleLocationUpdate();
                    locationIntervalRef.current = setInterval(handleLocationUpdate, 5 * 60 * 1000);
                    return;
                }
                return;
            }

            console.log('✅ [Dashboard] Location permissions granted, starting tracking');

            // Initial location fetch
            await handleLocationUpdate();

            // Set up interval for every 5 minutes (300000 ms)
            locationIntervalRef.current = setInterval(async () => {
                await handleLocationUpdate();
            }, 5 * 60 * 1000); // 5 minutes

            console.log('⏰ [Dashboard] Location tracking interval set for every 5 minutes');

        } catch (error) {
            console.error('❌ [Dashboard] Location tracking setup failed:', error);
        }
    };

    // Function to handle location update
    const handleLocationUpdate = async () => {
        try {
            console.log('📍 [Dashboard] Fetching current location...');

            const location = await getCurrentLocation();
            if (location) {
                console.log('📍 [Dashboard] Location obtained:', {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    timestamp: location.timestamp
                });

                // Store in AsyncStorage
                await storeLocationInAsync(location);

                // Send to backend
                await sendLocationToBackend(location);

                // Update last sync time
                const currentTime = new Date().getTime();
                await AsyncStorage.setItem('lastSyncTime', currentTime.toString());
                console.log('⏰ [Dashboard] Last sync time updated:', new Date(currentTime).toISOString());

            } else {
                console.log('❌ [Dashboard] Failed to get location');
            }
        } catch (error) {
            console.error('❌ [Dashboard] Location update failed:', error);
        }
    };

    // Function to check last sync time and update location if needed
    const checkAndUpdateLocation = async () => {
        try {
            console.log('🚀 [Dashboard] Checking last sync time...');

            // Check if location services are ON
            const isLocationEnabled = await checkIfLocationEnabled();
            if (!isLocationEnabled) {
                console.log('❌ [Dashboard] Location services are disabled');
                return;
            }

            // Check fine location permission only (no background permission!)
            const hasPermission = await requestLocationPermissions01();
            if (!hasPermission) {
                console.log('❌ [Dashboard] Location permission not granted');
                const fineLocation = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                if (!fineLocation) {
                    console.log('❌ [Dashboard] Fine location not granted. Exiting.');
                    return;
                }
            }

            // Check time difference
            const lastSync = await AsyncStorage.getItem('lastSyncTime');
            const lastSyncTime = lastSync ? parseInt(lastSync, 10) : 0;
            const currentTime = Date.now();
            // 5 minutes
            // const timeDiffMinutes = (currentTime - lastSyncTime) / (1000 * 60);
            // 2 hours
            // const timeDiffMinutes = (currentTime - lastSyncTime) / (1000 * 60 * 60 * 2);
            // 1 hour
            // const timeDiffMinutes = (currentTime - lastSyncTime) / (1000 * 60 * 60);
            // 5 hour
            const timeDiffMinutes = (currentTime - lastSyncTime) / (1000 * 60 * 60 * 5);
            console.log('⏱️ [Dashboard] Time since last sync (min):', timeDiffMinutes);

            if (timeDiffMinutes >= everyTimeSendLocationtoBackendTime) {
                console.log('📍 [Dashboard] 5+ minutes passed. Getting new location...');
                const location = await getCurrentLocation();
                if (location) {
                    await storeLocationInAsync(location);
                    await sendLocationToBackend(location);
                    await AsyncStorage.setItem('lastSyncTime', currentTime.toString());
                    console.log('✅ [Dashboard] Location sent & last sync time updated');
                } else {
                    console.log('❌ [Dashboard] Failed to get location');
                }
            } else {
                console.log('⏳ [Dashboard] Less than 5 minutes. No need to update location');
            }

        } catch (error) {
            console.error('❌ [Dashboard] Failed to check/send location:', error);
        }
    };

    // Run on screen focus
    useFocusEffect(
        useCallback(() => {
            if (!userData?.data?.id) return;

            console.log('👤 [Dashboard] Screen focused for user:', userData.data.id);

            checkAndUpdateLocation();

            sendSavedLocations()
                .then(() => console.log('📤 [Dashboard] Offline locations sent successfully'))
                .catch(error => console.error('❌ [Dashboard] Failed to send offline locations:', error));

        }, [userData?.data?.id])
    );

    // Auto check every 1 minute when Dashboard is open
    useEffect(() => {
        if (!userData?.data?.id) return;

        locationCheckIntervalRef.current = setInterval(() => {
            console.log('⏰ [Dashboard] Periodic location check triggered');
            checkAndUpdateLocation();
        }, 60 * 1000);  // Check every 1 minute

        return () => {
            clearInterval(locationCheckIntervalRef.current);
            locationCheckIntervalRef.current = null;
            console.log('🛑 [Dashboard] Cleared location check interval');
        };
    }, [userData?.data?.id]);


    // Function to store location in AsyncStorage
    const storeLocationInAsync = async (location) => {
        try {
            const locationData = {
                ...location,
                storedAt: new Date().toISOString(),
                userId: userData?.data?.id
            };

            // Get existing locations
            const existingLocations = await AsyncStorage.getItem('userLocations');
            let locations = existingLocations ? JSON.parse(existingLocations) : [];

            // Add new location
            locations.push(locationData);

            // Keep only last 50 locations to avoid storage issues
            if (locations.length > 50) {
                locations = locations.slice(-50);
            }

            // Store back to AsyncStorage
            await AsyncStorage.setItem('userLocations', JSON.stringify(locations));

            console.log('💾 [Dashboard] Location stored in AsyncStorage:', {
                latitude: location.latitude,
                longitude: location.longitude,
                timestamp: location.timestamp,
                totalLocationsStored: locations.length
            });

        } catch (error) {
            console.error('❌ [Dashboard] Failed to store location in AsyncStorage:', error);
        }
    };

    // Function to send location to backend
    const sendLocationToBackend = async (location) => {
        try {
            console.log('🌐 [Dashboard] Sending location to backend...');

            const response = await sendUserLocation(location);
            console.log('✅ [Dashboard] Location sent to backend successfully:', {
                latitude: location.latitude,
                longitude: location.longitude,
                timestamp: location.timestamp,
                response: response?.status || 'success'
            });

        } catch (error) {
            console.error('❌ [Dashboard] Failed to send location to backend:', error);

            // Store in offline storage if network fails
            try {
                const offlineLocations = await AsyncStorage.getItem('offlineLocations');
                let locations = offlineLocations ? JSON.parse(offlineLocations) : [];
                locations.push(location);
                await AsyncStorage.setItem('offlineLocations', JSON.stringify(locations));
                console.log('💾 [Dashboard] Location stored offline for retry');
            } catch (offlineError) {
                console.error('❌ [Dashboard] Failed to store offline location:', offlineError);
            }
        }
    };

    // Function to stop location tracking
    // const stopLocationTracking = () => {
    //     if (locationIntervalRef.current) {
    //         clearInterval(locationIntervalRef.current);
    //         locationIntervalRef.current = null;
    //         console.log('🛑 [Dashboard] Location tracking stopped');
    //     }
    // };

    // // Location tracking useEffect
    // useEffect(() => {
    //     if (!userData?.data?.id) return;

    //     console.log('👤 [Dashboard] User data available, setting up location tracking for user:', userData.data.id);

    //     // Start location tracking
    //     startLocationTracking();

    //     // Send any saved offline locations
    //     sendSavedLocations().then(() => {
    //         console.log('📤 [Dashboard] Offline locations sent successfully');
    //     }).catch(error => {
    //         console.error('❌ [Dashboard] Failed to send offline locations:', error);
    //     });

    //     // Cleanup on unmount
    //     return () => {
    //         stopLocationTracking();
    //     };
    // }, [userData?.data?.id]);



    useEffect(() => {
        const setRoleInAsyncStorage = async () => {
            try {
                const role = userData?.data?.role?.name || 'User';
                await AsyncStorage.setItem('userRole', role);
            } catch (error) {
                console.error('Failed to set user role in AsyncStorage:', error);
            }
        };

        if (userData) {
            setRoleInAsyncStorage();
            sendToken();

        }
    }, [userData]);

    const filteredMenuItems = isSuperAdmin
        ? dashboardMenuItems.filter(item =>
            ['multilingualSupport', 'profile', 'migrants', 'eventCalendar', 'servicesDirectory', 'news', 'helpRequest', 'notifications'].includes(item.name)
        )
        : dashboardMenuItems.filter(item => item.name !== 'migrants');

    const carouselItems = [
        {
            title: languageTexts?.dashboard?.welcome?.replace('{name}', userData?.data?.name || 'User'),
            image: require('../asserts/images/car01.jpg'),
        },
        {
            title: languageTexts?.dashboard?.carousel?.stayUpdated || 'Stay Updated with Events!',
            image: require('../asserts/images/car02.jpg'),
        },
        {
            title: languageTexts?.dashboard?.carousel?.discoverSector || 'Discover Your Sector',
            image: require('../asserts/images/car03.jpg'),
        },
        {
            title: languageTexts?.dashboard?.carousel?.stayUpdated || 'Discover Your Sector',
            image: require('../asserts/images/car04.jpg'),
        },
        {
            title: languageTexts?.dashboard?.carousel?.discoverSector || 'Discover Your Sector',
            image: require('../asserts/images/car05.jpg'),
        },
        {
            title: languageTexts?.dashboard?.carousel?.discoverSector || 'Discover Your Sector',
            image: require('../asserts/images/imgpngdash3.png'),
        },
        {
            title: languageTexts?.dashboard?.carousel?.discoverSector || 'Discover Your Sector',
            image: require('../asserts/images/imgpngdash5.png'),
        },
        {
            title: languageTexts?.dashboard?.carousel?.discoverSector || 'Discover Your Sector',
            image: require('../asserts/images/imgpngdash7.png'),
        },
    ];

    const openSidebar = () => {
        setSidebarOpen(true);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeSidebar = () => {
        Animated.timing(slideAnim, {
            toValue: -250,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setSidebarOpen(false));
    };

    const handleMenuItemPress = async (label, screen) => {
        let name = screen.screen;
        if (name === 'Login') {
            setShowLogoutModal(true);
        } else {
            // navigation.navigate(name);
            navigation.navigate(name, { from: name, params: screen.params });
            closeSidebar();
        }
    };

    const handleMenuHeaderPress = () => {
        closeSidebar();
    };

    const sidebarPanResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dx < -10,
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx < -50) {
                    closeSidebar();
                }
            },
        })
    ).current;

    const screenPanResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.moveX < 30 && gestureState.dx > 10;
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx > 50 && !sidebarOpen) {
                    openSidebar();
                }
            },
        })
    ).current;

    useEffect(() => {
        const onBackPress = () => {
            if (isLoggingOut) {
                return true;
            }
            if (navigation.isFocused()) {
                setShowExitModal(true);
                return true;
            }
            return false;
        };
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
    }, [navigation, isLoggingOut]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (isLoggingOut) {
                return;
            }
            if (navigation.isFocused()) {
                e.preventDefault();
                setShowExitModal(true);
            }
        });
        return unsubscribe;
    }, [navigation, isLoggingOut]);

    useEffect(() => {
        checkAppVersion(appUpdate, setAppUpdate);

        const fetchUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('accessToken');
                if (!token) {
                    console.warn('No token found, redirecting to Login');
                    navigation.replace('Login');
                    return;
                }
                setLoading(true);
                const data = await getUserData();
                setUserData(data);
                setUser(data);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: error.message || 'Failed to load user data',
                });
                if (error.status === 401) {
                    await clearAuthToken();
                    navigation.replace('Login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigation]);

    useEffect(() => {
        if (!isSuperAdmin) {
            const interval = setInterval(() => {
                setActiveIndex(prev => {
                    const nextIndex = (prev + 1) % carouselItems.length;
                    carouselRef.current?.scrollToIndex({ index: nextIndex, animated: true });
                    return nextIndex;
                });
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [carouselItems, isSuperAdmin]);

    useEffect(() => {
        if (route?.params?.sessionExpired) {
            Toast.show({
                type: 'error',
                text1: 'Session Expired',
                text2: 'Your session has expired. Please login again.',
                position: 'center',
                autoHide: false,
                onHide: async () => {
                    await clearAuthToken();
                    navigation.replace('Login');
                },
                onPress: async () => {
                    await clearAuthToken();
                    navigation.replace('Login');
                }
            });
        }
    }, [route?.params?.sessionExpired, navigation]);

    // Push Notification click
    useEffect(() => {
        const handleNotificationClick = (remoteMessage) => {
            remoteMessage?.data?.screen && navigation.navigate(remoteMessage.data.screen, { notification_id: remoteMessage.data?.notification_id });
        }
        // Handle quit notification taps
        messaging.getInitialNotification().then(handleNotificationClick);

        // Handle background notification taps
        const unsubscribeForegroundClick = messaging.onNotificationOpenedApp(handleNotificationClick);

        // Handle foreground notification show
        const unsubscribeShowForegroundNotification = messaging.onMessage(remoteMessage => {
            handleNotification(remoteMessage);
        });

        // Handle foreground notification click
        const unsubscribeNotifeeEvent = notifee.onForegroundEvent(({ type, detail }) => {
            const { notification, pressAction } = detail;

            if (pressAction?.id && pressAction?.id === 'default') {
                handleNotificationClick(notification);
            }
        });

        return () => {
            unsubscribeForegroundClick();
            unsubscribeShowForegroundNotification();
            unsubscribeNotifeeEvent();
        }
    }, [])

    if (loading) {
        return (
            <View style={[styles.loadingContainer]}>
                <LinearGradient colors={['#5e3b15', '#b06a2c']} style={styles.loadingBackground}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>
                        {languageTexts?.dashboard?.loading || 'Loading your data...'}
                    </Text>
                </LinearGradient>
            </View>
        );
    }

    const renderCarouselItem = ({ item }) => (
        <View style={styles.carouselItem}>
            <Image source={item.image} style={styles.carouselImage} />
        </View>
    );

    const handleIconPress = (itemName) => {
        if (itemName === 'EventCalendar') {
            navigation.navigate('EventCalendar', { userData: userData.data });
        } else if (itemName === 'CreateEvent') {
            navigation.navigate('CreateEvent', { userData: userData.data });
        } else if (itemName === 'MigrantsList') {
            navigation.navigate('MigrantsList', { userData: userData.data });
        } else if (itemName === 'Profile') {
            navigation.navigate('Profile', { userData: userData.data });
        } else if (itemName === 'ServicesDirectory') {
            navigation.navigate('ServicesDirectory', { userData: userData.data });
        } else if (itemName === 'Notifications') {
            navigation.navigate('Notifications', { userData: userData.data });
        } else if (itemName === 'MultilingualSupport') {
            navigation.navigate('MultilingualSupport', { userData: userData.data });
        } else if (itemName === 'HelpRequest') {
            navigation.navigate('HelpRequest', { userData: userData.data });
        } else if (itemName === 'NewsList') {
            navigation.navigate('NewsList', { userData: userData.data });
        } else {
            navigation.navigate(itemName);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        setShowLogoutModal(false);
        await clearAuthToken();
        setUser({});
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
        setIsLoggingOut(false);
    };

    const handleExitApp = () => {
        setShowExitModal(false);
        setTimeout(() => {
            BackHandler.exitApp();
        }, 200);
    };


    // Add this useEffect in your DashboardPage component
    // useEffect(() => {
    //     const setupLocationTracking = async () => {
    //         try {
    //             // const token = await AsyncStorage.getItem('accessToken');
    //             const token = await getAccessToken();
    //             if (token) {
    //                 console.log('[Dashboard] Starting location tracking for user:', userData?.data?.id);
    //                 await initBackgroundLocationTracking(token);
    //             }
    //         } catch (error) {
    //             console.error('[Dashboard] Location tracking setup failed:', error);
    //         }
    //     };

    //     if (userData) {
    //         setupLocationTracking();
    //     }

    //     return () => {
    //         // Cleanup if needed
    //     };
    // }, [userData]);


    // Add this useEffect in your DashboardPage component
    // useEffect(() => {
    //     const setupLocationTracking = async () => {
    //         try {
    //             console.log('[Dashboard] Starting location tracking');
    //             await initBackgroundLocationTracking();
    //         } catch (error) {
    //             console.error('[Dashboard] Location tracking setup failed:', error);
    //         }
    //     };

    //     if (userData) {
    //         setupLocationTracking();
    //     }
    // }, []);



    return (
        <View style={styles.wrapper} {...screenPanResponder.panHandlers}>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
            />
            <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
                <LinearGradient
                    colors={['#C97B3C', '#7A401D']}
                    style={styles.container}
                >
                    <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
                        <Icon name="menu" size={26} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>
                        {languageTexts?.dashboard?.title || 'Dashboard'}
                    </Text>
                    <Text style={styles.welcomeText}>
                        👋 {languageTexts?.dashboard?.welcome?.replace('{name}', userData?.data?.name || 'User') || `Hi ${userData?.data?.name || 'User'}! Welcome to Bosco Migrants.`}
                    </Text>
                    <View style={styles.carouselContainer}>
                        <FlatList
                            data={carouselItems}
                            horizontal
                            pagingEnabled
                            ref={carouselRef}
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(event) => {
                                const index = Math.floor(event.nativeEvent.contentOffset.x / width);
                                setActiveIndex(index);
                            }}
                            renderItem={renderCarouselItem}
                            keyExtractor={(_, index) => index.toString()}
                        />
                    </View>
                    <View style={styles.gridContainer}>
                        {filteredMenuItems.map((item) => (
                            <View key={item.id} style={[
                                styles.gridItem,
                                filteredMenuItems.length % 3 !== 0 && styles.gridItem
                            ]}>
                                <TouchableOpacity
                                    style={styles.iconTouchable}
                                    onPress={() => handleIconPress(item.screen)}
                                >
                                    <View style={[styles.iconBackground, { backgroundColor: '#c5894a' }]}>
                                        {item.name === 'helpRequest' ? (
                                            <Image source={require('../asserts/images/helpimg3.png')} style={styles.helpImage} />
                                        ) : (
                                            <Icon
                                                name={item.icon}
                                                size={28}
                                                color="#FFF"
                                            />
                                        )}
                                    </View>
                                </TouchableOpacity>
                                <Text style={styles.gridText}>
                                    {languageTexts?.menu?.[item?.name] || item?.name}
                                </Text>
                            </View>
                        ))}
                        {filteredMenuItems.length % 3 === 2 && (
                            <View style={[styles.gridItem, styles.emptyItem]} />
                        )}
                    </View>
                </LinearGradient>
            </SafeAreaView>
            {sidebarOpen && (
                <TouchableWithoutFeedback onPress={closeSidebar}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>
            )}
            <Animated.View
                style={[
                    styles.sidebar,
                    {
                        transform: [{ translateX: slideAnim }],
                    },
                ]}
                {...sidebarPanResponder.panHandlers}
            >
                <SafeAreaView style={styles.sidebarSafeArea} edges={['top']}>
                    <TouchableOpacity onPress={handleMenuHeaderPress} style={styles.sidebarHeader}>
                        <Text style={styles.sidebarTitle}>
                            {languageTexts?.menu?.menus || 'Menus'}
                        </Text>
                    </TouchableOpacity>
                    {filteredMenuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={() => handleMenuItemPress(languageTexts?.menu?.[item.name] || item.name, { screen: item.screen })}
                        >
                            {item.name === 'helpRequest' ? (
                                <Image
                                    source={require('../asserts/images/helpimg3.png')}
                                    style={styles.helpImageMenu}
                                />
                            ) : (
                                <Icon name={item.icon} size={22} color="#fff" style={styles.menuIcon} />
                            )}
                            <Text style={styles.menuText}>
                                {languageTexts?.menu?.[item.name] || item.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('Contact Us', { screen: 'ContactUs' })}>
                        <Feather name="phone-call" size={22} color="#fff" style={styles.menuIcon} />
                        <Text style={styles.menuText}>{languageTexts?.menu?.contactUs || "Contact Us"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('Logout', { screen: 'Login' })}>
                        <Icon name="logout" size={22} color="#fff" style={styles.menuIcon} />
                        <Text style={styles.menuText}>
                            {languageTexts?.menu?.logout || 'Logout'}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.sidebarVersionContainer}>
                        <Text style={styles.sidebarVersionText}>{appVersion}</Text>
                    </View>
                </SafeAreaView>
            </Animated.View>
            <Modal
                visible={showLogoutModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLogoutModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <Pressable onPress={() => setShowLogoutModal(false)}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>{languageTexts?.dashboard?.logout || "Are you sure you want to logout?"}</Text>
                            <View style={styles.modalButtonRow}>
                                <TouchableOpacity style={styles.modalButton} onPress={() => setShowLogoutModal(false)}>
                                    <Text style={styles.modalButtonText}>{languageTexts?.dashboard?.cancel || "Cancel"}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalButton1} onPress={handleLogout}>
                                    <Text style={styles.modalButtonText}>{languageTexts?.menu?.logout || "Logout"}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Pressable>
                </View>
            </Modal>
            <Modal
                visible={showExitModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowExitModal(false)}
            >
                <TouchableOpacity
                    style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }]}
                    activeOpacity={1}
                    onPressOut={() => setShowExitModal(false)}
                >
                    <View style={[styles.modalOverlayExit, { padding: 24, borderRadius: 8, alignItems: 'center', minWidth: 280 }]}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>
                            {languageTexts?.dashboard?.closeApp || "Are you sure you want to close the app?"}
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1, marginRight: 8, padding: 12, borderRadius: 6,
                                    backgroundColor: '#6a6865',
                                    alignItems: 'center'
                                }}
                                onPress={() => setShowExitModal(false)}
                            >
                                <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>{languageTexts?.dashboard?.cancel || "Cancel"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flex: 1, marginLeft: 8, padding: 12, borderRadius: 6,
                                    backgroundColor: '#944D00',
                                    alignItems: 'center'
                                }}
                                onPress={handleExitApp}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{languageTexts?.dashboard?.close || "Close App"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

export default DashboardPage;

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 0,
    },
    menuButton: {
        backgroundColor: '#944D00',
        padding: 12,
        borderRadius: 25,
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 10,
    },
    title: {
        color: '#FFECD2',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 40,
    },
    welcomeText: {
        color: '#fff',
        fontSize: 18,
        marginTop: 15,
        textAlign: 'center',
        lineHeight: 28,
    },
    welcomeImage: {
        width: "80%",
        height: "30%",
        resizeMode: 'stretch',
        alignSelf: 'center',
        marginTop: 50,
        marginBottom: 20,
    },
    userInfoText: {
        color: '#FFF',
        fontSize: 14,
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    bottomContainer: {
        position: 'absolute',
        top: height * 0.8,
        alignSelf: 'center',
    },
    profileButton: {
        backgroundColor: '#d79650',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    sidebar: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 250,
        backgroundColor: '#944D00',
        paddingHorizontal: 15,
        elevation: 10,
        zIndex: 20,
    },
    sidebarSafeArea: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 250,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        zIndex: 15,
    },
    sidebarHeader: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    sidebarTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFECD2',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 8,
    },
    menuIcon: {
        marginRight: 15,
        width: 24,
        height: 24,
        textAlign: 'center',
    },
    menuText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    helpImageMenu: {
        width: 24,
        height: 24,
        marginRight: 15,
        resizeMode: 'contain',
    },
    carouselContainer: {
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    carouselItem: {
        width: width - 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    carouselImage: {
        width: width - 80,
        height: 240,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    carouselTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 10,
    },
    pagination: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'center',
    },
    paginationDot: {
        height: 8,
        width: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
        margin: 5,
    },
    iconContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        padding: 10,
    },
    gridIcon: {
        marginBottom: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 10,
        borderRadius: 10,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-start',
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 20,
    },
    gridItem: {
        width: '30%',
        marginBottom: 25,
        alignItems: 'center',
        marginHorizontal: '1.66%',
    },
    helpText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    iconTouchable: {
        marginBottom: 8,
    },
    iconBackground: {
        width: 63,
        height: 63,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#944D00',
    },
    iconImage: {
        width: 40,
        height: 40,
    },
    helpImage: {
        width: '60%',
        height: 60,
        resizeMode: 'contain',
    },
    gridText: {
        color: '#FFF',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
        paddingHorizontal: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    loadingBackground: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.9,
        borderRadius: 10,
    },
    loadingText: {
        marginTop: 20,
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    sidebarVersionContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    sidebarVersionText: {
        color: '#FFECD2',
        fontSize: 15,
        fontWeight: 'bold',
        opacity: 0.7,
        letterSpacing: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlayExit: {
        width: '80%',
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        width: '80%',
        maxWidth: 300,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        marginHorizontal: 8,
        backgroundColor: '#6a6865',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    modalButton1: {
        flex: 1,
        marginHorizontal: 8,
        backgroundColor: '#944D00',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});