import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, 
    ImageBackground, ActivityIndicator, Alert, Image, PermissionsAndroid, Linking, Modal, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import CountryPicker from 'react-native-country-picker-modal';
import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-simple-toast';
import { getCountries, getStates, getDistricts, registerUser, extractIdentityData, getJobTypes, getSkillsByJobType } from '../api/auth';
// import RegisterImg from '../asserts/images/splash1.jpg';
import RegisterImg from '../asserts/images/loginbg1.jpg';
import { useRoute } from '@react-navigation/native';
import { placeholderTextColor } from '../context/utils';

// Reusable Searchable Dropdown Component
const SearchableDropdown = ({
    label,
    placeholder,
    data,
    selectedValue,
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
        // Filter data based on search query
        if (searchQuery) {
            const filtered = data.filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredData(filtered);
        } else {
            setFilteredData(data);
        }
    }, [searchQuery, data]);

    const selectedItem = data.find((item) => item.id === selectedValue);

    return (
        <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
                <Text style={styles.label}>{label}</Text>
                {isMandatory && <Text style={styles.mandatoryIndicator}>*</Text>}
            </View>
            {loading ? (
                <ActivityIndicator size="small" color="#007AFF" />
            ) : (
                <>
                    <TouchableOpacity
                        style={[
                            styles.dropdownInput,
                            error && styles.errorInput,
                            disabled && styles.disabledInput,
                        ]}
                        onPress={() => !disabled && setModalVisible(true)}
                        disabled={disabled}
                    >
                        <Text style={selectedValue ? styles.dropdownText : styles.placeholderText}>
                            {selectedItem ? selectedItem.name : placeholder}
                        </Text>
                        <Icon name="chevron-down" size={16} color="#666" />
                    </TouchableOpacity>
                    {error && <Text style={styles.errorText}>{error}</Text>}
                </>
            )}

            {/* Search Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.searchContainer}>
                            <Icon name="search" size={18} color="#666" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={`Search ${label.toLowerCase()}...`}
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
                                        styles.modalItem,
                                        item.id === selectedValue && styles.selectedItem,
                                    ]}
                                    onPress={() => {
                                        onSelect(item.id);
                                        setModalVisible(false);
                                        setSearchQuery('');
                                        validateField(item.id);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.modalItemText}>{item.name}</Text>
                                    {item.id === selectedValue && (
                                        <Icon name="check" size={18} color="#007AFF" style={styles.tickIcon} />
                                    )}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No results found</Text>
                            }
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};


// Reusable Multi-Select Dropdown Component for Skills
const MultiSelectDropdown = ({
    label,
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
    };
    const selectedItems = data.filter((item) => selectedValues.includes(item.id));
    return (
        <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
                <Text style={styles.label}>{label}</Text>
                {/* {isMandatory && <Text style={styles.mandatoryIndicator}>*</Text>} */}
            </View>
            {loading ? (
                <ActivityIndicator size="small" color="#007AFF" />
            ) : (
                <>
                    <TouchableOpacity
                        style={[
                            styles.dropdownInput,
                            // error && styles.errorInput,
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
                        <Icon name="chevron-down" size={16} color="#666" />
                    </TouchableOpacity>
                    {/* {error && <Text style={styles.errorText}>{error}</Text>} */}
                </>
            )}
            {/* Multi-Select Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.searchContainer}>
                            <Icon name="search" size={18} color="#666" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={`Search ${label.toLowerCase()}...`}
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
                                        styles.modalItem,
                                        selectedValues.includes(item.id) && styles.selectedItem,
                                    ]}
                                    onPress={() => handleSelect(item.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {item.icon && (
                                            <Image
                                                source={{ uri: item.icon }}
                                                style={{ width: 22, height: 22, marginRight: 10, borderRadius: 4 }}
                                                resizeMode="contain"
                                            />
                                        )}
                                        <Text style={styles.modalItemText}>{item.name}</Text>
                                    </View>
                                    {/* <Text style={styles.modalItemText}>{item.name}</Text> */}
                                    {selectedValues.includes(item.id) && (
                                        <Icon name="check" size={18} color="#007AFF" style={styles.tickIcon} />
                                    )}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No results found</Text>
                            }
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};









const RegisterScreen = ({ navigation, route }) => {
    const [form, setForm] = useState({
        name: '',
        mobileNumber: '',
        dateOfBirth: '',
        currentAddressLine: '',
        currentDistrictId: null,
        currentStateId: null,
        currentCountryId: null,
        nativeAddressLine: '',
        nativeDistrictId: null,
        nativeStateId: null,
        nativeCountryId: null,
        aadhaarNumber: '',
        skills: [],
        jobType: [],
        languagePref: 'en',
        photo: null,
        identity: null,
    });
    console.log("RegisterScreen form state:", route.params.from);

    // State for image preview
    const [isImagePreviewVisible, setIsImagePreviewVisible] = useState(false);
    const [identityProofImage, setIdentityProofImage] = useState(null);

    const [isImageLoading, setIsImageLoading] = useState(false);

    const [countryCode, setCountryCode] = useState('IN');
    const [callingCode, setCallingCode] = useState('91');
    const [mobileNumber, setMobileNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDOBPicker, setShowDOBPicker] = useState(false);
    const [dob, setDob] = useState(new Date('2000-01-01'));
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [jobTypes, setJobTypes] = useState([]);
    const [skills, setSkills] = useState([]); // State for skills

    const [loadingJobTypes, setLoadingJobTypes] = useState(false);
    const [loadingSkills, setLoadingSkills] = useState(false);

    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [image, setImage] = useState(null);
    const [errors, setErrors] = useState({
        name: '',
        dateOfBirth: '',
        mobileNumber: '',
        currentCountryId: '',
        currentStateId: '',
        currentDistrictId: '',
        jobTypes: '',
        skills: '',
        photo: '',
    });
    const [touched, setTouched] = useState({
        name: false,
        dateOfBirth: false,
        mobileNumber: false,
        currentCountryId: false,
        currentStateId: false,
        currentDistrictId: false,
        nativeAddressLine: false,
        nativeCountryId: false,
        nativeStateId: false,
        nativeDistrictId: false,
        jobTypes: false,
        skills: false,
        photo: false,
    });

    // hide footer:
    const navData = useRoute();
    const showContent = navData.params.from === 'MigrantsList';
    console.log(navData.params.from, "navData");

    // Format Aadhaar number with spaces every 4 digits
    const formatAadhaar = (text) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        let formatted = '';
        for (let i = 0; i < cleaned.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formatted += ' ';
            }
            formatted += cleaned[i];
        }
        return formatted;
    };

    const handleAadhaarChange = (text) => {
        const formatted = formatAadhaar(text);
        setForm({ ...form, aadhaarNumber: formatted.replace(/ /g, '') });
    };

    // Request camera permission for Android
    const requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "Camera Permission",
                    message: "App needs access to your camera",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    // Request storage permission based on Android version
    const requestStoragePermission = async () => {
        try {
            let permission;
            // Check Android version (API 33 = Android 13)
            if (Platform.OS === 'android' && Platform.Version >= 33) {
                permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
            } else {
                permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
            }

            const granted = await PermissionsAndroid.request(permission, {
                title: 'Storage Permission',
                message: 'App needs access to your storage to select images',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            });

            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn('Permission error:', err);
            Toast.show('Failed to get storage permission', Toast.SHORT);
            return false;
        }
    };

    // Check if permission is permanently denied
    const checkPermissionStatus = async () => {
        let permission;
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
        } else {
            permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        }

        const status = await PermissionsAndroid.check(permission);
        return status;
    };

    // Handle country selection
    const handleBack = () => {
        // Get the 'from' parameter from route params
        //   const from = route.params?.from || 'Login';

        //   // Navigate based on the 'from' parameter
        //   if (from === 'MigrantsList') {
        //     navigation.navigate('MigrantsList');
        //   } else {
        //     navigation.navigate('Login');
        //   }

        navigation.navigate(route.params.from || 'Login');
    };

    // Image picker function for profile photo
    const pickImage = async () => {
        try {
            if (Platform.OS === 'android') {
                const hasPermission = await requestStoragePermission();
                if (hasPermission) {
                    const image = await ImagePicker.openPicker({
                        width: 300,
                        height: 300,
                        cropping: true,
                        cropperCircleOverlay: true,
                        compressImageQuality: 1.0,
                    });
                    setImage(image.path);
                    setForm((prev) => ({ ...prev, photo: image.path })); // Update form.photo
                    validateField('photo', image.path); // Validate immediately
                    setTouched((prev) => ({ ...prev, photo: true }));
                } else {
                    const isPermanentlyDenied = !(await checkPermissionStatus());
                    if (isPermanentlyDenied) {
                        Toast.show('Storage permission permanently denied', Toast.SHORT);
                        Alert.alert(
                            'Permission Required',
                            'Storage permission is required to select images. Please enable it in app settings.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Open Settings', onPress: () => Linking.openSettings() },
                            ]
                        );
                    } else {
                        Toast.show('Storage permission denied', Toast.SHORT);
                    }
                }
            } else {
                const image = await ImagePicker.openPicker({
                    width: 300,
                    height: 300,
                    cropping: true,
                    cropperCircleOverlay: true,
                    compressImageQuality: 1.0,
                });
                setImage(image.path);
                setForm((prev) => ({ ...prev, photo: image.path })); // Update form.photo
                validateField('photo', image.path); // Validate immediately
                setTouched((prev) => ({ ...prev, photo: true }));
            }
        } catch (err) {
            console.warn('Error in pickImage:', err);
            Toast.show('An error occurred while picking the image', Toast.SHORT);
        }
    };

    // const handleChange = (field, value) => {
    //     setForm({ ...form, [field]: value });
    // };

    const handleRegister = async () => {
        // Add validation and submission logic here
        if (!validateForm()) return;

        setLoading(true);
        try {
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
                native_country_id: form.nativeCountryId,
                native_state_id: form.nativeStateId,
                native_district_id: form.nativeDistrictId,
                date_of_birth: form.dateOfBirth ? formatDate(form.dateOfBirth) : null,
                aadhaar_number: form.aadhaarNumber || '',
                skills: form.skills.map(id => ({ id })),
                job_type: form.jobType.map(id => ({ id })),
                language_pref: form.languagePref || 'en',
                photo: '', // You'll need to implement image upload separately
                age: form.dateOfBirth ? calculateAge(form.dateOfBirth) : 0,
            };
            const fm = new FormData();
            fm.append("user", JSON.stringify(registrationData));
            console.log("Registration Data:", registrationData);

            // Append profile photo (mandatory)
            // Ensure photo exists before appending
        if (form.photo) {
            fm.append("profile", {
                uri: form.photo,
                type: 'image/jpeg',
                name: form.photo.split('/').pop() || 'profile.jpg',
            })
        } else {
            throw new Error("Profile photo is required");
        }
            if (form.identity) {
                fm.append("identity", {
                    uri: form.identity,
                    type: 'image/jpeg',
                    name: form.identity.split('/').pop() || 'identity_proof.jpg',
                });
            }

        // Add retry logic
        let retryCount = 0;
        const maxRetries = 2;
        let lastError = null;
            // return;
        while (retryCount < maxRetries) {
            try {
                const response = await registerUser(fm);
                if (response.status || response.success === true) {
                    Toast.show('Account created successfully!', Toast.LONG);
                    setTimeout(() => handleBack(), 1000);
                    return; // Success - exit function
                }
                lastError = response.details || 'Registration failed';
            } catch (error) {
                lastError = error;
                console.error(`Attempt ${retryCount + 1} failed:`, error);
                
                // If it's a network error, wait a bit before retrying
                if (error.isNetworkError) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    break; // Non-network error, don't retry
                }
            }
            retryCount++;
        }

        // If we got here, all attempts failed
        throw lastError;

    } catch (error) {
        console.error("Final Registration Error:", error);
        let errorMsg = 'Registration failed. Please try again.';
        
        if (typeof error === 'string') {
            errorMsg = error;
        } else if (error.message) {
            errorMsg = error.message;
        }
        
        Toast.show(errorMsg, Toast.LONG);
    } finally {
        setLoading(false);
    }
};

    // Camera function for profile photo
    const takePhoto = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert("Permission required", "Need camera permission to take photos");
            return;
        }

        try {
            const image = await ImagePicker.openCamera({
                width: 300,
                height: 300,
                cropping: true,
                cropperCircleOverlay: true,
                compressImageQuality: 1.0,
            });
            setImage(image.path);
            setForm((prev) => ({ ...prev, photo: image.path })); // Update form.photo
            validateField('photo', image.path); // Validate immediately
            setTouched((prev) => ({ ...prev, photo: true }));
        } catch (err) {
            Toast.show('Failed to capture image', Toast.SHORT);
        }
    };

    // Show image picker options
    const showImagePickerOptions = () => {
        Alert.alert(
            "Select Profile Photo",
            "Choose an option",
            [
                {
                    text: "Take Photo",
                    onPress: takePhoto
                },
                {
                    text: "Choose from Gallery",
                    onPress: pickImage
                },
                {
                    text: "Cancel",
                    style: "cancel"
                }
            ]
        );
    };

    // Fetch countries on component mount
    useEffect(() => {

        const fetchCountries = async () => {
            setLoadingCountries(true);
            try {
                const response = await getCountries();
                setCountries(response.data || []);
                const countryId = response.data.find(name => name.name === 'India')?.id || '';  
                setForm(prev => ({ ...prev, currentCountryId: countryId }));
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
        // set mobile number
        if (route.params?.mobileCode) {
            setCallingCode(route.params?.mobileCode);
            setMobileNumber(route.params?.mobile);

            handleChange('mobileNumber', route.params?.mobile);
            setErrors(prev => ({ ...prev, mobileNumber: false }));
        }
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

    // Fetch job types: 
    useEffect(() => {
        const fetchJobTypes = async () => {
            setLoadingJobTypes(true);
            try {
                const response = await getJobTypes();
                console.log("Job Types Response:", response);

                // Mock images for job types (replace with actual image URLs from API if available)
                // const jobTypesWithImages = (response.data || []).map((jobType) => ({
                //     ...jobType,
                //     image: `https://example.com/images/job_type_${jobType.id}.png`, // Replace with actual image URL

                // }));

                setJobTypes(response.data || []);
            } catch (error) {
                console.error("Error fetching job types:", error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to load job types',
                });
            } finally {
                setLoadingJobTypes(false);
            }
        };
        fetchJobTypes();
    }, []);

    // Fetch Skills based on selected Job Type
    useEffect(() => {
        const fetchSkills = async () => {
            if (form.jobType.length > 0) {
                setLoadingSkills(true);
                setForm(prev => ({ ...prev, skills: [] })); // Reset skills when job type changes
                try {
                    // Only pass selected job type IDs (as comma-separated string, no spaces)
                    const jobTypeIds = form.jobType.join(',');
                    const response = await getSkillsByJobType(jobTypeIds); // API expects comma-separated ids
                    setSkills(response.data || []);
                } catch (error) {
                    console.error("Error fetching skills:", error);
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Failed to load skills',
                    });
                } finally {
                    setLoadingSkills(false);
                }
            } else {
                setSkills([]);
                setForm(prev => ({ ...prev, skills: [] }));
            }
        };
        fetchSkills();
    }, [form.jobType]);


    const validateField = (field, value) => {
        let error = '';
        switch (field) {
            case 'name':
                if (!value.trim()) error = 'Name is required';
                break;
            case 'mobileNumber':
                if (!value) error = 'Mobile number is required';
                else if (value.length < 10) error = 'Mobile number must be 10 digits';
                break;
            case 'dateOfBirth':
                if (!value) error = 'Date of Birth is required';
                break;
            case 'currentCountryId':
                if (!value) error = 'Country is required';
                break;
            case 'currentStateId':
                if (!value) error = 'State is required';
                break;
            case 'currentDistrictId':
                if (!value) error = 'District is required';
                break;
            // case 'jobType':
            //     if (!value || value.length === 0) error = 'At least one job type is required';
            //     break;
            // case 'skills':
            //     if (!value || value.length === 0) error = 'At least one skill is required';
            //     break;
            case 'photo':
                if (!value) error = 'Profile photo is required';
                break;
            default:
                break;
        }
        setErrors((prev) => ({ ...prev, [field]: error }));
        return error;
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setTouched((prev) => ({ ...prev, [field]: true }));

        // Validate the field on change
        validateField(field, value);
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        validateField(field, form[field]);
    };

    const validateForm = () => {
        const newErrors = {
            name: '',
            dateOfBirth: '',
            mobileNumber: '',
            currentCountryId: '',
            currentStateId: '',
            currentDistrictId: '',
            // jobType: '',
            // skills: '',
            nativeAddressLine: '',
            nativeCountryId: '',
            nativeStateId: '',
            nativeDistrictId: '',
        };

        let isValid = true;

        if (!form.name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        }

        if (!form.mobileNumber) {
            newErrors.mobileNumber = 'Mobile number is required';
            isValid = false;
        } else if (form.mobileNumber.length < 10) {
            newErrors.mobileNumber = 'Mobile number must be 10 digits';
            isValid = false;
        }

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

        // if (form.jobType.length === 0) {
        //     newErrors.jobType = 'At least one job type is required';
        //     isValid = false;
        // }
        // if (form.skills.length === 0) {
        //     newErrors.skills = 'At least one skill is required';
        //     isValid = false;
        // }

        if (!form.photo) {
            newErrors.photo = 'Profile photo is required';
            isValid = false;
        }

        setErrors(newErrors);
        Object.keys(newErrors).forEach((key) => {
            setTouched((prev) => ({ ...prev, [key]: true }));
        });

        return isValid;
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

    // Pick identity proof image from gallery
    const pickIdentityProofImage = async () => {
        try {
            if (Platform.OS === 'android') {
                const hasPermission = await requestStoragePermission();
                if (!hasPermission) {
                    const isPermanentlyDenied = !(await checkPermissionStatus());
                    if (isPermanentlyDenied) {
                        Toast.show('Storage permission permanently denied', Toast.SHORT);
                        Alert.alert(
                            'Permission Required',
                            'Storage permission is required to select images. Please enable it in app settings.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Open Settings', onPress: () => Linking.openSettings() },
                            ]
                        );
                    } else {
                        Toast.show('Storage permission denied', Toast.SHORT);
                    }
                    return;
                }
            }

            const image = await ImagePicker.openPicker({
                width: 300,
                height: 300,
                cropping: true,
                compressImageQuality: 1.0,
            });

            setIdentityProofImage(image.path);
            setForm((prev) => ({ ...prev, identity: image.path }));
            await handleIdentityProofUpload(image);
        } catch (err) {
            Toast.show('Failed to pick identity proof image', Toast.SHORT);
        }
    };

    // Take identity proof photo with camera
    const takeIdentityProofPhoto = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('Permission required', 'Need camera permission to take photos');
            return;
        }

        try {
            const image = await ImagePicker.openCamera({
                width: 300,
                height: 300,
                cropping: true,
                // cropping: false,
                compressImageQuality: 1.0,
            });

            setIdentityProofImage(image.path);
            setForm((prev) => ({ ...prev, identity: image.path }));
            await handleIdentityProofUpload(image);
        } catch (err) {
            Toast.show('Failed to capture identity proof image', Toast.SHORT);
        }
    };

    // Handle identity proof upload and API call
    const handleIdentityProofUpload = async (image) => {
        try {
            const response = await extractIdentityData(image);
            Toast.show('Identity proof processed successfully', Toast.SHORT);

            // Map API response to form fields
            const { data } = response;
            if (data) {
                setForm((prev) => ({
                    ...prev,
                    name: data.name || prev.name,
                    mobileNumber: data.mobile_number || prev.mobileNumber,
                    dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth).toISOString() : prev.dateOfBirth,
                    aadhaarNumber: data.aadhaar_number ? data.aadhaar_number.replace(/\s/g, '') : prev.aadhaarNumber,
                    nativeAddressLine: data.native_address_line || prev.nativeAddressLine,
                    nativeCountryId: data.native_country_id ? data.native_country_id : prev.nativeCountryId || null,
                    nativeStateId: data.native_state_id ? data.native_state_id : prev.nativeStateId || null,
                    nativeDistrictId: data.native_district_id ? data.native_district_id : prev.nativeDistrictId || null,
                }));

                // Update callingCode and mobileNumber state for the mobile input
                if (data.mobile_code) {
                    setCallingCode(data.mobile_code);
                }
                if (data.mobile_number) {
                    setMobileNumber(data.mobile_number);
                }

                // Re-validate the form after updating fields
                validateField('name', data.name || form.name);
                validateField('mobileNumber', data.mobile_number || form.mobileNumber);
                validateField('dateOfBirth', data.date_of_birth ? new Date(data.date_of_birth).toISOString() : form.dateOfBirth);
                validateField('currentCountryId', data.native_country_id ? String(data.native_country_id) : form.currentCountryId);
                validateField('currentStateId', data.native_state_id ? String(data.native_state_id) : form.currentStateId);
                validateField('currentDistrictId', data.native_district_id ? String(data.native_district_id) : form.currentDistrictId);

                // Mark fields as touched to show validation errors if any
                setTouched((prev) => ({
                    ...prev,
                    name: true,
                    mobileNumber: true,
                    dateOfBirth: true,
                    currentCountryId: true,
                    currentStateId: true,
                    currentDistrictId: true,
                }));

                Toast.show('Form fields updated with identity proof data', Toast.LONG);
            } else {
                Toast.show('No data received from identity proof', Toast.LONG);
            }

            // Toast.show(JSON.stringify(response), Toast.LONG); // Show response data
        } catch (error) {
            console.error('Identity Proof API Error:', error);
            Toast.show(error.message || 'Failed to process identity proof', Toast.LONG);
        }
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
                        <View style={styles.header}>
                            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                                <Icon name="arrow-left" size={26} color="#FFF" />
                            </TouchableOpacity>
                            <Text style={styles.title}>
                                {/* {languageTexts?.register?.title || "Register"} */}
                                Register
                            </Text>
                            <View style={{ width: 60 }} />
                        </View>

                        {/* Profile Photo Upload */}
                        <View style={styles.inputContainer}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.label}>Profile Photo</Text>
                                <Text style={styles.mandatoryIndicator}>*</Text>
                            </View>
                            <View style={styles.photoContainer}>
                                <TouchableOpacity onPress={showImagePickerOptions}>
                                    {image ? (
                                        <Image source={{ uri: image }} style={styles.profileImage} />
                                    ) : (
                                        <View style={[styles.profilePlaceholder, errors.photo && touched.photo && styles.errorInput]}>
                                            <Icon name="camera" size={30} color="#666" />
                                            <Text style={styles.photoText}>Add Photo</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                            {touched.photo && errors.photo && <Text style={styles.errorText}>{errors.photo}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.label}>Identity Proof Upload</Text>
                            </View>
                            <View style={styles.fileUploadContainer}>
                                {identityProofImage ? (
                                    <View style={styles.filePreviewContainer}>
                                        <TouchableOpacity
                                            onPress={() => setIsImagePreviewVisible(true)}
                                            activeOpacity={0.8}
                                            style={styles.imageWrapper}
                                            accessibilityLabel="View identity proof image"
                                            accessibilityRole="imagebutton"
                                        >
                                            <Image source={{ uri: identityProofImage }} style={styles.identityProofImage} />
                                            <TouchableOpacity
                                                style={styles.cancelButton}
                                                onPress={() => {
                                                    setIdentityProofImage(null);
                                                    setForm((prev) => ({ ...prev, identity: null }));
                                                }}
                                                activeOpacity={0.8}
                                                accessibilityLabel="Remove identity proof image"
                                                accessibilityRole="button"
                                            >
                                                <Icon name="times-circle" size={20} color="#FF3B30" />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                        <View style={styles.iconContainer}>
                                            <TouchableOpacity
                                                onPress={pickIdentityProofImage}
                                                disabled={isImageLoading}
                                                style={styles.iconButton}
                                                accessibilityLabel="Choose identity proof from gallery"
                                                accessibilityRole="button"
                                            >
                                                <Icon name="image" size={20} color="#666" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={takeIdentityProofPhoto}
                                                disabled={isImageLoading}
                                                style={styles.iconButton}
                                                accessibilityLabel="Take identity proof photo"
                                                accessibilityRole="button"
                                            >
                                                <Icon name="camera" size={20} color="#666" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={[styles.fileInputContainer, isImageLoading && styles.disabledInput]}>
                                        <Icon name="upload" size={20} color="#666" style={styles.uploadIcon} />
                                        <Text style={styles.fileInputText}>Identity Proof</Text>
                                        <View style={styles.iconContainer}>
                                            <TouchableOpacity
                                                onPress={pickIdentityProofImage}
                                                disabled={isImageLoading}
                                                style={styles.iconButton}
                                                accessibilityLabel="Choose identity proof from gallery"
                                                accessibilityRole="button"
                                            >
                                                <Icon name="image" size={24} color="black" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={takeIdentityProofPhoto}
                                                disabled={isImageLoading}
                                                style={styles.iconButton}
                                                accessibilityLabel="Take identity proof photo"
                                                accessibilityRole="button"
                                            >
                                                <Icon name="camera" size={24} color="black" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                                {isImageLoading && (
                                    <ActivityIndicator size="small" color="#007AFF" style={styles.loadingIndicator} />
                                )}
                            </View>

                            {/* Image Preview Modal */}
                            <Modal
                                animationType="fade"
                                transparent={true}
                                visible={isImagePreviewVisible}
                                onRequestClose={() => setIsImagePreviewVisible(false)}
                            >
                                <View style={styles.modalOverlayPreview}>
                                    <View style={styles.imagePreviewContainer}>
                                        <TouchableOpacity
                                            style={styles.closePreviewButton}
                                            onPress={() => setIsImagePreviewVisible(false)}
                                            accessibilityLabel="Close image preview"
                                            accessibilityRole="button"
                                        >
                                            <Icon name="times" size={24} color="#fff" />
                                        </TouchableOpacity>
                                        <Image
                                            source={{ uri: identityProofImage }}
                                            style={styles.previewImage}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </View>
                            </Modal>
                        </View>

                        {/* Full Name */}
                        <View style={styles.inputContainer}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.label}>Full Name</Text>
                                <Text style={styles.mandatoryIndicator}>*</Text>
                            </View>
                            <TextInput
                                style={[styles.input, errors.name && styles.errorInput]}
                                placeholder="Enter your full name"
                                placeholderTextColor={placeholderTextColor}
                                value={form.name}
                                onChangeText={(text) => {
                                    handleChange('name', text);
                                    // setErrors(prev => ({ ...prev, name: false }));
                                }}
                                onBlur={() => handleBlur('name')}
                            />
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                        </View>

                        {/* Mobile Number */}
                        <View style={styles.inputContainer}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.label}>Mobile Number</Text>
                                <Text style={styles.mandatoryIndicator}>*</Text>
                            </View>
                            <View style={[styles.mobileContainer, errors.mobileNumber && styles.errorInput]}>
                                <CountryPicker
                                    countryCode={countryCode}
                                    withCallingCode={true}
                                    withFlag={true}
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
                                    placeholder="Enter mobile number"
                                    keyboardType="number-pad"
                                    maxLength={15}
                                    value={mobileNumber}
                                    onChangeText={(text) => {
                                        const cleaned = text.replace(/[^0-9]/g, '');
                                        setMobileNumber(cleaned);
                                        handleChange('mobileNumber', cleaned);
                                        setErrors(prev => ({ ...prev, mobileNumber: false }));
                                    }}
                                    onBlur={() => handleBlur('mobileNumber')}
                                />
                            </View>
                            {touched.mobileNumber && errors.mobileNumber && (
                                <Text style={styles.errorText}>{errors.mobileNumber}</Text>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.labelContainer}>
                                <Text style={styles.label}>Date of Birth</Text>
                                <Text style={styles.mandatoryIndicator}>*</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.input, errors.dateOfBirth && styles.errorInput, styles.dateInputContainer]}
                                onPress={() => setShowDOBPicker(true)}
                            >
                                <Icon name="calendar" size={20} color="#666" style={styles.icon} />
                                <Text style={!form.dateOfBirth ? styles.placeholderText : styles.dateText}>
                                    {form.dateOfBirth ?
                                        new Date(form.dateOfBirth).toLocaleDateString() :
                                        'Select Date of Birth'
                                    }
                                </Text>
                            </TouchableOpacity>
                            {touched.dateOfBirth && errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
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
                                        // setErrors(prev => ({ ...prev, dateOfBirth: '' }));
                                        setTouched((prev) => ({ ...prev, dateOfBirth: true }));
                                    }
                                }}
                                maximumDate={new Date()}
                            />
                        )}
                        
                        {/* Aadhaar Number */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Aadhaar Number (Eshram & Abha Card)</Text>
                            <TextInput
                                style={[styles.input, styles.aadhaarInput]}
                                placeholder="Enter 12-digit Aadhaar"
                                placeholderTextColor={placeholderTextColor}
                                keyboardType="number-pad"
                                value={form.aadhaarNumber ? formatAadhaar(form.aadhaarNumber) : ''}
                                onChangeText={handleAadhaarChange}
                                maxLength={14}
                            />
                        </View>

                        {/* Current Address */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Current Address Line</Text>
                            <TextInput
                                style={styles.multilineInput}
                                placeholder="Enter your current address..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={5}
                                maxHeight={100}
                                textAlignVertical="top"
                                value={form.currentAddressLine}
                                onChangeText={(text) => handleChange('currentAddressLine', text)}
                                blurOnSubmit={true}
                                returnKeyType="done"
                            />
                        </View>

                        {/* Country */}
                        <SearchableDropdown
                            label="Current Country"
                            placeholder="Select Country"
                            data={countries}
                            selectedValue={form.currentCountryId}
                            onSelect={(value) => handleChange('currentCountryId', value)}
                            error={touched.currentCountryId && errors.currentCountryId}
                            disabled={false}
                            loading={loadingCountries}
                            isMandatory={true}
                            validateField={(value) => validateField('currentCountryId', value)}
                        />

                        {/* State */}
                        <SearchableDropdown
                            label="Current State"
                            placeholder={form.currentCountryId ? 'Select State' : 'Select Country first'}
                            data={states}
                            selectedValue={form.currentStateId}
                            onSelect={(value) => handleChange('currentStateId', value)}
                            error={touched.currentStateId && errors.currentStateId}
                            disabled={!form.currentCountryId}
                            loading={loadingStates}
                            isMandatory={true}
                            validateField={(value) => validateField('currentStateId', value)}
                        />

                        {/* District */}
                        <SearchableDropdown
                            label="Current District"
                            placeholder={form.currentStateId ? 'Select District' : 'Select State first'}
                            data={districts}
                            selectedValue={form.currentDistrictId}
                            onSelect={(value) => handleChange('currentDistrictId', value)}
                            error={touched.currentDistrictId && errors.currentDistrictId}
                            disabled={!form.currentStateId}
                            loading={loadingDistricts}
                            isMandatory={true}
                            validateField={(value) => validateField('currentDistrictId', value)}
                        />

                        {/* Native Address */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Native Address Line</Text>
                            <TextInput
                                style={styles.multilineInput}
                                placeholder="Enter your native address..."
                                placeholderTextColor="#999"
                                // multiline
                                numberOfLines={5}
                                maxHeight={100}
                                textAlignVertical="top"
                                value={form.nativeAddressLine}
                                onChangeText={(text) => handleChange('nativeAddressLine', text)}
                                blurOnSubmit={true}
                                returnKeyType="done"
                            />
                        </View>

                        {/* Native Country */}
                        <SearchableDropdown
                            label="Native Country"
                            placeholder="Select Native Country"
                            data={countries}
                            selectedValue={form.nativeCountryId}
                            onSelect={(value) => handleChange('nativeCountryId', value)}
                            error={touched.nativeCountryId && errors.nativeCountryId}
                            disabled={false}
                            loading={loadingCountries}
                            // isMandatory={true}
                            validateField={(value) => validateField('nativeCountryId', value)}
                        />

                        {/* Native State */}
                        <SearchableDropdown
                            label="Native State"
                            placeholder={form.nativeCountryId ? 'Select Native State' : 'Select Native Country first'}
                            data={states}
                            selectedValue={form.nativeStateId}
                            onSelect={(value) => handleChange('nativeStateId', value)}
                            error={touched.nativeStateId && errors.nativeStateId}
                            disabled={!form.nativeCountryId}
                            loading={loadingStates}
                            // isMandatory={true}
                            validateField={(value) => validateField('nativeStateId', value)}
                        />

                        {/* Native District */}
                        <SearchableDropdown
                            label="Native District"
                            placeholder={form.nativeStateId ? 'Select Native District' : 'Select Native State first'}
                            data={districts}
                            selectedValue={form.nativeDistrictId}
                            onSelect={(value) => handleChange('nativeDistrictId', value)}
                            error={touched.nativeDistrictId && errors.nativeDistrictId}
                            disabled={!form.nativeStateId}
                            loading={loadingDistricts}
                            // isMandatory={true}
                            validateField={(value) => validateField('nativeDistrictId', value)}
                        />

                        {/* Job Type */}
                        <MultiSelectDropdown
                            label="Job Type"
                            placeholder="Select Job Types"
                            data={jobTypes}
                            selectedValues={form.jobType}
                            onSelect={(values) => {
                                handleChange('jobType', values);
                                setTouched((prev) => ({ ...prev, jobTypes: true }));
                            }}
                            // error={touched.jobType && errors.jobType} //
                            disabled={false}
                            loading={loadingJobTypes}
                            isMandatory={true}
                            validateField={(values) => validateField('jobType', values)}
                            showImage={true} // Enable image display
                        />
                        {/* Skills */}
                        <MultiSelectDropdown
                            label="Skills"
                            placeholder={form.jobType.length > 0 ? 'Select Skills' : 'Select Job Type first'}
                            data={skills}
                            selectedValues={form.skills}
                            onSelect={(values) => handleChange('skills', values)}
                            // error={touched.skills && errors.skills}
                            disabled={form.jobType.length === 0}
                            loading={loadingSkills}
                            isMandatory={true}
                            validateField={(values) => validateField('skills', values)}
                        />

                        {/* Language Preference */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Language Preference</Text>
                            <View style={[styles.pickerContainer, styles.languagePicker]}>
                                <Icon name="language" size={20} color="#666" style={styles.icon} />
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
                            </View>
                        </View>

                        {/* Register Button */}
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
{ !showContent &&
                        <Text style={styles.registerText}>
                            Already have an account?{' '}
                            <Text onPress={() => navigation.navigate('Login')} style={styles.registerBold}>
                                Login
                            </Text>
                        </Text>}
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
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    backButton: {
        padding: 10,
        backgroundColor: "#d0a577",
        borderRadius: 25,
    },
    identityProofImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#007AFF',
        alignSelf: 'center',
    },
    identityProofPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ddd',
        alignSelf: 'center',
    },

    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        padding: 24,
        margin: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        color: '#333',
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: 8,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    profilePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ddd',
    },
    photoText: {
        marginTop: 8,
        color: '#666',
        fontSize: 14,
    },
    inputContainer: {
        marginBottom: 20,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
        fontSize: 16,
    },
    mandatoryIndicator: {
        color: '#FF3B30',
        fontSize: 16,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    dropdownInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    dropdownText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    disabledInput: {
        backgroundColor: '#f5f5f5',
        borderColor: '#e0e0e0',
    },
    aadhaarInput: {
        letterSpacing: 2,
        fontSize: 16,
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    icon: {
        marginRight: 12,
    },
    dateText: {
        flex: 1,
        color: '#333',
        fontSize: 16,
    },
    multilineInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        textAlignVertical: 'top',
        // minHeight: 100,
        // maxHeight: 200,
    },
    mobileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
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
    pickerContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
    },
    languagePicker: {
        paddingLeft: 16,
    },
    picker: {
        flex: 1,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 10,
        marginTop: 24,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600',
    },
    registerText: {
        marginTop: 16,
        textAlign: 'center',
        fontSize: 14,
        color: '#666',
    },
    registerBold: {
        fontWeight: '700',
        color: '#007AFF',
    },
    disabledButton: {
        opacity: 0.6,
    },
    errorInput: {
        borderColor: '#FF3B30',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 4,
    },
    placeholderText: {
        color: '#999',
        flex: 1,
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 24,
        borderRadius: 12,
        maxHeight: '70%',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    closeButton: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
        paddingHorizontal: 8,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    modalItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    dropdownItemImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 12,
    },
    selectedItem: {
        backgroundColor: '#E6F0FF',
    },
    modalItemText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    tickIcon: {
        marginLeft: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 16,
        padding: 20,
        fontStyle: 'italic',
    },

    fileUploadContainer: {
        marginTop: 10,
    },
    fileInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#f5f5f5",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    fileInputButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    fileInputText: {
        flex: 1,
        fontSize: 16,
        color: '#666',
    },
    uploadIcon: {
        marginRight: 12,
    },
    iconContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconButton: {
        padding: 8,
        marginLeft: 8,
    },
    filePreviewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 8,
    },
    identityProofImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#007AFF',
        marginRight: 12,
    },
    chooseAgainButton: {
        backgroundColor: '#007AFF',
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    chooseAgainButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    cancelButton: {
        position: "absolute",
        top: -8,
        right: -8,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 2,
    },
    loadingIndicator: {
        marginTop: 8,
    },
    disabledInput: {
        opacity: 0.6,
    },
    modalOverlayPreview: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        justifyContent: "center",
        alignItems: "center",
    },
    imagePreviewContainer: {
        width: "90%",
        height: "80%",
        position: "relative",
    },
    previewImage: {
        width: "100%",
        height: "100%",
    },
    closePreviewButton: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 15,
        padding: 8,
        zIndex: 1,
    },
});

export default RegisterScreen;