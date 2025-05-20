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
    FlatList,
    ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

function DashboardPage({ navigation }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const slideAnim = useState(new Animated.Value(-250))[0];
    const loggedInUserName = 'Roberto';
    // Inside your component, define:
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef(null);
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

    // carousel:
    const carouselItems = [
        {
            // title: `Welcome, ${loggedInUserName}!`,
            image: require('../asserts/images/im2.png'),
        },
        {
            // title: 'Stay Updated with Events!',
            image: require('../asserts/images/img1.png'), // example image
        },
        {
            // title: 'Discover Your Sector',
            image: require('../asserts/images/im3.png'), // example image
        },
        {
            // title: 'Discover Your Sector',
            image: require('../asserts/images/im4.png'), // example image
        },
    ];

    // Auto-scroll logic (optional)
    React.useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex(prev => {
                const nextIndex = (prev + 1) % carouselItems.length;
                carouselRef.current?.scrollToIndex({ index: nextIndex, animated: true });
                return nextIndex;
            });
        }, 3000); // 3s interval

        return () => clearInterval(interval);
    }, []);

    //     React.useEffect(() => {
    //     const interval = setInterval(() => {
    //         let nextIndex = (activeIndex + 1) % carouselItems.length;
    //         carouselRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    //     }, 3000);

    //     return () => clearInterval(interval);
    // }, [activeIndex]); // <- Make sure it updates based on latest index


    // Carousel render function
    const renderCarouselItem = ({ item }) => (
        <View style={styles.carouselItem}>
            <Image source={item.image} style={styles.carouselImage} />
            <Text style={styles.carouselTitle}>{item.title}</Text>
        </View>
    );


    // Add this new array of menu items above your component
    const dashboardMenuItems = [
        { id: '1', name: 'Event Calendar', screen: 'EventCalendar', icon: 'calendar-month' },
        { id: '2', name: 'Services Directory', screen: 'ServicesDirectory', icon: 'cog-outline' },
        { id: '3', name: 'Notifications', screen: 'Notifications', icon: 'bell-outline' },
        { id: '4', name: 'Multilingual Support', screen: 'MultilingualSupport', icon: 'translate' },
        { id: '5', name: 'Help Request', screen: 'HelpRequest', icon: 'help-circle-outline' },
        { id: '6', name: 'Profile', screen: 'Profile', icon: 'account' },
        // { id: '7', name: 'Celebration', icon: 'party-popper' },
        // { id: '8', name: 'Event', icon: 'calendar' },
        // { id: '9', name: 'La Madal', icon: 'church' },
    ];

    // Add this new function to handle icon presses
    const handleIconPress = (itemName) => {
        console.log(`${itemName} pressed`);
        let name = itemName;
        navigation.navigate(name);
        // You can add navigation logic here based on the item pressed
        // For example:
        // if (itemName === 'News') {
        //     navigation.navigate('NewsScreen');
        // }
    };

    return (
        <View style={styles.wrapper} {...screenPanResponder.panHandlers}>
            <LinearGradient colors={['#C97B3C', '#7A401D']} style={styles.container}>
                <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
                    <Icon name="menu" size={26} color="#FFF" />
                </TouchableOpacity>

                <Text style={styles.title}>Dashboard</Text>

                {/* <Text style={styles.welcomeText}>
                    👋 Hi {loggedInUserName}! Welcome to Bosco Migrants.{'\n'}Wishing you a lovely day ahead!
                </Text> */}
                <Text style={styles.welcomeText}>
                    👋 Hi {loggedInUserName}! Welcome to Bosco Migrants.
                </Text>
                {/* <Image
                    // source={require('../asserts/images/dash1.jpg')} // <- replace with your image path
                    source={require('../asserts/images/bmgp2.png')} // <- replace with your image path
                    style={styles.welcomeImage}
                /> */}
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
                    {/* <View style={styles.pagination}>
                        {carouselItems.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.paginationDot,
                                    { opacity: index === activeIndex ? 1 : 0.3 },
                                ]}
                            />
                        ))}
                    </View> */}
                </View>


                {/* <ScrollView contentContainerStyle={styles.gridContainer}>
                    {dashboardMenuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.gridItem}
                            onPress={() => handleIconPress(item.screen)}
                        >
                            <View style={styles.iconContainer}>
                                <Icon 
                                    name={item.icon} 
                                    size={26} 
                                    color="#FFF" 
                                    style={styles.gridIcon}
                                />
                                <Text style={styles.gridText}>{item.name}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView> */}
                {/* // Update the grid item rendering in your JSX: */}
                <ScrollView contentContainerStyle={styles.gridContainer}>
                    {dashboardMenuItems.map((item) => (
                        <View key={item.id} style={styles.gridItem}>
                            <TouchableOpacity
                                style={styles.iconTouchable}
                                onPress={() => handleIconPress(item.screen)}
                            >
                                <View style={[styles.iconBackground, { backgroundColor: '#c5894a' }]}>
                                    <Icon
                                        name={item.icon}
                                        size={26}
                                        color="#FFF"
                                    />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.gridText}>{item.name}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* <View style={styles.bottomContainer}>
                    <TouchableOpacity style={styles.profileButton} onPress={handleProfileNavigate}>
                        <Icon name="account" size={20} color="#fff" style={{ marginRight: 10 }} />
                        <Text style={styles.profileText}>View Profile</Text>
                    </TouchableOpacity>
                </View> */}

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
    // Add these new styles for the grid layout
    // gridContainer: {
    //     flexDirection: 'row',
    //     flexWrap: 'wrap',
    //     justifyContent: 'space-around',
    //     paddingHorizontal: 10,
    //     marginTop: 20,
    //     marginBottom: 20,
    // },
    // gridItem: {
    //     width: '30%', // 3 items per row
    //     aspectRatio: 1,
    //     marginBottom: 15,
    // },
    iconContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        padding: 10,
    },
    gridIcon: {
        marginBottom: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 10,
        borderRadius: 10,
    },
    // gridText: {
    //     color: '#FFF',
    //     fontSize: 14,
    //     textAlign: 'center',
    //     fontWeight: '500',
    // },







     gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Changed from 'space-around'
    paddingHorizontal: 20, // Increased padding
    marginTop: 20,
    marginBottom: 20,
  },
  gridItem: {
    width: '30%', // 3 items per row
    marginBottom: 25, // Increased space between rows
    alignItems: 'center', // Center items horizontally
  },
  iconTouchable: {
    marginBottom: 8, // Space between icon and text
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
    paddingHorizontal: 5, // Ensure text doesn't overflow
  },
});
