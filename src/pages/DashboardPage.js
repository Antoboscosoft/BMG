import React, { useRef, useState } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

function DashboardPage({ navigation }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const slideAnim = useState(new Animated.Value(-250))[0];

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

    const handleMenuItemPress = (label, screen) => {
        console.log('Pressed:', label, screen);
        let name = screen.screen;
        navigation.navigate(name);
        closeSidebar();
    };

    const handleMenuHeaderPress = () => {
        closeSidebar();
    };

    // Handle profile navigation
    const handleProfileNavigate = () => {
        navigation.navigate('Profile'); // assuming route name is 'Profile'
    };

    // Swipe gesture handling
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Start responding to gesture if user swipes left
                return gestureState.dx < -10;
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx < -50) {
                    closeSidebar();
                }
            },
        })
    ).current;

    // Swipe left to close (inside sidebar)
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

    // Swipe right to open (from screen left edge)
    const screenPanResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only respond if starting near left edge & swiping right
                return gestureState.moveX < 30 && gestureState.dx > 10;
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx > 50 && !sidebarOpen) {
                    openSidebar();
                }
            },
        })
    ).current;


    return (
        <View style={styles.wrapper} {...screenPanResponder.panHandlers}>
            <LinearGradient colors={['#C97B3C', '#7A401D']} style={styles.container}>
                <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
                    <Icon name="menu" size={26} color="#FFF" />
                </TouchableOpacity>

                <Text style={styles.title}>Dashboard</Text>

                <Text style={styles.welcomeText}>
                    👋 Hi there! Welcome to Bosco Migrants.{'\n'}Wishing you a lovely day ahead!
                </Text>

                <Image
                    // source={require('../asserts/images/dash1.jpg')} // <- replace with your image path
                    source={require('../asserts/images/bmgp2.png')} // <- replace with your image path
                    style={styles.welcomeImage}
                />

                <View style={styles.bottomContainer}>
                    <TouchableOpacity style={styles.profileButton} onPress={handleProfileNavigate}>
                        <Icon name="account" size={20} color="#fff" style={{ marginRight: 10 }} />
                        <Text style={styles.profileText}>View Profile</Text>
                    </TouchableOpacity>
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
                    // {...panResponder.panHandlers}
                    {...sidebarPanResponder.panHandlers}
                >
                    <TouchableOpacity onPress={handleMenuHeaderPress} style={styles.sidebarHeader}>
                        <Text style={styles.sidebarTitle}>Menus</Text>
                    </TouchableOpacity>

                    {/* Separate TouchableOpacity for each menu option */}
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('Event Calendar', { screen: 'EventCalendar' })}>
                        <Icon name="calendar-month" size={22} color="#fff" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Event Calendar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('Services Directory', { screen: 'ServicesDirectory' })}>
                        <Icon name="cog-outline" size={22} color="#fff" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Services Directory</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('Notifications', { screen: 'Notifications' })}>
                        <Icon name="bell-outline" size={22} color="#fff" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Notifications</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('Multilingual Support', { screen: 'MultilingualSupport' })}>
                        <Icon name="translate" size={22} color="#fff" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Multilingual Support</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('Help Request', { screen: 'HelpRequest' })}>
                        <Icon name="help-circle-outline" size={22} color="#fff" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Help Request</Text>
                    </TouchableOpacity>


                    <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('Logout', { screen: 'Login' })}>
                        <Icon name="logout" size={22} color="#fff" style={styles.menuIcon} />
                        <Text style={styles.menuText}>Logout</Text>
                    </TouchableOpacity>
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
        marginTop: 40,
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
});
