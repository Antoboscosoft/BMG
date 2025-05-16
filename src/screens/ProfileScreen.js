import React, { useState } from 'react'
import { Dimensions, Image, ImageBackground, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

function ProfileScreen({ navigation }) {
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState({
        name: 'Rajesh Kumar',
        aadhaar: '1234 56789 9012',
        address: '1234 Bapu Nagar, Jaipur',
        contact: '+91 9876543210',
    });

    // const userData = {
    //     name: 'Rajesh Kumar',
    //     aadhaar: '1234 56789 9012',
    //     address: '1234 Bapu Nagar, Jaipur',
    //     contact: '+91 9876543210',
    // };

    const handleChange = () => {
        setUserData(prev => ({ ...prev, [field]: value }));
    }

    const handleEditToggle = () => {
        if (isEditing) {
            // You can save to a server here if needed
            console.log('Saved Data:', userData);
        }
        // return;
        // !isEditing && setIsEditing(true);
        setIsEditing(prev => !prev);
    }

    const navigateToDashboard = () => {
        // navigation.navigate('Login');
        navigation.navigate('Dashboard');
    }

    return (
        //     <ImageBackground
        //   source={require('../asserts/images/profile1.jpg')} // Add your background image path
        //   style={styles.background}
        //   resizeMode="cover"
        // >
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <LinearGradient
                colors={['#5e3b15', '#b06a2c']} // You can change this gradient to match your theme
                style={styles.background}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.overlay}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigateToDashboard()}
                        >
                            <Text style={styles.backButtonText}>{'< Back'}</Text>
                        </TouchableOpacity>
                        <Text style={styles.header}>PROFILE MANAGEMENT</Text>
                        <Text style={styles.subheader}>Manage your profile information</Text>

                        <Image
                            source={require('../asserts/images/profile.png')} // You can replace this with your custom illustration
                            style={styles.avatar}
                        />

                        <View style={styles.card}>
                            <View style={styles.row}>
                                <Text style={styles.label}>Personal Details</Text>
                                {!isEditing ? (
                                    <Text style={styles.value}>{userData.name}</Text>
                                ) : (
                                    <TextInput
                                        style={styles.input}
                                        value={userData.name}
                                        onChangeText={text => handleChange('name', text)}
                                    />
                                )}
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Aadhaar</Text>
                                {!isEditing ? (
                                    <Text style={styles.value}>{userData.aadhaar}</Text>
                                ) : (
                                    <TextInput
                                        style={styles.input}
                                        value={userData.aadhaar}
                                        onChangeText={text => handleChange('aadhaar', text)}
                                        keyboardType="numeric"
                                    />
                                )}
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Address</Text>
                                {!isEditing ? (
                                    <Text style={styles.value}>{userData.address}</Text>
                                ) : (
                                    <TextInput
                                        style={styles.input}
                                        value={userData.address}
                                        onChangeText={text => handleChange('address', text)}
                                    />
                                )}
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Contact</Text>
                                {!isEditing ? (
                                    <Text style={styles.value}>{userData.contact}</Text>
                                ) : (
                                    <TextInput
                                        style={styles.input}
                                        value={userData.contact}
                                        onChangeText={text => handleChange('contact', text)}
                                        keyboardType="phone-pad"
                                    />
                                )}
                            </View>
                        </View>

                        <TouchableOpacity style={styles.button} onPress={() => handleEditToggle()}>
                            <Text style={styles.buttonText}>{isEditing ? 'Save Changes' : 'Edit Profile'}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
        // </ImageBackground>
    );
}

export default ProfileScreen

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width,
        height,
    },
    overlay: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 80,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    backButton: {
        position: 'absolute',
        top: 20, // Position near the top
        left: 20, // Position near the left edge
        padding: 10,
        backgroundColor: 'rgba(255, 242, 224, 0.2)', // Subtle background for the back button
        borderRadius: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#FFF2E0', // Match the title color for consistency
        fontWeight: 'bold',
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFECD2',
        textAlign: 'center',
    },
    subheader: {
        fontSize: 16,
        color: '#FFECD2',
        marginTop: 6,
        textAlign: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 160,
        height: 160,
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#944D00',
        width: '100%',
        borderRadius: 16,
        padding: 16,
        marginBottom: 30,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomColor: '#a86030',
        borderBottomWidth: 0.5,
        alignItems: 'center',
    },
    label: {
        color: '#FFECD2',
        fontSize: 16,
        width: '35%'
    },
    value: {
        color: '#FFF2E0',
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'right',
        flex: 1,
        marginLeft: 20,
    },
    input: {
        flex: 1,
        marginLeft: 20,
        fontSize: 16,
        color: '#FFF2E0',
        borderBottomWidth: 1,
        borderBottomColor: '#FFECD2',
        paddingVertical: 2,
    },
    button: {
        backgroundColor: '#FFECD2',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 18,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        fontSize: 18,
        color: '#3D2A1A',
        fontWeight: 'bold',
    },
});