import React, { useState } from 'react';
import {
    Dimensions, Image, KeyboardAvoidingView, Platform,
    ScrollView, StyleSheet, Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';

const { width, height } = Dimensions.get('window');

const languageOptions = ['English', 'Hindi', 'Tamil', 'Kannada'];
const stateOptions = ['Tamil Nadu', 'Karnataka', 'Maharashtra'];
const countryOptions = ['India', 'Nepal', 'Sri Lanka'];
const districtOptions = ['Chennai', 'Bangalore', 'Mumbai'];

function calculateAge(dob) {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return `${age} years`;
}

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

function ProfileScreen({ navigation }) {
    const [isEditing, setIsEditing] = useState(false);
    const [showDOBPicker, setShowDOBPicker] = useState(false);
    const [imageUri, setImageUri] = useState(null); // for display

    const [userData, setUserData] = useState({
        name: 'Rajesh Kumar',
        aadhaar: '1234 56789 9012',
        address: '1234 Bapu Nagar, Jaipur',
        contact: '+91 9876543210',
        date_of_birth: '1990-05-01',
        native_state_id: 'Tamil Nadu',
        native_country_id: 'India',
        native_district_id: 'Chennai',
        language_pref: 'English',
    });

    const handleChange = (field, value) => {
        setUserData(prev => ({ ...prev, [field]: value }));
    };

    const handleEditToggle = () => {
        if (isEditing) {
            console.log('Saved Data:', userData);
        }
        setIsEditing(prev => !prev);
    };

    const navigateToDashboard = () => {
        navigation.navigate('Dashboard');
    };

    const handleImagePick = () => {
        const options = {
            mediaType: 'photo',
            quality: 0.7,
            includeBase64: true, // optional
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorMessage) {
                console.error('ImagePicker Error:', response.errorMessage);
            } else {
                const uri = response.assets[0].uri;
                setImageUri(uri);

                // You can also save base64 string to userData if backend needs it
                handleChange('profile_image', response.assets[0].base64);
            }
        });
    };

    const handleImageRemove = () => {
        setImageUri(null);
        handleChange('profile_image', '');
    };

    const renderInputOrValue = (label, field, keyboardType = 'default', placeholder = '') => (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            {isEditing ? (
                <TextInput
                    style={styles.input}
                    value={userData[field]}
                    onChangeText={text => handleChange(field, text)}
                    keyboardType={keyboardType}
                    placeholder={placeholder}
                    placeholderTextColor="#FFECD2"
                />
            ) : (
                <Text style={styles.value}>{userData[field] || '-'}</Text>
            )}
        </View>
    );

    const renderPickerField = (label, field, options) => (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            {isEditing ? (
                <Picker
                    selectedValue={userData[field]}
                    style={styles.picker}
                    onValueChange={(itemValue) => handleChange(field, itemValue)}
                >
                    {options.map((item, index) => (
                        <Picker.Item label={item} value={item} key={index} />
                    ))}
                </Picker>
            ) : (
                <Text style={styles.value}>{userData[field] || '-'}</Text>
            )}
        </View>
    );

    const renderDOBField = () => {
        if (isEditing) {
            return (
                <View style={styles.row}>
                    <Text style={styles.label}>Date of Birth</Text>
                    <TouchableOpacity onPress={() => setShowDOBPicker(true)} style={{ flex: 1 }}>
                        <Text style={[styles.input, { color: '#FFF2E0', marginLeft: 20 }]}>
                            {formatDate(userData.date_of_birth) || 'Select DOB'}
                        </Text>
                    </TouchableOpacity>
                    {showDOBPicker && (
                        <DateTimePicker
                            value={new Date(userData.date_of_birth || '2000-01-01')}
                            mode="date"
                            display="spinner"
                            onChange={(event, selectedDate) => {
                                setShowDOBPicker(false);
                                if (selectedDate) {
                                    handleChange('date_of_birth', selectedDate.toISOString());
                                }
                            }}
                            maximumDate={new Date()}
                        />
                    )}
                </View>
            );
        } else {
            return (
                <>
                    <View style={styles.row}>
                        <Text style={styles.label}>DOB</Text>
                        <Text style={styles.value}>{formatDate(userData.date_of_birth)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Age</Text>
                        <Text style={styles.value}>{calculateAge(userData.date_of_birth)}</Text>
                    </View>
                </>
            );
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <LinearGradient colors={['#5e3b15', '#b06a2c']} style={styles.background}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.backButton} onPress={navigateToDashboard}>
                            <Text style={styles.backButtonText}>{'< Back'}</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Manage your profile</Text>
                        <View style={{ width: 60 }} />
                    </View>

                    <View style={styles.contentContainer}>
                        {/* <Image source={require('../asserts/images/profile.png')} style={styles.avatar} /> */}

                        <View style={styles.avatarContainer}>
                            <Image
                                source={
                                    imageUri
                                        ? { uri: imageUri }
                                        : userData.profile_image
                                            ? { uri: `data:image/jpeg;base64,${userData.profile_image}` }
                                            : require('../asserts/images/profile.png')
                                }
                                style={styles.avatar}
                            />

                            {isEditing && (
                                <>
                                    {/* Camera Icon (Bottom-Right) */}
                                    <TouchableOpacity onPress={handleImagePick} style={styles.cameraIconContainer}>
                                        <Image
                                            source={require('../asserts/images/photo-camera.png')} // Add your camera icon to assets
                                            style={styles.iconStyle}
                                        />
                                    </TouchableOpacity>

                                    {/* Cancel Icon (Top-Right) */}
                                    {/* <TouchableOpacity onPress={handleImageRemove} style={styles.cancelIconContainer}>
                                        <Image
                                            source={require('../asserts/images/close.png')} // Add your cancel icon to assets
                                            style={styles.iconStyle}
                                        />
                                    </TouchableOpacity> */}
                                </>
                            )}
                        </View>


                        {/* <TouchableOpacity onPress={isEditing ? handleImagePick : null}>
                            <Image
                                source={imageUri ? { uri: imageUri } :
                                    userData.profile_image ? { uri: `data:image/jpeg;base64,${userData.profile_image}` } :
                                        require('../asserts/images/profile.png')}
                                style={styles.avatar}
                            />
                            {isEditing && <Text style={{ color: '#FFECD2', textAlign: 'center', marginTop: 4 }}>Tap to change photo</Text>}
                        </TouchableOpacity> */}


                        <View style={styles.card}>
                            {renderInputOrValue('Name', 'name')}
                            {renderInputOrValue('Aadhaar', 'aadhaar', 'numeric')}
                            {renderInputOrValue('Address', 'address')}
                            {renderInputOrValue('Contact', 'contact', 'phone-pad')}
                            {renderDOBField()}
                            {renderPickerField('Language Pref', 'language_pref', languageOptions)}
                            {renderPickerField('Native State', 'native_state_id', stateOptions)}
                            {renderPickerField('Native Country', 'native_country_id', countryOptions)}
                            {renderPickerField('Native District', 'native_district_id', districtOptions)}
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleEditToggle}>
                            <Text style={styles.buttonText}>{isEditing ? 'Save Changes' : 'Edit Profile'}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, width, height },
    scrollContainer: { flexGrow: 1 },
    headerContainer: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 30, paddingBottom: 20, width: '100%',
    },
    backButton: {
        padding: 10, backgroundColor: 'rgba(255, 242, 224, 0.2)', borderRadius: 8,
    },
    backButtonText: {
        fontSize: 16, color: '#FFF2E0', fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20, fontWeight: 'bold', color: '#FFECD2',
        textAlign: 'center', flex: 1, paddingHorizontal: 10,
    },
    contentContainer: {
        alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20,
    },
    avatar: {
        width: 160, height: 160, marginBottom: 20, borderRadius: 160 / 2,
    },
    card: {
        backgroundColor: '#944D00', width: '100%',
        borderRadius: 16, padding: 16, marginBottom: 30,
    },
    row: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 10, borderBottomColor: '#a86030',
        borderBottomWidth: 0.5, alignItems: 'center',
    },
    label: {
        color: '#FFECD2', fontSize: 16, width: '40%',
    },
    value: {
        color: '#FFF2E0', fontWeight: '600', fontSize: 16,
        textAlign: 'right', flex: 1, marginLeft: 20,
    },
    input: {
        flex: 1, marginLeft: 20, fontSize: 16,
        color: '#FFF2E0', borderBottomWidth: 1,
        borderBottomColor: '#FFECD2', paddingVertical: 2,
    },
    picker: {
        flex: 1, marginLeft: 20, color: '#FFF2E0', backgroundColor: '#6e3b17',
    },
    button: {
        backgroundColor: '#FFECD2', paddingVertical: 14,
        paddingHorizontal: 30, borderRadius: 18,
        shadowColor: '#000', shadowOpacity: 0.2,
        shadowRadius: 4, elevation: 3,
    },
    buttonText: {
        fontSize: 18, color: '#3D2A1A', fontWeight: 'bold',
    },

    // profile:
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: 20,
        position: 'relative',
    },

    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ddd',
    },

    iconStyle: {
        width: 24,
        height: 24,
        tintColor: '#fff',
    },

    cameraIconContainer: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: '#0008',
        padding: 6,
        borderRadius: 20,
    },

    cancelIconContainer: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#0008',
        padding: 6,
        borderRadius: 20,
    },

});

export default ProfileScreen;
