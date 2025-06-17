import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BackIcon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../language/commondir';
import { getMyNotificationsAPI } from '../../api/auth';
import { dateFormat, handleReachEnd, Loader, page_limit, removeDuplicates, ScrollLoader } from '../../context/utils';
import HTML from 'react-native-render-html';

function NotificationsPage({ navigation, route }) {
    const { languageTexts } = useLanguage();
    const [notificationList, setNotificationList] = useState([]);
    const [skip, setSkip] = useState(0);
    const [limit, setLimit] = useState(page_limit);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const fadeAnim = useState(new Animated.Value(0))[0];

    const { width } = Dimensions.get('window'); // Get screen width for responsive HTML rendering

    const getNotifications = () => {
        getMyNotificationsAPI(skip, limit).then((res) => {
            if (res?.status) {
                setTotal(res?.total_count || 0);
                let listArr = notificationList.length > 0 ? removeDuplicates([...notificationList, ...res?.data], 'id') : [...res?.data];
                setNotificationList(listArr);
            } else {
                setNotificationList([]);
            }

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
        if (route?.params?.notification_id) {
            navigation.navigate('NotificationView', { notification_id: route?.params?.notification_id });
        }
    }, [route?.params?.notification_id]);

    useEffect(() => {
        getNotifications();
    }, [skip, limit]);

    if (loading) {
            return (
                <LinearGradient colors={['#2753b2', '#e6e9f0']} style={[styles.container, styles.loadingContainer]}>
                    <ActivityIndicator size="large" color="#FFF" />
                    <Text style={styles.loadingText}>{languageTexts?.servicesDirectory?.loading || 'Loading services...'}</Text>
                </LinearGradient>
            );
        }


    return (
        <LinearGradient
            colors={['#2753b2', '#e6e9f0']}
            style={styles.container}
        >
            <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
                {/* <Loader loading={loading} /> */}
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate('Dashboard')}
                    >
                        <BackIcon name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.titleText}>{languageTexts?.notifications?.title || 'Notifications'}</Text>
                    <View style={{ width: 60 }} />
                </View>
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    onScroll={({ nativeEvent }) => handleReachEnd(nativeEvent, skip, limit, total, setLoading, setSkip)}
                >
                    <View style={styles.notificationList}>
                        {notificationList?.length > 0 ? (
                            [...notificationList, { loader: true }]?.map((notification, index) => (
                                notification.loader ?
                                    <ScrollLoader loading={total > limit * skip && total !== notificationList?.length} key={`loader-${index}`} />
                                    :
                                    <TouchableOpacity
                                        key={notification.id}
                                        style={[
                                            styles.notificationItem,
                                            notification.unread && styles.unreadNotification,
                                        ]}
                                        onPress={() => {
                                            navigation.navigate('NotificationView', { notification_id: notification.id });
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
                                                <Text style={styles.notificationTitle} numberOfLines={1}>{notification.title}</Text>
                                                {/* <Text style={styles.notificationTimestamp}>
                                                {notification.timestamp}
                                            </Text> */}
                                            </View>
                                            {/* <Text style={styles.notificationDescription} numberOfLines={2}>{notification?.message || '-'} </Text> */}
                                            <View style={styles.notificationDescription}>
                                                <HTML
                                                    source={{ html: notification?.message || '<p>No description available</p>' }}
                                                    contentWidth={width - 60}
                                                />
                                            </View>
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
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#FFF',
        marginTop: 10,
    },
    innerContainer: {
        flex: 1,
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 80,
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
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    notificationDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        paddingLeft: 34,
        maxHeight: 20,
        overflow: 'hidden'
    },
    notificationTimestamp: {
        fontSize: 12,
        color: '#999',
        marginLeft: 20,
    },
    noNotificationsText: {
        fontSize: 15,
        color: '#FFF',
        textAlign: 'center',
        marginTop: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        backgroundColor: 'rgba(202, 195, 195, 0.3)',
        padding: 10,
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