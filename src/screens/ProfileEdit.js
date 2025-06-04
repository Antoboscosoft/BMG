import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import { getCountries, getDistricts, getStates, getUserData, updateUserData, getJobTypes, getSkillsByJobType } from '../api/auth';
import Toast from 'react-native-toast-message';
import CountryPicker from 'react-native-country-picker-modal';
import { useForm, Controller } from 'react-hook-form';
import { useLanguage } from '../language/commondir';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const languageOptions = [
    { id: 'en', name: 'English' },
    { id: 'hi', name: 'Hindi' },
    { id: 'ta', name: 'Tamil' },
    { id: 'bn', name: 'Bengali' },
];

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
}

function ProfileEdit({ navigation, route }) {
    const { userData } = route.params;
    const { languageTexts } = useLanguage();
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
    const [jobTypes, setJobTypes] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loadingJobTypes, setLoadingJobTypes] = useState(false);
    const [loadingSkills, setLoadingSkills] = useState(false);

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
            skills: Array.isArray(userData?.skills) ? userData.skills : [],
            job_type: Array.isArray(userData?.job_type) ? userData.job_type : [],
            language_pref: userData?.language_pref || '',
            photo: userData?.photo || null,
            id: userData?.id || null,
            role_id: userData?.role_id || null,
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
                    text1: languageTexts?.common?.error || 'Error',
                    text2: languageTexts?.profile?.edit?.error?.loadCountries || 'Failed to load countries',
                });
            } finally {
                setLoadingCountries(false);
            }
        };
        fetchCountries();
    }, []);

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
                        text1: languageTexts?.common?.error || 'Error',
                        text2: languageTexts?.profile?.edit?.error?.loadStates || 'Failed to load states',
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
                        text1: languageTexts?.common?.error || 'Error',
                        text2: languageTexts?.profile?.edit?.error?.loadDistricts || 'Failed to load districts',
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
                        text1: languageTexts?.common?.error || 'Error',
                        text2: languageTexts?.profile?.edit?.error?.loadStates || 'Failed to load states',
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
                        text1: languageTexts?.common?.error || 'Error',
                        text2: languageTexts?.profile?.edit?.error?.loadDistricts || 'Failed to load districts',
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

    useEffect(() => {
        const fetchJobTypes = async () => {
            setLoadingJobTypes(true);
            try {
                const response = await getJobTypes();
                setJobTypes(response.data || []);
            } catch (error) {
                Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load job types' });
            } finally {
                setLoadingJobTypes(false);
            }
        };
        fetchJobTypes();
    }, []);

    useEffect(() => {
        const selectedJobTypeIds = Array.isArray(watch('job_type')) ? watch('job_type').map(j => j.id) : [];
        if (selectedJobTypeIds.length > 0) {
            setLoadingSkills(true);
            setSkills([]);
            const fetchSkills = async () => {
                try {
                    const response = await getSkillsByJobType(selectedJobTypeIds.join(','));
                    setSkills(response.data || []);
                } catch (error) {
                    Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load skills' });
                } finally {
                    setLoadingSkills(false);
                }
            };
            fetchSkills();
        } else {
            setSkills([]);
        }
    }, [watch('job_type')]);

    const onSubmit = async (data) => {
        try {
            setUpdating(true);
            if (!data.id) {
                throw new Error(languageTexts?.profile?.edit?.error?.missingId || 'User ID is missing. Cannot update profile.');
            }
            const submissionData = {
                ...data,
                skills: Array.isArray(data.skills) ? data.skills.filter(s => s.id).map(s => ({ id: s.id })) : [],
                job_type: Array.isArray(data.job_type) ? data.job_type.filter(j => j.id).map(j => ({ id: j.id })) : [],
                photo: data.photo || null,
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

            let response;
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
                try {
                    response = await updateUserData(data.id, submissionData);
                    break;
                } catch (error) {
                    attempts += 1;
                    if (attempts === maxAttempts) {
                        throw error;
                    }
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            if (response.status) {
                const updatedUserResponse = await getUserData();
                const updatedUser = updatedUserResponse.status && updatedUserResponse.data ? updatedUserResponse.data : submissionData;

                Alert.alert(
                    languageTexts?.common?.success || 'Success',
                    response.details || (languageTexts?.profile?.edit?.success || 'Profile updated successfully!'),
                    [
                        {
                            text: languageTexts?.common?.ok || 'OK',
                            onPress: () => {
                                if (updatedUser.isSuperAdmin) {
                                    navigation.navigate('MigrantsList', {
                                        updatedUserData: updatedUser,
                                        updateTimestamp: Date.now()
                                    });
                                } else {
                                    navigation.navigate('Profile', {
                                        updatedUserData: updatedUser,
                                        updateTimestamp: Date.now()
                                    });
                                }
                            },
                        },
                    ],
                    { cancelable: false }
                );
            } else {
                throw new Error(response.details || (languageTexts?.profile?.edit?.error?.update || 'Failed to update profile'));
            }
        } catch (error) {
            console.error('Failed to update user data:', error);
            Toast.show({
                type: 'error',
                text1: languageTexts?.common?.error || 'Error',
                text2: error.message || (languageTexts?.profile?.edit?.error?.update || 'Failed to update user data'),
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
                Toast.show({
                    type: 'error',
                    text1: languageTexts?.common?.error || 'Error',
                    text2: languageTexts?.profile?.edit?.error?.image || 'Failed to pick image',
                });
                return;
            }

            const uri = response.assets[0].uri;
            const base64 = response.assets[0].base64;
            setImageUri(uri);
            setValue('newPhoto', base64);
        });
    };

    const goBack = () => {  
        navigation.goBack();
    };

    // Multi-Select Searchable Dropdown for Skills and Job Type
    const MultiSelectSearchableDropdown = ({
        placeholder,
        data,
        selectedValues,
        onSelect,
        error,
        disabled,
        loading,
        isMandatory,
        validateField,
    }) => {
        const [modalVisible, setModalVisible] = useState(false);
        const [searchQuery, setSearchQuery] = useState('');
        const [filteredData, setFilteredData] = useState(data);

        useEffect(() => {
            if (searchQuery) {
                const filtered = data.filter((item) =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setFilteredData(filtered);
            } else {
                setFilteredData(data);
            }
        }, [searchQuery, data]);

        const handleSelect = (id) => {
            let updatedValues;
            if (selectedValues.includes(id)) {
                updatedValues = selectedValues.filter((value) => value !== id);
            } else {
                updatedValues = [...selectedValues, id];
            }
            onSelect(updatedValues);
            validateField(updatedValues);
            // DO NOT close modal here!
        };

        const selectedItems = data.filter((item) => selectedValues.includes(item.id));

        return (
            <View style={styles.pickerContainer}>
                {loading ? (
                    <ActivityIndicator size="small" color="#FFF2E0" />
                ) : (
                    <>
                        <TouchableOpacity
                            style={[
                                styles.picker,
                                error && styles.errorInput,
                                disabled && styles.disabledInput,
                            ]}
                            onPress={() => !disabled && setModalVisible(true)}
                            disabled={disabled}
                        >
                            <Text style={selectedValues.length > 0 ? styles.dropdownText : styles.placeholderText}>
                                {selectedItems.length > 0
                                    ? selectedItems.map((item) => item.name).join(', ')
                                    : placeholder}
                            </Text>
                            <Icon name="arrow-drop-down" size={20} color="#FFF2E0" />
                        </TouchableOpacity>
                    </>
                )}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.whiteModalContainer}>
                            <View style={styles.searchContainer}>
                                <Icon name="search" size={18} color="#666" style={styles.searchIcon} />
                                <TextInput
                                    style={styles.whiteSearchInput}
                                    placeholder={`Search...`}
                                    placeholderTextColor="#999"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    autoFocus
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        setModalVisible(false);
                                        setSearchQuery('');
                                    }}
                                >
                                    <Text style={styles.closeButton}>Close</Text>
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={filteredData}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.whiteModalItem,
                                            selectedValues.includes(item.id) && styles.selectedItem,
                                        ]}
                                        onPress={() => handleSelect(item.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.whiteModalItemText}>{item.name || item.id}</Text>
                                        {selectedValues.includes(item.id) && (
                                            <Icon name="check" size={18} color="#007AFF" style={styles.tickIcon} />
                                        )}
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <Text style={styles.whiteEmptyText}>No results found</Text>
                                }
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };

    // Single-Select Searchable Dropdown for Country, State, District
    const SearchableDropdown = ({
        placeholder,
        data,
        selectedValue,
        onSelect,
        error,
        disabled,
        loading,
    }) => {
        const [modalVisible, setModalVisible] = useState(false);
        const [searchQuery, setSearchQuery] = useState('');
        const [filteredData, setFilteredData] = useState(data);

        useEffect(() => {
            if (searchQuery) {
                const filtered = data.filter((item) =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setFilteredData(filtered);
            } else {
                setFilteredData(data);
            }
        }, [searchQuery, data]);

        const handleSelect = (id) => {
            onSelect(id);
            setModalVisible(false);
            setSearchQuery('');
        };

        const selectedItem = data.find((item) => String(item.id) === String(selectedValue));

        return (
            <View style={styles.pickerContainer}>
                {loading ? (
                    <ActivityIndicator size="small" color="#FFF2E0" />
                ) : (
                    <>
                        <TouchableOpacity
                            style={[
                                styles.picker,
                                error && styles.errorInput,
                                disabled && styles.disabledInput,
                            ]}
                            onPress={() => !disabled && setModalVisible(true)}
                            disabled={disabled}
                        >
                            <Text style={selectedValue ? styles.dropdownText : styles.placeholderText}>
                                {selectedItem ? (selectedItem.name || selectedItem.id) : placeholder}
                            </Text>
                            <Icon name="arrow-drop-down" size={20} color="#FFF2E0" />
                        </TouchableOpacity>
                    </>
                )}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.whiteModalContainer}>
                            <View style={styles.searchContainer}>
                                <Icon name="search" size={18} color="#666" style={styles.searchIcon} />
                                <TextInput
                                    style={styles.whiteSearchInput}
                                    placeholder={`Search...`}
                                    placeholderTextColor="#999"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    autoFocus
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        setModalVisible(false);
                                        setSearchQuery('');
                                    }}
                                >
                                    <Text style={styles.closeButton}>Close</Text>
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={filteredData}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.whiteModalItem,
                                            String(selectedValue) === String(item.id) && styles.selectedItem,
                                        ]}
                                        onPress={() => handleSelect(String(item.id))}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.whiteModalItemText}>{item.name || item.id}</Text>
                                        {String(selectedValue) === String(item.id) && (
                                            <Icon name="check" size={18} color="#007AFF" style={styles.tickIcon} />
                                        )}
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <Text style={styles.whiteEmptyText}>No results found</Text>
                                }
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    </View>
                </Modal>
            </View>
        );
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
                        <TouchableOpacity style={styles.backButton} onPress={() => goBack()}>
                            <Icon name="arrow-back-ios" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>
                            {languageTexts?.profile?.edit?.title || 'Edit Profile'}
                        </Text>
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

                        <View style={styles.row}>
                            <Text style={styles.label}>
                                {languageTexts?.profile?.edit?.labels?.name || 'Name'}
                            </Text>
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={styles.input}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        placeholder={languageTexts?.profile?.edit?.placeholders?.name || 'Enter your name'}
                                        placeholderTextColor="#FFECD2"
                                    />
                                )}
                                name="name"
                                rules={{ required: languageTexts?.profile?.edit?.error?.name || 'Name is required' }}
                            />
                        </View>
                        {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

                        <View style={styles.row}>
                            <Text style={styles.label}>
                                {languageTexts?.profile?.edit?.labels?.email || 'Email'}
                            </Text>
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={styles.input}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value || ''}
                                        keyboardType="email-address"
                                        placeholder={languageTexts?.profile?.edit?.placeholders?.email || 'Enter your email'}
                                        placeholderTextColor="#FFECD2"
                                    />
                                )}
                                name="email"
                            />
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>
                                {languageTexts?.profile?.edit?.labels?.mobile || 'Mobile'}
                            </Text>
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
                                            placeholder={languageTexts?.profile?.edit?.placeholders?.mobile || 'Mobile Number'}
                                            placeholderTextColor="#FFECD2"
                                            maxLength={15}
                                        />
                                    )}
                                    name="mobile_number"
                                    rules={{
                                        required: languageTexts?.profile?.edit?.error?.mobile || 'Mobile number is required',
                                        minLength: {
                                            value: 10,
                                            message: languageTexts?.profile?.edit?.error?.mobileLength || 'Mobile number must be 10 digits',
                                        },
                                    }}
                                />
                            </View>
                        </View>
                        {errors.mobile_number && (
                            <Text style={styles.errorText}>{errors.mobile_number.message}</Text>
                        )}

                        <View style={styles.row}>
                            <Text style={styles.label}>
                                {languageTexts?.profile?.edit?.labels?.aadhaar || 'Aadhaar'}
                            </Text>
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
                                        placeholder={languageTexts?.profile?.edit?.placeholders?.aadhaar || 'Enter 12-digit Aadhaar'}
                                        placeholderTextColor="#FFECD2"
                                        maxLength={12}
                                    />
                                )}
                                name="aadhaar_number"
                                rules={{
                                    validate: (value) =>
                                        !value || value.length === 12 || (languageTexts?.profile?.edit?.error?.aadhaar || 'Aadhaar must be 12 digits'),
                                }}
                            />
                        </View>
                        {errors.aadhaar_number && (
                            <Text style={styles.errorText}>{errors.aadhaar_number.message}</Text>
                        )}

                        <View style={styles.row}>
                            <Text style={styles.label}>
                                {languageTexts?.profile?.edit?.labels?.dob || 'Date of Birth'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowDOBPicker(true)}
                                style={{ flex: 1 }}
                            >
                                <Text style={[styles.input, { color: '#FFF2E0', marginLeft: 20 }]}>
                                    {formatDate(watch('date_of_birth')) || (languageTexts?.profile?.edit?.placeholders?.dob || 'Select DOB')}
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

                        <View style={styles.row}>
                            <Text style={styles.label}>
                                {languageTexts?.profile?.edit?.labels?.currentAddress || 'Current Address'}
                            </Text>
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={styles.input}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        placeholder={languageTexts?.profile?.edit?.placeholders?.currentAddress || 'Enter current address'}
                                        placeholderTextColor="#FFECD2"
                                        multiline
                                    />
                                )}
                                name="current_address_line"
                            />
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>
                                {languageTexts?.profile?.edit?.labels?.currentCountry || 'Current Country'}
                            </Text>
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <SearchableDropdown
                                        placeholder={languageTexts?.profile?.edit?.placeholders?.selectCountry || 'Select Country'}
                                        data={countries}
                                        selectedValue={value}
                                        onSelect={onChange}
                                        error={errors.current_country_id}
                                        disabled={loadingCountries}
                                        loading={loadingCountries}
                                    />
                                )}
                                name="current_country_id"
                                rules={{ required: languageTexts?.profile?.edit?.error?.currentCountry || 'Current Country is required' }}
                            />
                        </View>
                        {errors.current_country_id && (
                            <Text style={styles.errorText}>{errors.current_country_id.message}</Text>
                        )}

                        <View style={styles.row}>
                            <Text style={styles.label}>
                                {languageTexts?.profile?.edit?.labels?.currentState || 'Current State'}
                            </Text>
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <SearchableDropdown
                                        placeholder={
                                            currentCountryId
                                                ? (languageTexts?.profile?.edit?.placeholders?.selectState || 'Select State')
                                                : (languageTexts?.profile?.edit?.placeholders?.selectCountryFirst || 'Select Country first')
                                        }
                                        data={currentStates}
                                        selectedValue={value}
                                        onSelect={onChange}
                                        error={errors.current_state_id}
                                        disabled={!currentCountryId || loadingCurrentStates}
                                        loading={loadingCurrentStates}
                                    />
                                )}
                                name="current_state_id"
                                rules={{ required: languageTexts?.profile?.edit?.error?.currentState || 'Current State is required' }}
                            />
                        </View>
                        {errors.current_state_id && (
                            <Text style={styles.errorText}>{errors.current_state_id.message}</Text>
                        )}

                        <View style={styles.row}>
                            <Text style={styles.label}>
                                {languageTexts?.profile?.edit?.labels?.currentDistrict || 'Current District'}
                            </Text>
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <SearchableDropdown
                                        placeholder={
                                            currentStateId
                                                ? (languageTexts?.profile?.edit?.placeholders?.selectDistrict || 'Select District')
                                                : (languageTexts?.profile?.edit?.placeholders?.selectStateFirst || 'Select State first')
                                        }
                                        data={currentDistricts}
                                        selectedValue={value}
                                        onSelect={onChange}
                                        error={errors.current_district_id}
                                        disabled={!currentStateId || loadingCurrentDistricts}
                                        loading={loadingCurrentDistricts}
                                    />
                                )}
                                name="current_district_id"
                                rules={{ required: languageTexts?.profile?.edit?.error?.currentDistrict || 'Current District is required' }}
                            />
                        </View>
                        {errors.current_district_id && (
                            <Text style={styles.errorText}>{errors.current_district_id.message}</Text>
                        )}

                        <View style={styles.row}>
                            <Text style={styles.label}>
                                {languageTexts?.profile?.edit?.labels?.nativeAddress || 'Native Address'}
                            </Text>
                            <Controller
                                control={control}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        style={styles.input}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        placeholder={languageTexts?.profile?.edit?.placeholders?.nativeAddress || 'Enter native address'}
                                        placeholderTextColor="#FFECD2"
                                        multiline
                                    />
                                )}
                                name="native_address_line"
                            />
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>
                                {languageTexts?.profile?.edit?.labels?.nativeCountry || 'Native Country'}
                            </Text>
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <SearchableDropdown
                                        placeholder={languageTexts?.profile?.edit?.placeholders?.selectCountry || 'Select Country'}
                                        data={countries}
                                        selectedValue={value}
                                        onSelect={onChange}
                                        error={errors.native_country_id}
                                        disabled={loadingCountries}
                                        loading={loadingCountries}
                                    />
                                )}
                                name="native_country_id"
                            />
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>
                                {languageTexts?.profile?.edit?.labels?.nativeState || 'Native State'}
                            </Text>
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <SearchableDropdown
                                        placeholder={
                                            nativeCountryId
                                                ? (languageTexts?.profile?.edit?.placeholders?.selectState || 'Select State')
                                                : (languageTexts?.profile?.edit?.placeholders?.selectCountryFirst || 'Select Country first')
                                        }
                                        data={nativeStates}
                                        selectedValue={value}
                                        onSelect={onChange}
                                        error={errors.native_state_id}
                                        disabled={!nativeCountryId || loadingNativeStates}
                                        loading={loadingNativeStates}
                                    />
                                )}
                                name="native_state_id"
                                rules={{
                                    validate: (value) => {
                                        if (watch('native_country_id') && !value) {
                                            return languageTexts?.profile?.edit?.error?.nativeState || 'Native State is required when country is selected';
                                        }
                                        return true;
                                    }
                                }}
                            />
                        </View>
                        {watch('native_country_id') && errors.native_state_id && (
                            <Text style={styles.errorText}>{errors.native_state_id.message}</Text>
                        )}

                        <View style={styles.row}>
                            <Text style={styles.label}>
                                {languageTexts?.profile?.edit?.labels?.nativeDistrict || 'Native District'}
                            </Text>
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <SearchableDropdown
                                        placeholder={
                                            nativeStateId
                                                ? (languageTexts?.profile?.edit?.placeholders?.selectDistrict || 'Select District')
                                                : (languageTexts?.profile?.edit?.placeholders?.selectStateFirst || 'Select State first')
                                        }
                                        data={nativeDistricts}
                                        selectedValue={value}
                                        onSelect={onChange}
                                        error={errors.native_district_id}
                                        disabled={!nativeStateId || loadingNativeDistricts}
                                        loading={loadingNativeDistricts}
                                    />
                                )}
                                name="native_district_id"
                                rules={{
                                    validate: (value) => {
                                        if (watch('native_state_id') && !value) {
                                            return languageTexts?.profile?.edit?.error?.nativeDistrict || 'Native District is required when state is selected';
                                        }
                                        return true;
                                    }
                                }}
                            />
                        </View>
                        {watch('native_state_id') && errors.native_district_id && (
                            <Text style={styles.errorText}>{errors.native_district_id.message}</Text>
                        )}

                        <View style={styles.row}>
                            <Text style={styles.label}>
                                {languageTexts?.profile?.edit?.labels?.jobType || 'Job Type'}
                            </Text>
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <MultiSelectSearchableDropdown
                                        placeholder={languageTexts?.profile?.edit?.placeholders?.jobType || 'Select Job Types'}
                                        data={jobTypes}
                                        selectedValues={Array.isArray(value) ? value.map(j => j.id) : []}
                                        onSelect={ids => {
                                            const selected = jobTypes.filter(j => ids.includes(j.id));
                                            onChange(selected);
                                        }}
                                        error={errors.job_type?.message}
                                        disabled={loadingJobTypes}
                                        loading={loadingJobTypes}
                                        isMandatory={true}
                                        validateField={() => {}}
                                    />
                                )}
                                name="job_type"
                                rules={{ required: languageTexts?.profile?.edit?.error?.jobType || 'At least one job type is required' }}
                            />
                        </View>
                        {errors.job_type && (
                            <Text style={styles.errorText}>{errors.job_type.message}</Text>
                        )}

                        <View style={styles.row}>
                            <Text style={styles.label}>
                                {languageTexts?.profile?.edit?.labels?.skills || 'Skills'}
                            </Text>
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <MultiSelectSearchableDropdown
                                        placeholder={watch('job_type') && watch('job_type').length > 0 ? (languageTexts?.profile?.edit?.placeholders?.skills || 'Select Skills') : (languageTexts?.profile?.edit?.placeholders?.jobTypeFirst || 'Select Job Type first')}
                                        data={skills}
                                        selectedValues={Array.isArray(value) ? value.map(s => s.id) : []}
                                        onSelect={ids => {
                                            const selected = skills.filter(s => ids.includes(s.id));
                                            onChange(selected);
                                        }}
                                        error={errors.skills?.message}
                                        disabled={!watch('job_type') || watch('job_type').length === 0 || loadingSkills}
                                        loading={loadingSkills}
                                        isMandatory={true}
                                        validateField={() => {}}
                                    />
                                )}
                                name="skills"
                                rules={{ required: languageTexts?.profile?.edit?.error?.skills || 'At least one skill is required' }}
                            />
                        </View>
                        {errors.skills && (
                            <Text style={styles.errorText}>{errors.skills.message}</Text>
                        )}

                        <View style={styles.row}>
                            <Text style={styles.label}>
                                {languageTexts?.profile?.edit?.labels?.language || 'Language'}
                            </Text>
                            <Controller
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <SearchableDropdown
                                        placeholder={languageTexts?.profile?.edit?.placeholders?.selectLanguage || 'Select Language'}
                                        data={languageOptions}
                                        selectedValue={value}
                                        onSelect={onChange}
                                        error={errors.language_pref}
                                        disabled={false}
                                        loading={false}
                                    />
                                )}
                                name="language_pref"
                                rules={{ required: languageTexts?.profile?.edit?.error?.language || 'Language preference is required' }}
                                defaultValue={userData?.language_pref || ''}
                            />
                        </View>
                        {errors.language_pref && (
                            <Text style={styles.errorText}>{errors.language_pref.message}</Text>
                        )}

                        <TouchableOpacity
                            style={[styles.button, updating && styles.buttonDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={updating}
                        >
                            {updating ? (
                                <ActivityIndicator color="#3D2A1A" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {languageTexts?.profile?.edit?.save || 'Save Changes'}
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
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pickerContainer: {
        flex: 1,
        // marginLeft: 20,
        marginBottom: 10,
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
    countryPicker: {},
    callingCode: {
        color: '#FFF2E0',
        fontSize: 16,
        fontWeight: '600',
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
        marginLeft: '40%',
        textAlign: 'left',
        paddingLeft: 20,
    },
    dropdownText: {
        color: '#FFF2E0',
        fontSize: 16,
        flex: 1,
    },
    placeholderText: {
        color: '#999',
        fontSize: 16,
        flex: 1,
    },
    disabledInput: {
        opacity: 0.6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    whiteModalContainer: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 20,
        elevation: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    whiteSearchInput: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        color: '#333',
        padding: 10,
        borderRadius: 8,
        fontSize: 16,
    },
    closeButton: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    whiteModalItem: {
        backgroundColor: '#F5F5F5',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    selectedItem: {
        backgroundColor: '#007AFF',
    },
    whiteModalItemText: {
        color: '#333',
        fontSize: 16,
    },
    tickIcon: {
        marginLeft: 10,
    },
    whiteEmptyText: {
        color: '#666',
        textAlign: 'center',
        padding: 20,
    },
});

export default ProfileEdit;