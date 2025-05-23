import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import { getCountries, getDistricts, getStates, updateUserData } from '../api/auth';
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

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
}

function ProfileEdit({ navigation, route }) {
    const { userData } = route.params; // Get userData passed from ProfileScreen

    const [showDOBPicker, setShowDOBPicker] = useState(false);
    const [imageUri, setImageUri] = useState(userData?.photo || null);
    const [updating, setUpdating] = useState(false);
    const [countryCode, setCountryCode] = useState('IN');
    const [callingCode, setCallingCode] = useState(userData?.mobile_code || '91');

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
            name: userData?.name || '',
            email: userData?.email || null,
            mobile_number: userData?.mobile_number || '',
            mobile_code: userData?.mobile_code || '',
            date_of_birth: userData?.date_of_birth || '',
            aadhaar_number: userData?.aadhaar_number || '',
            current_address_line: userData?.current_address_line || '',
            native_address_line: userData?.native_address_line || '',
            current_district_id: userData?.current_district_id ? String(userData.current_district_id) : '',
            current_state_id: userData?.current_state_id ? String(userData.current_state_id) : '',
            current_country_id: userData?.current_country_id ? String(userData.current_country_id) : '',
            native_district_id: userData?.native_district_id ? String(userData.native_district_id) : '',
            native_state_id: userData?.native_state_id ? String(userData.native_state_id) : '',
            native_country_id: userData?.native_country_id ? String(userData.native_country_id) : '',
            skills: userData?.skills || '',
            job_type: userData?.job_type || '',
            language_pref: userData?.language_pref || '',
            photo: userData?.photo || null,
            id: userData?.id || null,
            current_country_name: userData?.current_country?.name || '',
            current_state_name: userData?.current_state?.name || '',
            current_district_name: userData?.current_district?.name || '',
            native_country_name: userData?.native_country?.name || '',
            native_state_name: userData?.native_state?.name || '',
            native_district_name: userData?.native_district?.name || '',
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

    // Fetch states for current address on initial load or when currentCountryId changes
    useEffect(() => {
        const fetchCurrentStates = async () => {
            if (currentCountryId) {
                setLoadingCurrentStates(true);
                try {
                    const response = await getStates(currentCountryId);
                    const states = response.data || [];
                    setCurrentStates(states);

                    if (!states.some(state => String(state.id) === currentStateId)) {
                        setValue('current_state_id', '');
                        setValue('current_district_id', '');
                    }
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
                setValue('current_state_id', '');
                setValue('current_district_id', '');
            }
        };
        fetchCurrentStates();
    }, [currentCountryId, setValue]);

    // Fetch districts for current address on initial load or when currentStateId changes
    useEffect(() => {
        const fetchCurrentDistricts = async () => {
            if (currentStateId) {
                setLoadingCurrentDistricts(true);
                try {
                    const response = await getDistricts(currentStateId);
                    const districts = response.data || [];
                    setCurrentDistricts(districts);

                    if (!districts.some(district => String(district.id) === watch('current_district_id'))) {
                        setValue('current_district_id', '');
                    }
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
                setValue('current_district_id', '');
            }
        };
        fetchCurrentDistricts();
    }, [currentStateId, setValue]);

    // Fetch states for native address on initial load or when nativeCountryId changes
    useEffect(() => {
        const fetchNativeStates = async () => {
            if (nativeCountryId) {
                setLoadingNativeStates(true);
                try {
                    const response = await getStates(nativeCountryId);
                    const states = response.data || [];
                    setNativeStates(states);

                    if (!states.some(state => String(state.id) === nativeStateId)) {
                        setValue('native_state_id', '');
                        setValue('native_district_id', '');
                    }
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
                setValue('native_state_id', '');
                setValue('native_district_id', '');
            }
        };
        fetchNativeStates();
    }, [nativeCountryId, setValue]);

    // Fetch districts for native address on initial load or when nativeStateId changes
    useEffect(() => {
        const fetchNativeDistricts = async () => {
            if (nativeStateId) {
                setLoadingNativeDistricts(true);
                try {
                    const response = await getDistricts(nativeStateId);
                    const districts = response.data || [];
                    setNativeDistricts(districts);

                    if (!districts.some(district => String(district.id) === watch('native_district_id'))) {
                        setValue('native_district_id', '');
                    }
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
                setValue('native_district_id', '');
            }
        };
        fetchNativeDistricts();
    }, [nativeStateId, setValue]);

    const onSubmit = async (data) => {
        try {
            setUpdating(true);

            // Check network status
            // const netInfo = await NetInfo.fetch();
            // if (!netInfo.isConnected) {
            //     throw new Error('No internet connection. Please check your network and try again.');
            // }

            // Validate user ID
            if (!data.id) {
                throw new Error('User ID is missing. Cannot update profile.');
            }

            const submissionData = { ...data,
                // Only include native address fields if country is selected
            native_country_id: data.native_country_id || null,
            native_state_id: data.native_country_id ? data.native_state_id || null : null,
            native_district_id: data.native_country_id && data.native_state_id ? data.native_district_id || null : null
             };
            delete submissionData.current_country_name;
            delete submissionData.current_state_name;
            delete submissionData.current_district_name;
            delete submissionData.native_country_name;
            delete submissionData.native_state_name;
            delete submissionData.native_district_name;

            // Log the data being sent for debugging
            console.log('Submitting data to API:', submissionData);

            // Retry logic: Attempt the API call up to 2 times
            let response;
            let attempts = 0;
            const maxAttempts = 2;

            while (attempts < maxAttempts) {
                try {
                    response = await updateUserData(data.id, submissionData);
                    break; // If successful, exit the retry loop
                } catch (error) {
                    attempts += 1;
                    if (attempts === maxAttempts) {
                        throw error; // If max attempts reached, throw the error
                    }
                    // Wait 1 second before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            // Check if the response indicates success
            if (response.status) {
                Alert.alert(
                    'Success',
                    response.details || 'Profile updated successfully!',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Profile'),
                        },
                    ],
                    { cancelable: false }
                );
            } else {
                throw new Error(response.details || 'Failed to update profile');
            }
        } catch (error) {
            // Log the exact error for debugging
            console.error('Failed to update user data:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to update user data',
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

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <LinearGradient colors={['#5e3b15', '#b06a2c']} style={styles.background}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.backButtonText}>{'< Back'}</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Edit Profile</Text>
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
                            <TouchableOpacity onPress={handleImagePick} style={styles.cameraIconContainer}>
                                <Image
                                    source={require('../asserts/images/photo-camera.png')}
                                    style={styles.iconStyle}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Name Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Name</Text>
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
                        </View>
                        {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

                        {/* Email Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Email</Text>
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
                        </View>

                        {/* Mobile Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Mobile</Text>
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
                                            style={[styles.mobileinput, { flex: 1 }]}
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
                        </View>
                        {errors.mobile_number && (
                            <Text style={styles.errorText}>{errors.mobile_number.message}</Text>
                        )}

                        {/* Aadhaar Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Aadhaar</Text>
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
                        </View>
                        {errors.aadhaar_number && (
                            <Text style={styles.errorText}>{errors.aadhaar_number.message}</Text>
                        )}

                        {/* Date of Birth Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Date of Birth</Text>
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
                        </View>

                        {/* Current Address Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Current Address</Text>
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
                        </View>

                        {/* Current Country Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Current Country</Text>
                            {loadingCountries ? (
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
                            )}
                        </View>
                        {errors.current_country_id && (
                            <Text style={styles.errorText}>{errors.current_country_id.message}</Text>
                        )}

                        {/* Current State Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Current State</Text>
                            {loadingCurrentStates ? (
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
                            )}
                        </View>
                        {errors.current_state_id && (
                            <Text style={styles.errorText}>{errors.current_state_id.message}</Text>
                        )}

                        {/* Current District Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Current District</Text>
                            {loadingCurrentDistricts ? (
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
                            )}
                        </View>
                        {errors.current_district_id && (
                            <Text style={styles.errorText}>{errors.current_district_id.message}</Text>
                        )}

                        {/* Native Address Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Native Address</Text>
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
                        </View>

                        {/* Native Country Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Native Country</Text>
                            {loadingCountries ? (
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
                                // rules={{ required: 'Native Country is required' }}
                                />
                            )}
                        </View>
                        {/* {errors.native_country_id && (
                            <Text style={styles.errorText}>{errors.native_country_id.message}</Text>
                        )} */}

                        {/* Native State Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Native State</Text>
                            {loadingNativeStates ? (
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
                                    // rules={{ required: 'Native State is required' }}
                                    rules={{
                                        validate: (value) => {
                                            // Only validate if native country is selected
                                            if (watch('native_country_id') && !value) {
                                                return 'Native State is required when country is selected';
                                            }
                                            return true;
                                        }
                                    }}
                                />
                            )}
                        </View>
                        {watch('native_country_id') && errors.native_state_id && (
                            <Text style={styles.errorText}>{errors.native_state_id.message}</Text>
                        )}

                        {/* Native District Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Native District</Text>
                            {loadingNativeDistricts ? (
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
                                    // rules={{ required: 'Native District is required' }}
                                    rules={{
                                        validate: (value) => {
                                            // Only validate if native state is selected
                                            if (watch('native_state_id') && !value) {
                                                return 'Native District is required when state is selected';
                                            }
                                            return true;
                                        }
                                    }}
                                />
                            )}
                        </View>
                        {watch('native_state_id') && errors.native_district_id && (
                            <Text style={styles.errorText}>{errors.native_district_id.message}</Text>
                        )}

                        {/* Language Preference Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Language</Text>
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
                                defaultValue={userData?.language_pref || ''} // Ensure default value is set
                            />
                        </View>
                        {errors.language_pref && (
                            <Text style={styles.errorText}>{errors.language_pref.message}</Text>
                        )}

                        {/* Skills Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Skills</Text>
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
                        </View>

                        {/* Job Type Field */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Job Type</Text>
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
                        </View>

                        <TouchableOpacity
                            style={[styles.button, updating && styles.buttonDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={updating}
                        >
                            {updating ? (
                                <ActivityIndicator color="#3D2A1A" />
                            ) : (
                                <Text style={styles.buttonText}>Save Changes</Text>
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomColor: '#a86030',
        borderBottomWidth: 0.5,
        alignItems: 'flex-start',
    },
    label: {
        color: '#FFECD2',
        fontSize: 16,
        width: '40%',
        paddingTop: 8,
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
    mobileinput: {
        flex: 1,
        marginLeft: 5,
        fontSize: 16,
        color: '#FFF2E0',
        borderBottomWidth: 1,
        borderBottomColor: '#FFECD2',
        paddingVertical: 2,
    },
    picker: {
        flex: 1,
        height: 50,
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
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontSize: 18,
        color: '#3D2A1A',
        fontWeight: 'bold',
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 20,
    },
    countryPicker: {
        // marginRight: 8,
    },
    callingCode: {
        color: '#FFF2E0',
        fontSize: 16,
        // marginRight: 8,
        fontWeight: '600',
        // minWidth: 40,
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
        marginTop: 4,
        marginLeft: '40%', // Align with the input fields
        textAlign: 'left', // Changed from 'right' to 'left'
        paddingLeft: 20,
    },
    // Update the error text style
    // errorText: {
    //     color: 'red',
    //     fontSize: 12,
    //     marginTop: 4,
    //     marginLeft: '40%', // Align with the input fields
    //     textAlign: 'left', // Changed from 'right' to 'left'
    //     paddingLeft: 20, // Match input margin
    // },

    // Add a new style for picker container
    pickerContainer: {
        flex: 1,
        marginLeft: 20,
    },
});

export default ProfileEdit;