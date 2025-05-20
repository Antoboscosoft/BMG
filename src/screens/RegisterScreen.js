import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ImageBackground
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CountryPicker from 'react-native-country-picker-modal';
import RegisterImg from '../asserts/images/splash1.jpg';

const RegisterScreen = ({ navigation }) => {
    const [form, setForm] = useState({
        name: '',
        mobileNumber: '',
        dateOfBirth: '',
        addressLine: '',
        currentDistrictId: '',
        currentStateId: '',
        currentCountryId: '',
    });

    const [countryCode, setCountryCode] = useState('IN');
    const [callingCode, setCallingCode] = useState('91');
    const [withCountryNameButton] = useState(true);
    const [withFlag] = useState(true);
    const [withCallingCode] = useState(true);
    const [mobileNumber, setMobileNumber] = useState('');
    const [address, setAddress] = useState('');

    const onSelect = (country) => {
        setCountryCode(country.cca2);
        setCallingCode(country.callingCode[0]);
    };

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const handleRegister = () => {
        console.log('Register form submitted:', form);
        // Add validation and submission logic here
    };

    return (
        <ImageBackground
            source={RegisterImg}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Register</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            value={form.name}
                            onChangeText={(text) => handleChange('name', text)}
                        />

                        <View style={styles.mobileContainer}>
                            <CountryPicker
                                countryCode={countryCode}
                                withCallingCode={withCallingCode}
                                withFlag={withFlag}
                                withFilter
                                withEmoji
                                // withCountryNameButton={withCountryNameButton}
                                onSelect={onSelect}
                                containerButtonStyle={styles.countryPicker}
                            />
                            <Text style={styles.codeText}>+{callingCode}</Text>
                            <TextInput
                                style={styles.mobileInput}
                                placeholder="Mobile Number"
                                keyboardType="number-pad"
                                maxLength={15}
                                value={mobileNumber}
                                onChangeText={(text) => {
                                    const cleaned = text.replace(/[^0-9]/g, '');
                                    setMobileNumber(cleaned);
                                    handleChange('mobileNumber', cleaned);
                                }}
                            />
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Date of Birth (YYYY-MM-DD)"
                            value={form.dateOfBirth}
                            onChangeText={(text) => handleChange('dateOfBirth', text)}
                        />

                        {/* <TextInput
                            style={styles.input}
                            placeholder="Current Address Line"
                            value={form.addressLine}
                            onChangeText={(text) => handleChange('addressLine', text)}
                            multiline
                        /> */}

                        {/* <Text style={styles.label}>Current Address Line</Text> */}
                        <TextInput
                            style={styles.multilineInput}
                            placeholder="Current Address Line..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={5}
                            maxheight={100}
                            textAlignVertical="top" // Align text to top
                            value={address}
                            onChangeText={setAddress}
                            blurOnSubmit={true}
                            returnKeyType="done"
                        />

                        <Text style={styles.label}>Select District</Text>
                        <Picker
                            selectedValue={form.currentDistrictId}
                            onValueChange={(value) => handleChange('currentDistrictId', value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select District" value="" />
                            <Picker.Item label="Chennai" value="chennai" />
                            <Picker.Item label="Coimbatore" value="coimbatore" />
                        </Picker>

                        <Text style={styles.label}>State</Text>
                        <Picker
                            selectedValue={form.currentStateId}
                            onValueChange={(value) => handleChange('currentStateId', value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select State" value="" />
                            <Picker.Item label="Tamil Nadu" value="tamilnadu" />
                            <Picker.Item label="Kerala" value="kerala" />
                        </Picker>

                        <Text style={styles.label}>Country</Text>
                        <Picker
                            selectedValue={form.currentCountryId}
                            onValueChange={(value) => handleChange('currentCountryId', value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select Country" value="" />
                            <Picker.Item label="India" value="india" />
                            <Picker.Item label="Algeria" value="algeria" />
                        </Picker>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleRegister}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>Register</Text>
                        </TouchableOpacity>
                        <Text style={styles.registerText}>Already have an account? <Text onPress={() => navigation.navigate('Login')} style={styles.registerBold}>Login</Text></Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
    },
    container: {
        flex: 1,
    },
    scrollView: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        padding: 20,
        margin: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    multilineInput: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        padding: 15,
        marginBottom: 5,
        color: '#333',
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 100,
        maxHeight: 200,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    mobileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 6,
        marginBottom: 15,
    },
    countryPicker: {
        marginRight: 4,
    },
    codeText: {
        fontSize: 16,
        marginRight: 8,
        minWidth: 40,
        color: '#333',
    },
    mobileInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 8,
        color: '#333',
    },
    label: {
        fontWeight: '500',
        marginBottom: 6,
        marginTop: 10,
        color: '#333',
        fontSize: 16,
    },
    picker: {
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 5,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 8,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600',
    },

    registerText: {
        top: 10,
        //   color: '#FFF2E0',
        fontSize: 14,
    },

    registerBold: {
        fontWeight: 'bold',
        color: '#3113db',
    }
});

export default RegisterScreen;