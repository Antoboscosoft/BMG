import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BackIcon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../language/commondir';
import { getNotificationsAPI } from '../../api/auth';
import { dateFormat, page_limit } from '../../context/utils';

function NotificationsPage({ navigation }) {
    const { languageTexts } = useLanguage();
    const [notificationList, setNotificationList] = useState(notifications);
    const [skip, setSkip] = useState(0);
    const [limit, setLimit] = useState(page_limit);
    const [loading, setLoading] = useState(true);
    const fadeAnim = useState(new Animated.Value(0))[0]; // Animation for fade-in effect

    // Sample notification data (inferred based on app context)
    const notifications = [
        {
            id: '1',
            title: 'New Job Opportunity',
            description: 'A new construction job is available in your area. Apply now!',
            timestamp: languageTexts?.notifications?.timestamps?.twoHoursAgo || '2 hours ago',
            date: 'May 16, 2025', // Add this
            unread: true,
        },
        {
            id: '2',
            title: 'Policy Update',
            description: 'New government policy on migrant worker rights announced.',
            timestamp: languageTexts?.notifications?.timestamps?.oneDayAgo || '1 day ago',
            date: 'May 15, 2025', // Add this
            unread: false,
        },
        {
            id: '3',
            title: 'Event Reminder',
            description: 'Legal consultation session tomorrow at 10 AM.',
            timestamp: languageTexts?.notifications?.timestamps?.threeDaysAgo || '3 days ago',
            date: 'May 11, 2025', // Add this
            unread: false,
        },
        {
            id: '4',
            title: 'Health Checkup',
            description: 'Free health checkup scheduled for next week.',
            timestamp: languageTexts?.notifications?.timestamps?.fiveDaysAgo || '5 days ago',
            date: 'May 9, 2025', // Add this
            unread: false,
        },
    ];


    const getNotifications = () => {
        setLoading(true);
        getNotificationsAPI(skip, limit).then((res) => {
            setNotificationList(res?.data);
            
        }).catch((err) => {
            console.log(err);
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => {
        // Start fade-in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);


    useEffect(() => {
        getNotifications();
    }, []);
    

    return (
        <LinearGradient
            colors={['#2753b2', '#e6e9f0']} // Gradient from blue to light gray
            //   colors={['#5e3b15', '#b06a2c']}
            style={styles.container}
        >
            <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        {/* <Text style={styles.backButtonText}>{languageTexts?.common?.back || '< Back'}</Text> */}
                        <BackIcon name="arrow-back-ios" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.titleText}>{languageTexts?.notifications?.title || 'Notifications'}</Text>
                    <View style={{ width: 60 }} />
                </View>
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.notificationList}>
                        {notificationList?.length > 0 ? (
                            notificationList?.map((notification) => (
                                <TouchableOpacity
                                    key={notification.id}
                                    style={[
                                        styles.notificationItem,
                                        notification.unread && styles.unreadNotification,
                                    ]}
                                    onPress={() => {
                                        // Add logic to navigate to a detailed notification page or mark as read
                                        console.log(`Tapped on notification: ${notification.title}`);
                                        navigation.navigate('NotificationView', { notification });
                                    }}
                                >
                                    <View style={styles.notificationContent}>
                                        <View style={styles.notificationHeader}>
                                            <Icon
                                                name={notification.unread ? "bell-ring" : "bell-outline"}
                                                size={24}
                                                color="#2753b2"
                                                style={styles.notificationIcon}
                                            />
                                            <Text style={styles.notificationTitle}>{notification.title}</Text>
                                            {/* <Text style={styles.notificationTimestamp}>
                                                {notification.timestamp}
                                            </Text> */}
                                        </View>
                                        <Text style={styles.notificationDescription}>
                                            {notification?.message || '-'}
                                        </Text>
                                        <View style={styles.dateContainer}>
                                            <Text style={styles.notificationDate}>
                                                {dateFormat(new Date(notification?.sent_at))}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.noNotificationsText}>
                                {languageTexts?.notifications?.empty || 'No notifications available.'}
                            </Text>
                        )}
                    </View>
                </ScrollView>
            </Animated.View>
        </LinearGradient>
    );
}

export default NotificationsPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        zIndex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    backButtonText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 40,
        alignItems: 'center',
    },
    titleText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
    },
    notificationList: {
        width: '100%',
    },
    notificationItem: {
        backgroundColor: '#f3f3f3',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    notificationContent: {
        flexDirection: 'column',
    },

    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        width: '100%',
    },
    notificationIcon: {
        marginRight: 10,
    },

    unreadNotification: {
        borderLeftWidth: 4,
        borderLeftColor: '#e7a172b2',
        backgroundColor: '#fff9df',
    },
    notificationTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    notificationDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        paddingLeft: 34,
    },
    notificationTimestamp: {
        fontSize: 12,
        color: '#999',
        marginLeft: 20,
    },
    noNotificationsText: {
        fontSize: 16,
        color: '#FFF',
        textAlign: 'center',
        marginTop: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
        marginTop: 4,
    },
    notificationDate: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    }
});