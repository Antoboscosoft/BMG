import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import { getCountries, getDistricts, getStates, getUserData, updateUserData } from '../api/auth';
import { clearAuthToken } from '../api/axiosInstance';
import Toast from 'react-native-toast-message';
import CountryPicker from 'react-native-country-picker-modal';
import { useForm, Controller } from 'react-hook-form';

const { width, height } = Dimensions.get('window');

const languageOptions = [
    { id: 'en', name: 'English' },
    { id: 'hi', name: 'Hindi' },
    { id: 'ta', name: 'Tamil' },
    { id: 'kn', name: 'Kannada' },
];

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
    return `${d.getDate()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
}

function ProfileScreen({ navigation }) {
    const [isEditing, setIsEditing] = useState(false);
    const [showDOBPicker, setShowDOBPicker] = useState(false);
    const [imageUri, setImageUri] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [countryCode, setCountryCode] = useState('IN');
    const [callingCode, setCallingCode] = useState('91');

    const [countries, setCountries] = useState([]);
    const [currentStates, setCurrentStates] = useState([]);
    const [currentDistricts, setCurrentDistricts] = useState([]);
    const [nativeStates, setNativeStates] = useState([]);
    const [nativeDistricts, setNativeDistricts] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingCurrentStates, setLoadingCurrentStates] = useState(false);
    const [loadingCurrentDistricts, setLoadingCurrentDistricts] = useState(false);
    const [loadingNativeStates, setLoadingNativeStates] = useState(false);
    const [loadingNativeDistricts, setLoadingNativeDistricts] = useState(false);

    const { control, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm({
        defaultValues: {
            name: '',
            email: null,
            mobile_number: '',
            mobile_code: '',
            date_of_birth: '',
            aadhaar_number: '',
            current_address_line: '',
            native_address_line: '',
            current_district_id: '',
            current_state_id: '',
            current_country_id: '',
            native_district_id: '',
            native_state_id: '',
            native_country_id: '',
            skills: '',
            job_type: '',
            language_pref: '',
            photo: null,
            id: null,
            current_country_name: '',
            current_state_name: '',
            current_district_name: '',
            native_country_name: '',
            native_state_name: '',
            native_district_name: '',
        }
    });

    const currentCountryId = watch('current_country_id');
    const currentStateId = watch('current_state_id');
    const nativeCountryId = watch('native_country_id');
    const nativeStateId = watch('native_state_id');

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

    // Fetch states for current address
    useEffect(() => {
        const fetchCurrentStates = async () => {
            if (currentCountryId) {
                setLoadingCurrentStates(true);
                setCurrentDistricts([]);
                try {
                    const response = await getStates(currentCountryId);
                    setCurrentStates(response.data || []);
                    setValue('current_state_id', '');
                    setValue('current_district_id', '');
                } catch (error) {
                    console.error("Error fetching current states:", error);
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Failed to load states',
                    });
                } finally {
                    setLoadingCurrentStates(false);
                }
            } else {
                setCurrentStates([]);
                setCurrentDistricts([]);
            }
        };
        fetchCurrentStates();
    }, [currentCountryId, setValue]);

    // Fetch districts for current address
    useEffect(() => {
        const fetchCurrentDistricts = async () => {
            if (currentStateId) {
                setLoadingCurrentDistricts(true);
                try {
                    const response = await getDistricts(currentStateId);
                    setCurrentDistricts(response.data || []);
                    setValue('current_district_id', '');
                } catch (error) {
                    console.error("Error fetching current districts:", error);
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Failed to load districts',
                    });
                } finally {
                    setLoadingCurrentDistricts(false);
                }
            } else {
                setCurrentDistricts([]);
            }
        };
        fetchCurrentDistricts();
    }, [currentStateId, setValue]);

    // Fetch states for native address
    useEffect(() => {
        const fetchNativeStates = async () => {
            if (nativeCountryId) {
                setLoadingNativeStates(true);
                setNativeDistricts([]);
                try {
                    const response = await getStates(nativeCountryId);
                    setNativeStates(response.data || []);
                    setValue('native_state_id', '');
                    setValue('native_district_id', '');
                } catch (error) {
                    console.error("Error fetching native states:", error);
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Failed to load states',
                    });
                } finally {
                    setLoadingNativeStates(false);
                }
            } else {
                setNativeStates([]);
                setNativeDistricts([]);
            }
        };
        fetchNativeStates();
    }, [nativeCountryId, setValue]);

    // Fetch districts for native address
    useEffect(() => {
        const fetchNativeDistricts = async () => {
            if (nativeStateId) {
                setLoadingNativeDistricts(true);
                try {
                    const response = await getDistricts(nativeStateId);
                    setNativeDistricts(response.data || []);
                    setValue('native_district_id', '');
                } catch (error) {
                    console.error("Error fetching native districts:", error);
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Failed to load districts',
                    });
                } finally {
                    setLoadingNativeDistricts(false);
                }
            } else {
                setNativeDistricts([]);
            }
        };
        fetchNativeDistricts();
    }, [nativeStateId, setValue]);

    // Fetch user data when component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const response = await getUserData();
                if (response.status && response.data) {
                    const userData = response.data;
                    console.log("User Data:", userData);

                    const formData = {
                        name: userData.name || '',
                        email: userData.email || null,
                        mobile_number: userData.mobile_number || '',
                        mobile_code: userData.mobile_code || '',
                        date_of_birth: userData.date_of_birth || '',
                        aadhaar_number: userData.aadhaar_number || '',
                        current_address_line: userData.current_address_line || '',
                        native_address_line: userData.native_address_line || '',
                        current_district_id: userData.current_district_id ? String(userData.current_district_id) : '',
                        current_state_id: userData.current_state_id ? String(userData.current_state_id) : '',
                        current_country_id: userData.current_country_id ? String(userData.current_country_id) : '',
                        native_district_id: userData.native_district_id ? String(userData.native_district_id) : '',
                        native_state_id: userData.native_state_id ? String(userData.native_state_id) : '',
                        native_country_id: userData.native_country_id ? String(userData.native_country_id) : '',
                        skills: userData.skills || '',
                        job_type: userData.job_type || '',
                        language_pref: userData.language_pref || '',
                        photo: userData.photo || null,
                        id: userData.id || null,
                        current_country_name: userData.current_country?.name || '',
                        current_state_name: userData.current_state?.name || '',
                        current_district_name: userData.current_district?.name || '',
                        native_country_name: userData.native_country?.name || '',
                        native_state_name: userData.native_state?.name || '',
                        native_district_name: userData.native_district?.name || '',
                    };

                    reset(formData);

                    if (userData.mobile_code) {
                        setCallingCode(userData.mobile_code);
                        const countryMapping = {
                            '91': 'IN',
                            '977': 'NP',
                            '94': 'LK',
                        };
                        setCountryCode(countryMapping[userData.mobile_code] || 'IN');
                    }

                    if (userData.photo) {
                        setImageUri(userData.photo);
                    } else {
                        setImageUri(null);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: error.message || 'Failed to load user data',
                });

                if (error.status === 401) {
                    await clearAuthToken();
                    navigation.replace('Login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigation, reset]);

    const onSubmit = async (data) => {
        try {
            setUpdating(true);
            const submissionData = { ...data };
            delete submissionData.current_country_name;
            delete submissionData.current_state_name;
            delete submissionData.current_district_name;
            delete submissionData.native_country_name;
            delete submissionData.native_state_name;
            delete submissionData.native_district_name;

            const response = await updateUserData(data.id, submissionData);
            if (response.status && response.data) {
                const updatedData = {
                    ...response.data,
                    current_country_name: response.data.current_country?.name || '',
                    current_state_name: response.data.current_state?.name || '',
                    current_district_name: response.data.current_district?.name || '',
                    native_country_name: response.data.native_country?.name || '',
                    native_state_name: response.data.native_state?.name || '',
                    native_district_name: response.data.native_district?.name || '',
                };
                reset(updatedData);
                setImageUri(updatedData.photo || null);
                
                // Show success toast and switch to view mode
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Profile updated successfully',
                    onHide: () => {
                        setIsEditing(false); // Switch to view mode after toast hides
                    },
                });
            }
        } catch (error) {
            console.error('Update error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to update profile',
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleImagePick = () => {
        const options = {
            mediaType: 'photo',
            quality: 0.7,
            includeBase64: true,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) return;
            if (response.errorMessage) {
                console.error('ImagePicker Error:', response.errorMessage);
                return;
            }

            const uri = response.assets[0].uri;
            const base64 = response.assets[0].base64;
            setImageUri(uri);
            setValue('photo', base64);
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <LinearGradient colors={['#5e3b15', '#b06a2c']} style={styles.loadingBackground}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading your data...</Text>
                </LinearGradient>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <LinearGradient colors={['#5e3b15', '#b06a2c']} style={styles.background}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Dashboard')}>
                            <Text style={styles.backButtonText}>{'< Back'}</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Manage your profile</Text>
                        <View style={{ width: 60 }} />
                    </View>

                    <View style={styles.contentContainer}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={
                                    imageUri
                                        ? { uri: imageUri }
                                        : watch('photo')
                                        ? { uri: watch('photo') }
                                        : require('../asserts/images/profile.png')
                                }
                                style={styles.avatar}
                            />
                            {isEditing && (
                                <TouchableOpacity onPress={handleImagePick} style={styles.cameraIconContainer}>
                                    <Image
                                        source={require('../asserts/images/photo-camera.png')}
                                        style={styles.iconStyle}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Name Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Name</Text>
                            {isEditing ? (
                                <Controller
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={styles.input}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Enter your name"
                                            placeholderTextColor="#FFECD2"
                                        />
                                    )}
                                    name="name"
                                    rules={{ required: 'Name is required' }}
                                />
                            ) : (
                                <Text style={styles.value}>{watch('name') || '-'}</Text>
                            )}
                        </View>
                        {errors.name && isEditing && <Text style={styles.errorText}>{errors.name.message}</Text>}

                        {/* Email Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Email</Text>
                            {isEditing ? (
                                <Controller
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={styles.input}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value || ''}
                                            keyboardType="email-address"
                                            placeholder="Enter your email"
                                            placeholderTextColor="#FFECD2"
                                        />
                                    )}
                                    name="email"
                                />
                            ) : (
                                <Text style={styles.value}>{watch('email') || '-'}</Text>
                            )}
                        </View>

                        {/* Mobile Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Mobile</Text>
                            {isEditing ? (
                                <View style={[styles.phoneRow, errors.mobile_number && styles.errorInput]}>
                                    <CountryPicker
                                        countryCode={countryCode}
                                        withCallingCode
                                        withFlag
                                        withFilter
                                        withEmoji
                                        onSelect={(country) => {
                                            setCountryCode(country.cca2);
                                            setCallingCode(country.callingCode[0]);
                                            setValue('mobile_code', country.callingCode[0]);
                                        }}
                                        containerButtonStyle={styles.countryPicker}
                                    />
                                    <Text style={styles.callingCode}>+{callingCode}</Text>
                                    <Controller
                                        control={control}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <TextInput
                                                style={[styles.input, { flex: 1 }]}
                                                onBlur={onBlur}
                                                onChangeText={(text) => {
                                                    const cleaned = text.replace(/[^0-9]/g, '');
                                                    onChange(cleaned);
                                                }}
                                                value={value}
                                                keyboardType="phone-pad"
                                                placeholder="Mobile Number"
                                                placeholderTextColor="#FFECD2"
                                                maxLength={15}
                                            />
                                        )}
                                        name="mobile_number"
                                        rules={{
                                            required: 'Mobile number is required',
                                            minLength: {
                                                value: 10,
                                                message: 'Mobile number must be 10 digits',
                                            },
                                        }}
                                    />
                                </View>
                            ) : (
                                <View style={styles.phoneRow}>
                                    <CountryPicker
                                        countryCode={countryCode}
                                        withCallingCode
                                        withFlag
                                        withEmoji
                                        onSelect={() => {}}
                                        containerButtonStyle={styles.countryPicker}
                                        disabled
                                    />
                                    <Text style={styles.callingCode}>+{watch('mobile_code') || '-'}</Text>
                                    <Text style={styles.value}>{watch('mobile_number') || '-'}</Text>
                                </View>
                            )}
                            {errors.mobile_number && isEditing && (
                                <Text style={styles.errorText}>{errors.mobile_number.message}</Text>
                            )}
                        </View>

                        {/* Aadhaar Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Aadhaar</Text>
                            {isEditing ? (
                                <Controller
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={styles.input}
                                            onBlur={onBlur}
                                            onChangeText={(text) => {
                                                const cleaned = text.replace(/\D/g, '');
                                                if (cleaned.length <= 12) {
                                                    onChange(cleaned);
                                                }
                                            }}
                                            value={value}
                                            keyboardType="numeric"
                                            placeholder="Enter 12-digit Aadhaar"
                                            placeholderTextColor="#FFECD2"
                                            maxLength={12}
                                        />
                                    )}
                                    name="aadhaar_number"
                                    rules={{
                                        validate: (value) =>
                                            !value || value.length === 12 || 'Aadhaar must be 12 digits',
                                    }}
                                />
                            ) : (
                                <Text style={styles.value}>{watch('aadhaar_number') || '-'}</Text>
                            )}
                        </View>
                        {errors.aadhaar_number && isEditing && (
                            <Text style={styles.errorText}>{errors.aadhaar_number.message}</Text>
                        )}

                        {/* Date of Birth Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Date of Birth</Text>
                            {isEditing ? (
                                <TouchableOpacity
                                    onPress={() => setShowDOBPicker(true)}
                                    style={{ flex: 1 }}
                                >
                                    <Text style={[styles.input, { color: '#FFF2E0', marginLeft: 20 }]}>
                                        {formatDate(watch('date_of_birth')) || 'Select DOB'}
                                    </Text>
                                    {showDOBPicker && (
                                        <DateTimePicker
                                            value={new Date(watch('date_of_birth') || '2000-01-01')}
                                            mode="date"
                                            display="spinner"
                                            onChange={(event, selectedDate) => {
                                                setShowDOBPicker(false);
                                                if (selectedDate) {
                                                    setValue('date_of_birth', selectedDate.toISOString());
                                                }
                                            }}
                                            maximumDate={new Date()}
                                        />
                                    )}
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.value}>{formatDate(watch('date_of_birth')) || '-'}</Text>
                            )}
                        </View>

                        {/* Age Display (read-only) */}
                        {!isEditing && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Age</Text>
                                <Text style={styles.value}>{calculateAge(watch('date_of_birth'))}</Text>
                            </View>
                        )}

                        {/* Current Address Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Current Address</Text>
                            {isEditing ? (
                                <Controller
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={styles.input}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Enter current address"
                                            placeholderTextColor="#FFECD2"
                                            multiline
                                        />
                                    )}
                                    name="current_address_line"
                                />
                            ) : (
                                <Text style={styles.value}>{watch('current_address_line') || '-'}</Text>
                            )}
                        </View>

                        {/* Current Country Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Current Country</Text>
                            {isEditing ? (
                                loadingCountries ? (
                                    <ActivityIndicator size="small" color="#FFF2E0" />
                                ) : (
                                    <Controller
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <Picker
                                                selectedValue={value}
                                                style={[styles.picker, errors.current_country_id && styles.errorInput]}
                                                onValueChange={onChange}
                                            >
                                                <Picker.Item label="Select Country" value="" />
                                                {countries.map((country) => (
                                                    <Picker.Item
                                                        key={country.id}
                                                        label={country.name}
                                                        value={String(country.id)}
                                                    />
                                                ))}
                                            </Picker>
                                        )}
                                        name="current_country_id"
                                        rules={{ required: 'Current Country is required' }}
                                    />
                                )
                            ) : (
                                <Text style={styles.value}>{watch('current_country_name') || '-'}</Text>
                            )}
                        </View>
                        {errors.current_country_id && isEditing && (
                            <Text style={styles.errorText}>{errors.current_country_id.message}</Text>
                        )}

                        {/* Current State Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Current State</Text>
                            {isEditing ? (
                                loadingCurrentStates ? (
                                    <ActivityIndicator size="small" color="#FFF2E0" />
                                ) : (
                                    <Controller
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <Picker
                                                selectedValue={value}
                                                style={[styles.picker, errors.current_state_id && styles.errorInput]}
                                                onValueChange={onChange}
                                                enabled={!!currentCountryId}
                                            >
                                                <Picker.Item
                                                    label={
                                                        currentCountryId ? 'Select State' : 'Select Country first'
                                                    }
                                                    value=""
                                                />
                                                {currentStates.map((state) => (
                                                    <Picker.Item
                                                        key={state.id}
                                                        label={state.name}
                                                        value={String(state.id)}
                                                    />
                                                ))}
                                            </Picker>
                                        )}
                                        name="current_state_id"
                                        rules={{ required: 'Current State is required' }}
                                    />
                                )
                            ) : (
                                <Text style={styles.value}>{watch('current_state_name') || '-'}</Text>
                            )}
                        </View>
                        {errors.current_state_id && isEditing && (
                            <Text style={styles.errorText}>{errors.current_state_id.message}</Text>
                        )}

                        {/* Current District Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Current District</Text>
                            {isEditing ? (
                                loadingCurrentDistricts ? (
                                    <ActivityIndicator size="small" color="#FFF2E0" />
                                ) : (
                                    <Controller
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <Picker
                                                selectedValue={value}
                                                style={[styles.picker, errors.current_district_id && styles.errorInput]}
                                                onValueChange={onChange}
                                                enabled={!!currentStateId}
                                            >
                                                <Picker.Item
                                                    label={
                                                        currentStateId ? 'Select District' : 'Select State first'
                                                    }
                                                    value=""
                                                />
                                                {currentDistricts.map((district) => (
                                                    <Picker.Item
                                                        key={district.id}
                                                        label={district.name}
                                                        value={String(district.id)}
                                                    />
                                                ))}
                                            </Picker>
                                        )}
                                        name="current_district_id"
                                        rules={{ required: 'Current District is required' }}
                                    />
                                )
                            ) : (
                                <Text style={styles.value}>{watch('current_district_name') || '-'}</Text>
                            )}
                        </View>
                        {errors.current_district_id && isEditing && (
                            <Text style={styles.errorText}>{errors.current_district_id.message}</Text>
                        )}

                        {/* Native Address Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Native Address</Text>
                            {isEditing ? (
                                <Controller
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={styles.input}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Enter native address"
                                            placeholderTextColor="#FFECD2"
                                            multiline
                                        />
                                    )}
                                    name="native_address_line"
                                />
                            ) : (
                                <Text style={styles.value}>{watch('native_address_line') || '-'}</Text>
                            )}
                        </View>

                        {/* Native Country Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Native Country</Text>
                            {isEditing ? (
                                loadingCountries ? (
                                    <ActivityIndicator size="small" color="#FFF2E0" />
                                ) : (
                                    <Controller
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <Picker
                                                selectedValue={value}
                                                style={[styles.picker, errors.native_country_id && styles.errorInput]}
                                                onValueChange={onChange}
                                            >
                                                <Picker.Item label="Select Country" value="" />
                                                {countries.map((country) => (
                                                    <Picker.Item
                                                        key={country.id}
                                                        label={country.name}
                                                        value={String(country.id)}
                                                    />
                                                ))}
                                            </Picker>
                                        )}
                                        name="native_country_id"
                                        rules={{ required: 'Native Country is required' }}
                                    />
                                )
                            ) : (
                                <Text style={styles.value}>{watch('native_country_name') || '-'}</Text>
                            )}
                        </View>
                        {errors.native_country_id && isEditing && (
                            <Text style={styles.errorText}>{errors.native_country_id.message}</Text>
                        )}

                        {/* Native State Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Native State</Text>
                            {isEditing ? (
                                loadingNativeStates ? (
                                    <ActivityIndicator size="small" color="#FFF2E0" />
                                ) : (
                                    <Controller
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <Picker
                                                selectedValue={value}
                                                style={[styles.picker, errors.native_state_id && styles.errorInput]}
                                                onValueChange={onChange}
                                                enabled={!!nativeCountryId}
                                            >
                                                <Picker.Item
                                                    label={
                                                        nativeCountryId ? 'Select State' : 'Select Country first'
                                                    }
                                                    value=""
                                                />
                                                {nativeStates.map((state) => (
                                                    <Picker.Item
                                                        key={state.id}
                                                        label={state.name}
                                                        value={String(state.id)}
                                                    />
                                                ))}
                                            </Picker>
                                        )}
                                        name="native_state_id"
                                        rules={{ required: 'Native State is required' }}
                                    />
                                )
                            ) : (
                                <Text style={styles.value}>{watch('native_state_name') || '-'}</Text>
                            )}
                        </View>
                        {errors.native_state_id && isEditing && (
                            <Text style={styles.errorText}>{errors.native_state_id.message}</Text>
                        )}

                        {/* Native District Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Native District</Text>
                            {isEditing ? (
                                loadingNativeDistricts ? (
                                    <ActivityIndicator size="small" color="#FFF2E0" />
                                ) : (
                                    <Controller
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <Picker
                                                selectedValue={value}
                                                style={[styles.picker, errors.native_district_id && styles.errorInput]}
                                                onValueChange={onChange}
                                                enabled={!!nativeStateId}
                                            >
                                                <Picker.Item
                                                    label={
                                                        nativeStateId ? 'Select District' : 'Select State first'
                                                    }
                                                    value=""
                                                />
                                                {nativeDistricts.map((district) => (
                                                    <Picker.Item
                                                        key={district.id}
                                                        label={district.name}
                                                        value={String(district.id)}
                                                    />
                                                ))}
                                            </Picker>
                                        )}
                                        name="native_district_id"
                                        rules={{ required: 'Native District is required' }}
                                    />
                                )
                            ) : (
                                <Text style={styles.value}>{watch('native_district_name') || '-'}</Text>
                            )}
                        </View>
                        {errors.native_district_id && isEditing && (
                            <Text style={styles.errorText}>{errors.native_district_id.message}</Text>
                        )}

                        {/* Language Preference Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Language</Text>
                            {isEditing ? (
                                <Controller
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Picker
                                            selectedValue={value}
                                            style={[styles.picker, errors.language_pref && styles.errorInput]}
                                            onValueChange={onChange}
                                        >
                                            <Picker.Item label="Select Language" value="" />
                                            {languageOptions.map((lang) => (
                                                <Picker.Item key={lang.id} label={lang.name} value={lang.id} />
                                            ))}
                                        </Picker>
                                    )}
                                    name="language_pref"
                                    rules={{ required: 'Language preference is required' }}
                                />
                            ) : (
                                <Text style={styles.value}>
                                    {languageOptions.find((lang) => lang.id === watch('language_pref'))?.name || '-'}
                                </Text>
                            )}
                        </View>
                        {errors.language_pref && isEditing && (
                            <Text style={styles.errorText}>{errors.language_pref.message}</Text>
                        )}

                        {/* Skills Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Skills</Text>
                            {isEditing ? (
                                <Controller
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={styles.input}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Enter your skills"
                                            placeholderTextColor="#FFECD2"
                                        />
                                    )}
                                    name="skills"
                                />
                            ) : (
                                <Text style={styles.value}>{watch('skills') || '-'}</Text>
                            )}
                        </View>

                        {/* Job Type Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Job Type</Text>
                            {isEditing ? (
                                <Controller
                                    control={control}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={styles.input}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Enter your job type"
                                            placeholderTextColor="#FFECD2"
                                        />
                                    )}
                                    name="job_type"
                                />
                            ) : (
                                <Text style={styles.value}>{watch('job_type') || '-'}</Text>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={isEditing ? handleSubmit(onSubmit) : () => setIsEditing(true)}
                            disabled={updating}
                        >
                            {updating ? (
                                <ActivityIndicator color="#3D2A1A" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, width, height },
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    scrollContainer: { flexGrow: 1 },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 20,
        width: '100%',
    },
    backButton: {
        padding: 10,
        backgroundColor: 'rgba(255, 242, 224, 0.2)',
        borderRadius: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#FFF2E0',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFECD2',
        textAlign: 'center',
        flex: 1,
        paddingHorizontal: 10,
    },
    contentContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    avatar: {
        width: 160,
        height: 160,
        marginBottom: 20,
        borderRadius: 160 / 2,
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
        width: '40%',
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
    picker: {
        flex: 1,
        marginLeft: 20,
        color: '#FFF2E0',
        backgroundColor: '#6e3b17',
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
        marginTop: 20,
    },
    buttonText: {
        fontSize: 18,
        color: '#3D2A1A',
        fontWeight: 'bold',
    },
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    loadingBackground: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.9,
        borderRadius: 10,
    },
    loadingText: {
        marginTop: 20,
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 20,
    },
    countryPicker: {
        marginRight: 8,
    },
    callingCode: {
        color: '#FFF2E0',
        fontSize: 16,
        marginRight: 8,
        fontWeight: '600',
        minWidth: 40,
    },
    errorInput: {
        borderColor: 'red',
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 20,
        textAlign: 'right',
    },
});

export default ProfileScreen;