import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BackIcon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../language/commondir';
import { dateFormat } from '../../context/utils';

function NotificationsView({ navigation, route }) {
    const { languageTexts } = useLanguage();
    const notification = route?.params?.notification;

    const fadeAnim = useState(new Animated.Value(0))[0]; // Animation for fade-in effect



    useEffect(() => {
        // Start fade-in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);


    useEffect(() => {
        if (!route?.params?.notification) {
            navigation.navigate('Notifications');
        }
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
                <ScrollView contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.notificationItem}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>8

                        <Text style={styles.notificationDescription}>
                            {notification?.message || '-'}
                        </Text>

                        <Text style={styles.notificationDate}>{dateFormat(new Date(notification?.sent_at))} </Text>

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
        alignItems: 'center',
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
        minHeight: '20%'
    },

    notificationTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    notificationDescription: {
        fontSize: 14.5,
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