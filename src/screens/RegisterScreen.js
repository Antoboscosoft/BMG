import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ImageBackground,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import CountryPicker from 'react-native-country-picker-modal';
import RegisterImg from '../asserts/images/splash1.jpg';
import { getCountries, getStates, getDistricts, registerUser } from '../api/auth';
import Toast from "react-native-toast-message";

const RegisterScreen = ({ navigation }) => {
    const [form, setForm] = useState({
        name: '',
        // email: '',
        mobileCode: '',
        mobileNumber: '',
        dateOfBirth: '',
        addressLine: '',
        currentAddressLine: '',
        currentDistrictId: '',
        currentStateId: '',
        currentCountryId: '',
        nativeAddressLine: '',
        aadhaarNumber: '',
        skills: '',
        jobType: '',
        languagePref: 'en', // default to English
    });

    const [countryCode, setCountryCode] = useState('IN');
    const [callingCode, setCallingCode] = useState('91');
    const [withCountryNameButton] = useState(true);
    const [withFlag] = useState(true);
    const [withCallingCode] = useState(true);
    const [mobileNumber, setMobileNumber] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDOBPicker, setShowDOBPicker] = useState(false);
    const [dob, setDob] = useState(new Date('2000-01-01')); // Default date
    // Fetch countries data when the component mounts
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);

    const [errors, setErrors] = useState({
        name: false,
        // email: '',
        dateOfBirth: false,
        mobileNumber: false,
        currentCountryId: false,
        currentStateId: false,
        currentDistrictId: false,
    });

    const tost = () => {
        Toast.show({
            type: 'success',
            text1: 'Hello',
            text2: 'This is some something 👋'
        });
    }
    // Fetch countries on component mount
    useEffect(() => {

        const fetchCountries = async () => {
            setLoadingCountries(true);
            try {
                const response = await getCountries();
                setCountries(response.data || []);
            } catch (error) {
                console.error("Error fetching countries:", error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to load countries',
                });
            } finally {
                setLoadingCountries(false);
            }
        };
        fetchCountries();
    }, []);

    // Fetch states when country changes
    useEffect(() => {
        const fetchStates = async () => {
            if (form.currentCountryId) {
                setLoadingStates(true);
                setForm(prev => ({ ...prev, currentStateId: '', currentDistrictId: '' }));
                setDistricts([]);
                try {
                    const response = await getStates(form.currentCountryId);
                    setStates(response.data || []);
                } catch (error) {
                    console.error("Error fetching states:", error);
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Failed to load states',
                    });
                } finally {
                    setLoadingStates(false);
                }
            } else {
                setStates([]);
                setDistricts([]);
            }
        };
        fetchStates();
    }, [form.currentCountryId]);

    // Fetch districts when state changes
    useEffect(() => {
        const fetchDistricts = async () => {
            if (form.currentStateId) {
                setLoadingDistricts(true);
                setForm(prev => ({ ...prev, currentDistrictId: '' }));
                try {
                    const response = await getDistricts(form.currentStateId);
                    setDistricts(response.data || []);
                } catch (error) {
                    console.error("Error fetching districts:", error);
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Failed to load districts',
                    });
                } finally {
                    setLoadingDistricts(false);
                }
            } else {
                setDistricts([]);
            }
        };
        fetchDistricts();
    }, [form.currentStateId]);

    const handleCountryChange = (value) => {
        handleChange('currentCountryId', value);
    };

    const handleStateChange = (value) => {
        handleChange('currentStateId', value);
    };

    const handleDistrictChange = (value) => {
        handleChange('currentDistrictId', value);
    };

    const onSelect = (country) => {
        setCountryCode(country.cca2);
        setCallingCode(country.callingCode[0]);
    };

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            name: false,
            // email: '',
            dateOfBirth: false,
            mobileNumber: false,
            currentCountryId: false,
            currentStateId: false,
            currentDistrictId: false,
        };

        if (!form.name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        }

        // if (!form.mobileNumber || form.mobileNumber.length < 10) {
        //     newErrors.mobileNumber = 'Mobile number is required';
        //     isValid = false;
        // }

        if (!form.mobileNumber) {
            newErrors.mobileNumber = 'Mobile number is required';
            isValid = false;
        } else if (form.mobileNumber.length < 10) {
            newErrors.mobileNumber = 'Mobile number must be 10 digits';
            isValid = false;
        }

        // Add DOB validation
        if (!form.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of Birth is required';
            isValid = false;
        }

        if (!form.currentCountryId) {
            newErrors.currentCountryId = 'Country is required';
            isValid = false;
        }

        if (!form.currentStateId) {
            newErrors.currentStateId = 'State is required';
            isValid = false;
        }

        if (!form.currentDistrictId) {
            newErrors.currentDistrictId = 'District is required';
            isValid = false;
        }

        // if (!form.email) {
        //     newErrors.email = 'Email is required';
        //     isValid = false;
        // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        //     newErrors.email = 'Please enter a valid email';
        //     isValid = false;
        // }

        setErrors(newErrors);
        return isValid;

    };

    const handleRegister = async () => {
        // console.log('Register form submitted:', form);
        // Add validation and submission logic here
        if (!validateForm()) return;

        setLoading(true);
        try {
            console.log("form enter....");

            const registrationData = {
                name: form.name,
                // email: form.email,
                mobile_code: callingCode,
                mobile_number: form.mobileNumber,
                current_country_id: form.currentCountryId,
                current_state_id: form.currentStateId,
                current_district_id: form.currentDistrictId,
                current_address_line: form.currentAddressLine || '',
                native_address_line: form.nativeAddressLine || '',
                date_of_birth: form.dateOfBirth ? formatDate(form.dateOfBirth) : null,
                aadhaar_number: form.aadhaarNumber || '',
                skills: form.skills || '',
                job_type: form.jobType || '',
                language_pref: form.languagePref || 'en',
                photo: '', // You'll need to implement image upload separately
                age: form.dateOfBirth ? calculateAge(form.dateOfBirth) : 0,
            };
            console.log("registrationData", registrationData);

            const response = await registerUser(registrationData);
            console.log("response", response);


            if (response.status || response.success === true) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Your account has been created successfully!',
                    visibilityTime: 3000, // Show for 3 seconds
                    position: 'bottom',
                    // autoHide: true,
                    // topOffset: 50,
                });
                setTimeout(() => {
                    navigation.navigate('Login');
                }, 1000);
                // Show success alert with OK button
                Alert.alert(
                    'Success',
                    'Your account has been created successfully!',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Login'), // Navigate on OK
                        },
                    ],
                    { cancelable: false }
                );
            } else {
                // if (response.details === 'Email already exists') {
                //     setErrors(prev => ({ ...prev, email: 'Email already exists' }));
                // }
                let errorMsg = 'Registration failed';

                if (response.details) {
                    if (response.details.includes("Mobile number already exists")) {
                        errorMsg = 'This mobile number is already registered. Please login or use a different number.';
                        setErrors(prev => ({ ...prev, mobileNumber: errorMsg }));
                    }
                    // Add more specific error checks here if needed
                    else {
                        errorMsg = response.details;
                    }
                }
Alert.alert('Error', errorMsg || response.details || 'Registration failed');
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: errorMsg || response.details || 'Registration failed',
                });
            }
        } catch (error) {
            console.error("Registration Error:", error);
            Alert.alert('Error', error.message || 'Registration failed. Please try again.');
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Registration failed. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Helper function to format date as YYYY-MM-DD
    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        // Ensure we have a valid date object
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return 0;
        const today = new Date();
        const birthDateObj = new Date(birthDate);
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
            age--;
        }

        return age;
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

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.input, errors.name && styles.errorInput]}
                                placeholder="Full Name"
                                value={form.name}
                                onChangeText={(text) => {
                                    handleChange('name', text);
                                    setErrors(prev => ({ ...prev, name: false }));
                                }}
                            />

                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={[styles.mobileContainer, errors.mobileNumber && styles.errorInput]}>
                                <CountryPicker
                                    countryCode={countryCode}
                                    withCallingCode={withCallingCode}
                                    withFlag={withFlag}
                                    withFilter
                                    withEmoji
                                    onSelect={(country) => {
                                        setCountryCode(country.cca2);
                                        setCallingCode(country.callingCode[0]);
                                    }}
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
                                        setErrors(prev => ({ ...prev, mobileNumber: false }));
                                    }}
                                />
                            </View>
                            {errors.mobileNumber && (
                                <Text style={styles.errorText}>
                                    {errors.mobileNumber}
                                    {/* {form.mobileNumber ? 'Invalid mobile number' : 'Mobile number is required'} */}
                                </Text>
                            )}
                        </View>
                        {/* 
                        <TextInput
                            style={styles.input}
                            placeholder="Date of Birth (YYYY-MM-DD)"
                            value={form.dateOfBirth}
                            onChangeText={(text) => handleChange('dateOfBirth', text)}
                        /> */}

                        <View style={styles.inputContainer}>
                            <TouchableOpacity
                                style={[styles.input, errors.dateOfBirth && styles.errorInput]}
                                onPress={() => setShowDOBPicker(true)}
                            >
                                <Text style={!form.dateOfBirth ? styles.placeholderText : null}>
                                    {form.dateOfBirth ?
                                        new Date(form.dateOfBirth).toLocaleDateString() :
                                        'Select Date of Birth'
                                    }
                                </Text>
                            </TouchableOpacity>
                            {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
                        </View>

                        {showDOBPicker && (
                            <DateTimePicker
                                value={form.dateOfBirth ? new Date(form.dateOfBirth) : new Date('2000-01-01')}
                                mode="date"
                                display="spinner"
                                onChange={(event, selectedDate) => {
                                    setShowDOBPicker(false);
                                    if (selectedDate) {
                                        handleChange('dateOfBirth', selectedDate.toISOString());
                                        setErrors(prev => ({ ...prev, dateOfBirth: '' }));
                                    }
                                }}
                                maximumDate={new Date()}
                            />
                        )}

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
                            // value={address}
                            value={form.currentAddressLine}
                            // onChangeText={setAddress}
                            onChangeText={(text) => handleChange('currentAddressLine', text)}
                            blurOnSubmit={true}
                            returnKeyType="done"
                        />

                        {/* Aadhaar Number Field */}
                        <TextInput
                            style={styles.input}
                            placeholder="Aadhaar Number"
                            keyboardType="number-pad"
                            value={form.aadhaarNumber}
                            onChangeText={(text) => handleChange('aadhaarNumber', text)}
                        />

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Country</Text>
                            {loadingCountries ? (
                                <ActivityIndicator size="small" color="#0000ff" />
                            ) : (
                                <>
                                    <Picker
                                        selectedValue={form.currentCountryId}
                                        onValueChange={(value) => {
                                            handleChange('currentCountryId', value);
                                            setErrors(prev => ({ ...prev, currentCountryId: false }));
                                        }}
                                        style={[styles.picker, errors.currentCountryId && styles.errorInput]}
                                    >
                                        <Picker.Item label="Select Country" value="" />
                                        {countries.map(country => (
                                            <Picker.Item
                                                key={country.id}
                                                label={country.name}
                                                value={country.id}
                                            />
                                        ))}
                                    </Picker>
                                    {errors.currentCountryId && (
                                        <Text style={styles.errorText}>{errors.currentCountryId}</Text>
                                    )}
                                </>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>State</Text>
                            {loadingStates ? (
                                <ActivityIndicator size="small" color="#0000ff" />
                            ) : (
                                <>
                                    <Picker
                                        selectedValue={form.currentStateId}
                                        onValueChange={(value) => {
                                            handleChange('currentStateId', value);
                                            setErrors(prev => ({ ...prev, currentStateId: '' }));
                                        }}
                                        style={[styles.picker, errors.currentStateId && styles.errorInput]}
                                        enabled={!!form.currentCountryId}
                                    >
                                        <Picker.Item label={form.currentCountryId ? "Select State" : "Select Country first"} value="" />
                                        {states.map(state => (
                                            <Picker.Item
                                                key={state.id}
                                                label={state.name}
                                                value={state.id}
                                            />
                                        ))}
                                    </Picker>
                                    {errors.currentStateId && (
                                        <Text style={styles.errorText}>{errors.currentStateId}</Text>
                                    )}
                                </>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Select District</Text>
                            {loadingDistricts ? (
                                <ActivityIndicator size="small" color="#0000ff" />
                            ) : (
                                <>
                                    <Picker
                                        selectedValue={form.currentDistrictId}
                                        onValueChange={(value) => {
                                            handleChange('currentDistrictId', value);
                                            setErrors(prev => ({ ...prev, currentDistrictId: '' }));
                                        }}
                                        style={[styles.picker, errors.currentDistrictId && styles.errorInput]}
                                        enabled={!!form.currentStateId}
                                    >
                                        <Picker.Item label={form.currentStateId ? "Select District" : "Select State first"} value="" />
                                        {districts.map(district => (
                                            <Picker.Item
                                                key={district.id}
                                                label={district.name}
                                                value={district.id}
                                            />
                                        ))}
                                    </Picker>
                                    {errors.currentDistrictId && (
                                        <Text style={styles.errorText}>{errors.currentDistrictId}</Text>
                                    )}
                                </>
                            )}
                        </View>

                        {/* Skills Field */}
                        {/* <TextInput
                            style={styles.input}
                            placeholder="Skills (comma separated)"
                            value={form.skills}
                            onChangeText={(text) => handleChange('skills', text)}
                        /> */}

                        {/* Job Type Field */}
                        {/* <TextInput
                            style={styles.input}
                            placeholder="Job Type"
                            value={form.jobType}
                            onChangeText={(text) => handleChange('jobType', text)}
                        /> */}

                        {/* <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.input, errors.email && styles.errorInput]}
                                placeholder="Email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={form.email}
                                onChangeText={(text) => {
                                    handleChange('email', text);
                                    setErrors(prev => ({ ...prev, email: '' }));
                                }}
                            />
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </View> */}

                        {/* Language Preference Dropdown */}
                        <Text style={styles.label}>Language Preference</Text>
                        <Picker
                            selectedValue={form.languagePref}
                            onValueChange={(value) => handleChange('languagePref', value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="English" value="en" />
                            <Picker.Item label="Hindi" value="hi" />
                            <Picker.Item label="Tamil" value="ta" />
                            <Picker.Item label="Telugu" value="te" />
                        </Picker>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.disabledButton]}
                            onPress={handleRegister}
                            activeOpacity={0.8}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Register</Text>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.registerText}>Already have an account?{' '} <Text onPress={() => navigation.navigate('Login')} style={styles.registerBold}>Login</Text></Text>
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
    },
    disabledButton: {
        opacity: 0.6,
    },
    dateInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 15,
        fontSize: 16,
        justifyContent: 'center',
    },
    // dateText: {
    //     color: form.dateOfBirth ? '#000' : '#D3B58F',
    // },
    errorInput: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: -10,
        marginBottom: 15,
    },
    inputContainer: {
        marginBottom: 15,
    },
    picker: {
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 5,
    },
    placeholderText: {
        color: '#999', // Light gray color for placeholder
    },
});

export default RegisterScreen;