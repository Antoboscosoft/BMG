import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BackIcon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../language/commondir';
import { dateFormat, Loader } from '../../context/utils';
import { getNotificationByIdAPI, markAsRead } from '../../api/auth';

function NotificationsView({ navigation, route }) {
    const { languageTexts } = useLanguage();
    const [notification, setNotification] = useState({});
    const [loading, setLoading] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0]; // Animation for fade-in effect

    const getNotification = () => {
        setLoading(true);
        console.log(route?.params?.notification_id);

        getNotificationByIdAPI(route?.params?.notification_id).then((res) => {
            if (res?.status) {
                setNotification(res?.data || {});
                markAsRead(route?.params?.notification_id).then((res) => { console.log("res", res);
                }).catch((err) => { console.log(err); });
            }
            else
                navigation.navigate('Notifications');
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
        setLoading(true);
        if (!route?.params?.notification_id) {
            navigation.navigate('Notifications');
        } else {
            getNotification();
        }
    }, [route?.params?.notification_id]);


    return (
        <LinearGradient
            colors={['#2753b2', '#e6e9f0']}
            style={styles.container}
        >
            <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
                <Loader loading={loading} />
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Notifications')} >
                        <BackIcon name="arrow-back-ios" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.titleText}>{languageTexts?.notifications?.title || 'Notifications'}</Text>
                    <View style={{ width: 60 }} />
                </View>
                <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false} >
                    <View style={styles.notificationItem}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>

                        <Text style={styles.notificationDescription}> {notification?.message || '-'} </Text>

                        {notification.notification_image &&
                            <View style={styles.notificationImageContainer}>
                                <Image source={{ uri: notification.notification_image }} style={styles.notificationImage} resizeMode="contain" />
                            </View>
                        }
                        <Text style={styles.notificationDate}>{dateFormat(new Date(notification?.sent_at),true)} </Text>
                    </View>
                </ScrollView>
            </Animated.View>
        </LinearGradient>
    );
}

export default NotificationsView;

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
    },
    notificationImageContainer: {
        alignItems: 'center',
        paddingVertical: 10
    },
    notificationImage: {
        width: '100%',
        height: 250,
    },
    titleText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
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
        paddingBottom: 25
    },

    notificationTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#333',
    },
    notificationDescription: {
        fontSize: 14,
        color: '#666',
        marginVertical: 10,
        paddingLeft: 15,
    },
    notificationTimestamp: {
        fontSize: 12,
        color: '#999',
        marginLeft: 20,
    },
    notificationDate: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
        marginLeft: 2,
        padding: 3,
        position: 'absolute',
        bottom: 2,
        right: 2
    }
});