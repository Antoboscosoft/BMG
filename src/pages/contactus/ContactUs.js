import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

export default function ContactUs() {
    const navigation = useNavigation();
    return (
        <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Contact Us</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.card}>
                <View style={styles.contactItem}>
                    <Icon name="map-marker" size={22} color="#C97B3C" style={styles.icon} />
                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Address</Text>
                        <Text style={styles.infoText}>
                            No. 9, Paper Mills High Road{"\n"}
                            SRP Colony, Peravallur{"\n"}
                            Chennai – 600082
                        </Text>
                    </View>
                </View>

                <View style={styles.contactItem}>
                    <Icon name="account" size={22} color="#C97B3C" style={styles.icon} />
                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Contact Person</Text>
                        <Text style={styles.infoText}>Fr. Ferk Simolin</Text>
                    </View>
                </View>

                <View style={styles.contactItem}>
                    <Icon name="phone" size={22} color="#C97B3C" style={styles.icon} />
                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Phone</Text>
                        <Text style={styles.infoText}>+91 81226 18763</Text>
                    </View>
                </View>

                <View style={styles.contactItem}>
                    <Icon name="phone-classic" size={22} color="#C97B3C" style={styles.icon} />
                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Labour Line</Text>
                        <Text style={styles.infoText}>96423 72372</Text>
                    </View>
                </View>

                <View style={styles.contactItem}>
                    <Icon name="email" size={22} color="#C97B3C" style={styles.icon} />
                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.infoText}>boscomigrants@gmail.com</Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    backButton: {
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 25,
        marginRight: 15,
    },
    title: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    icon: {
        marginRight: 15,
        marginTop: 3,
    },
    textContainer: {
        flex: 1,
    },
    label: {
        color: '#944D00',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 3,
    },
    infoText: {
        color: '#555',
        fontSize: 16,
        lineHeight: 22,
    },
});