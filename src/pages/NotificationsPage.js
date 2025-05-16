import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

function NotificationsPage({ navigation }) {
    const fadeAnim = useState(new Animated.Value(0))[0]; // Animation for fade-in effect

    useEffect(() => {
        // Start fade-in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    // Sample notification data (inferred based on app context)
    const notifications = [
        {
            id: '1',
            title: 'New Job Opportunity',
            description: 'A new construction job is available in your area. Apply now!',
            timestamp: '2 hours ago',
            unread: true,
        },
        {
            id: '2',
            title: 'Policy Update',
            description: 'New government policy on migrant worker rights announced.',
            timestamp: '1 day ago',
            unread: false,
        },
        {
            id: '3',
            title: 'Event Reminder',
            description: 'Legal consultation session tomorrow at 10 AM.',
            timestamp: '3 days ago',
            unread: false,
        },
        {
            id: '4',
            title: 'Health Checkup',
            description: 'Free health checkup scheduled for next week.',
            timestamp: '5 days ago',
            unread: false,
        },
    ];

    return (
        <LinearGradient
            colors={['#2753b2', '#e6e9f0']} // Gradient from blue to light gray
            //   colors={['#5e3b15', '#b06a2c']}
            style={styles.container}
        >
            <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>{'< Back'}</Text>
                </TouchableOpacity>
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.titleText}>Notifications</Text>
                    <View style={styles.notificationList}>
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <TouchableOpacity
                                    key={notification.id}
                                    style={[
                                        styles.notificationItem,
                                        notification.unread && styles.unreadNotification,
                                    ]}
                                    onPress={() => {
                                        // Add logic to navigate to a detailed notification page or mark as read
                                        console.log(`Tapped on notification: ${notification.title}`);
                                    }}
                                >
                                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                                    <Text style={styles.notificationDescription}>
                                        {notification.description}
                                    </Text>
                                    <Text style={styles.notificationTimestamp}>
                                        {notification.timestamp}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.noNotificationsText}>
                                No notifications available.
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
        position: 'absolute',
        top: 20,
        left: 20,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        zIndex: 1,
    },
    backButtonText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 80,
        paddingBottom: 40,
        alignItems: 'center',
    },
    titleText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 20,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    notificationList: {
        width: '100%',
    },
    notificationItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    unreadNotification: {
        borderLeftWidth: 4,
        borderLeftColor: '#2753b2', // Blue highlight for unread notifications
    },
    notificationTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    notificationDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    notificationTimestamp: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
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
});