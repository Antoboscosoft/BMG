import React, { useContext, useEffect, useRef, useState } from 'react';
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
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { getUserData } from '../api/auth';
import { clearAuthToken } from '../api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useLanguage } from '../language/commondir';
import { checkAppVersion } from '../context/utils';
import { ContextProps } from '../../App';

const { width, height } = Dimensions.get('window');

function DashboardPage({ navigation, route }) {
    const {appUpdate, setAppUpdate}= useContext(ContextProps);
    const { languageTexts, language } = useLanguage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const slideAnim = useState(new Animated.Value(-250))[0];
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef(null);
    const isSuperAdmin = userData?.data?.role?.name === "Super Admin" || userData?.data?.role?.name === "Admin" || userData?.data?.role?.name === "Staff";

    const dashboardMenuItems = [
        { id: '6', name: 'profile', screen: 'Profile', icon: 'account' },
        { id: '1', name: 'eventCalendar', screen: 'EventCalendar', icon: 'calendar-month' },
        // { id: '2', name: 'servicesDirectory', screen: 'ServicesDirectory', icon: 'hospital-box' },
        { id: '3', name: 'notifications', screen: 'Notifications', icon: 'bell-outline' },
        { id: '4', name: 'multilingualSupport', screen: 'MultilingualSupport', icon: 'translate' },
        // { id: '5', name: 'helpRequest', screen: 'HelpRequest', icon: 'help-circle-outline' },
        { id: '7', name: 'migrants', screen: 'MigrantsList', icon: 'account-group' },
        { id: '8', name: 'news', screen: 'NewsList', icon: 'newspaper' },
    ];

    // use asyncStorage to setItem for role which user has logged in:
    useEffect(() => {
        const setRoleInAsyncStorage = async () => {
            console.log("test ------------", userData?.data?.role?.name);

            try {
                const role = userData?.data?.role?.name || 'User';
                await AsyncStorage.setItem('userRole', role);

                // const roleName = userData?.data?.role?.name || 'User';
                // const roleId = userData?.data?.role?.id || null;
                // await AsyncStorage.multiSet([
                //     ['userRole', roleName.replace('Super Admin', 'SuperAdmin')],
                //     ['roleId', roleId ? roleId.toString() : ''],
                // ]);
                // console.log('Stored userRole:', roleName, 'roleId:', roleId);

            } catch (error) {
                console.error('Failed to set user role in AsyncStorage:', error);
            }
        };

        if (userData) {
            setRoleInAsyncStorage();
        }
    }, [userData]);

    // Filter menu items based on role
    const filteredMenuItems = isSuperAdmin
        ? dashboardMenuItems.filter(item =>
            ['multilingualSupport', 'profile', 'migrants', 'eventCalendar', 'servicesDirectory', 'news', 'helpRequest'].includes(item.name)
        )
        : dashboardMenuItems.filter(item => item.name !== 'migrants' && item.name !== 'notifications');

    // carousel items
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
            await clearAuthToken();
        }
        navigation.navigate(name);
        closeSidebar();
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
        // check update
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
                console.log("Fetched User Data:1", data);
                
                setUserData(data);
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

    // Session Expired Toast logic
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
            {/* <Text style={styles.carouselTitle}>{item.title}</Text> */}
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
        }
        else {
            navigation.navigate(itemName);
        }
    };

    return (
        <View style={styles.wrapper} {...screenPanResponder.panHandlers}>
            <LinearGradient colors={['#C97B3C', '#7A401D']} style={styles.container}>
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
                {/* <ScrollView contentContainerStyle={styles.gridContainer}>
                    {filteredMenuItems.map((item) => (
                        <View key={item.id} style={styles.gridItem}>
                            <TouchableOpacity
                                style={styles.iconTouchable}
                                onPress={() => handleIconPress(item.screen)}
                            >
                                <View style={[styles.iconBackground, { backgroundColor: '#c5894a' }]}>
                                    {item.name === 'servicesDirectory' ? (
                                        <FontAwesome5
                                            name="hand-holding-heart"
                                            size={26}
                                            color="#FFF"
                                        />
                                    ) : (
                                        <Icon
                                            name={item.icon}
                                            size={26}
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
                </ScrollView> */}

                <View style={styles.gridContainer}>
                    {filteredMenuItems.map((item) => (
                        <View key={item.id} style={[
                            styles.gridItem,
                            filteredMenuItems.length % 3 !== 0 && styles.gridItemFlex // Apply flex style when not divisible by 3
                        ]}>
                            <TouchableOpacity
                                style={styles.iconTouchable}
                                onPress={() => handleIconPress(item.screen)}
                            >
                                <View style={[styles.iconBackground, { backgroundColor: '#c5894a' }]}>
                                    {item.name === 'servicesDirectory' ? (
                                        <FontAwesome5
                                            name="hand-holding-heart"
                                            size={26}
                                            color="#FFF"
                                        />
                                    ) : (
                                        <Icon
                                            name={item.icon}
                                            size={26}
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

                    {/* Add empty items to fill the row when needed */}
                    {filteredMenuItems.length % 3 === 2 && (
                        <View style={[styles.gridItem, styles.emptyItem]} />
                    )}
                </View>

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
                            <Icon name={item.icon} size={22} color="#fff" style={styles.menuIcon} />
                            <Text style={styles.menuText}>
                                {languageTexts?.menu?.[item.name] || item.name}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    {/* Contact Us menu item */}
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('Contact Us', { screen: 'ContactUs' })}>
                        <Icon name="email" size={22} color="#fff" style={styles.menuIcon} />
                        <Text style={styles.menuText}>{ languageTexts?.menu?.contactUs || "Contact Us"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('Logout', { screen: 'Login' })}>
                        <Icon name="logout" size={22} color="#fff" style={styles.menuIcon} />
                        <Text style={styles.menuText}>
                            {languageTexts?.menu?.logout || 'Logout'}
                        </Text>
                    </TouchableOpacity>

                    {/* App Version at the bottom */}
                    <View style={styles.sidebarVersionContainer}>
                        <Text style={styles.sidebarVersionText}>V1.4</Text>
                    </View>
                </Animated.View>
            </LinearGradient>
        </View>
    );
}

export default DashboardPage;

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    menuButton: {
        backgroundColor: '#944D00',
        padding: 12,
        borderRadius: 25,
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
    },
    title: {
        color: '#FFECD2',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: -20,
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
        paddingTop: 50,
        paddingHorizontal: 15,
        elevation: 10,
        zIndex: 20,
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
    },
    sidebarTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFECD2',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        paddingVertical: 5,
    },
    menuIcon: {
        marginRight: 10,
    },
    menuText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    // carousel styles:
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
        // height: 180,
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
        marginHorizontal: '1.66%', // Adds equal spacing on both sides
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
    gridText: {
        color: '#FFF',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
        paddingHorizontal: 5,
    },
    // loading screen
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
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

});

