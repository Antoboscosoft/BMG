import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { changePassword, getUserData } from '../api/auth';
import { clearAuthToken } from '../api/axiosInstance';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../language/commondir';
import { useForm, Controller } from 'react-hook-form';

const { width, height } = Dimensions.get('window');

function calculateAge(dob) {
    if (!dob) return '-';
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
    if (!date) return '-';
    const d = new Date(date);
    return `${d.getDate()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
}

function ProfileScreen({ navigation, route }) {
    const { languageTexts } = useLanguage();
    const { userData: passedUserData, updatedUserData, updateTimestamp } = route.params || {};
    const [userData, setUserData] = useState(null);
    const [imageUri, setImageUri] = useState(null);
    const [loading, setLoading] = useState(true);
    const [countryCode, setCountryCode] = useState('IN');
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const [showPassword, setShowPassword] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false
    });
    const [changePasswordError, setChangePasswordError] = useState('');
console.log("route.params: >>> ", passedUserData, );
    const createdOn = passedUserData.created_on;
    const createdBy = passedUserData?.creator?.name || "-";
    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
        reset
    } = useForm({
        defaultValues: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    const newPassword = watch('newPassword');

    const toggleShowPassword = (field) => {
        setShowPassword({
            ...showPassword,
            [field]: !showPassword[field]
        });
    };
// console.log("updatedUserData: >>> ", route.params.from === 'MigrantsList');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                let user;
                if (updatedUserData) {
                    user = updatedUserData;
                } else if (passedUserData) {
                    user = passedUserData;
                    setIsSuperAdmin(false);
                } else {
                    const response = await getUserData();
                    if (response.status && response.data) {
                        user = response.data;
                        setIsSuperAdmin(response.data?.role?.name === 'Super Admin');
                    }
                }

                setUserData(user);
                setImageUri(user?.photo || null);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                Toast.show({
                    type: 'error',
                    text1: languageTexts?.common?.error || 'Error',
                    text2: error.message || (languageTexts?.profile?.screen?.error?.load || 'Failed to load user data'),
                });
                if (error.status === 401) {
                    await clearAuthToken();
                    navigation.replace('Login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [passedUserData, updatedUserData, navigation]);

    const handlePasswordChange = async (data) => {
        setChangePasswordError(''); // Clear previous error
        try {
            const response = await changePassword({
                old_password: data.oldPassword,
                new_password: data.newPassword
            });
            console.log("Change Password Response:", response);

            if (response.status) {
                Alert.alert(
                    languageTexts?.changePassword?.success || 'Success',
                    languageTexts?.changePassword?.passwordChanged || 'Password changed successfully',
                    [{ text: languageTexts?.common?.ok || 'OK' }]
                );
                setIsPasswordModalVisible(false);
                reset();
            } else if (response.details) {
                setChangePasswordError(response.details);
            }
        } catch (error) {
            setChangePasswordError(error.message || languageTexts?.changePassword?.changeFailed || 'Failed to change password');
            Toast.show({
                type: 'error',
                text1: languageTexts?.changePassword?.error || 'Error',
                text2: error.message || (languageTexts?.changePassword?.changeFailed || 'Failed to change password'),
            });
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <LinearGradient colors={['#5e3b15', '#b06a2c']} style={styles.loadingBackground}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>{languageTexts?.profile?.screen?.loading || 'Loading your data...'}</Text>
                </LinearGradient>
            </View>
        );
    }

    const goback = () => {
        console.log("route.params.from: >>> ", route.params);
        
        if (navigation.canGoBack()) {
            route.params.from === 'MigrantsList' ? 
            navigation.navigate('MigrantsList') :
            navigation.navigate('Dashboard');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : -50}
        >
            <LinearGradient colors={['#5e3b15', '#b06a2c']} style={styles.background}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.backButton} onPress={() => goback()}>
                            <Icon name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{languageTexts?.profile?.screen?.title || 'Your Profile'}</Text>
                        <View style={{ width: 60 }} />
                    </View>

                    <View style={styles.contentContainer}>
                        <View style={styles.avatarContainer}>
                            <TouchableOpacity onPress={() => setIsImageModalVisible(true)}>
                                <Image
                                    source={
                                        imageUri
                                            ? { uri: imageUri }
                                            : require('../asserts/images/profile.png')
                                    }
                                    style={styles.avatar}
                                />
                            </TouchableOpacity>
                        </View>

                        {userData?.role?.name === 'Staff' && !isSuperAdmin &&
                            <TouchableOpacity style={styles.hyperlink} onPress={() => setIsPasswordModalVisible(true)}>
                            <Text style={styles.hyperlinkText}>
                                {languageTexts?.changePassword?.openModalLink || 'Change Password (Click to open)'}
                            </Text>
                        </TouchableOpacity>}

                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.name || 'Name'}</Text>
                            <Text style={styles.value}>{userData?.name || '-'}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.email || 'Email'}</Text>
                            <Text style={styles.value}>{userData?.email || '-'}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.mobile || 'Mobile'}</Text>
                            <Text style={styles.value}>
                                {userData?.mobile_code ? `+${userData.mobile_code}` : '-'} {userData?.mobile_number || '-'}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.aadhaar || 'Aadhaar'}</Text>
                            <Text style={styles.value}>{userData?.aadhaar_number || '-'}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.dob || 'Date of Birth'}</Text>
                            <Text style={styles.value}>{formatDate(userData?.date_of_birth) || '-'}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.age || 'Age'}</Text>
                            <Text style={styles.value}>{calculateAge(userData?.date_of_birth) || '-'}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.currentAddress || 'Current Address'}</Text>
                            <Text style={styles.value}>{userData?.current_address_line || '-'}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.currentCountry || 'Current Country'}</Text>
                            <Text style={styles.value}>{userData?.current_country?.name || '-'}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.currentState || 'Current State'}</Text>
                            <Text style={styles.value}>{userData?.current_state?.name || '-'}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.currentDistrict || 'Current District'}</Text>
                            <Text style={styles.value}>{userData?.current_district?.name || '-'}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.nativeAddress || 'Native Address'}</Text>
                            <Text style={styles.value}>{userData?.native_address_line || '-'}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.nativeCountry || 'Native Country'}</Text>
                            <Text style={styles.value}>{userData?.native_country?.name || '-'}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.nativeState || 'Native State'}</Text>
                            <Text style={styles.value}>{userData?.native_state?.name || '-'}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.nativeDistrict || 'Native District'}</Text>
                            <Text style={styles.value}>{userData?.native_district?.name || '-'}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.jobType || 'Job Type'}</Text>
                            <Text style={styles.value}>{
                                Array.isArray(userData?.job_type)
                                    ? userData.job_type.map(j => j.name).join(', ')
                                    : userData?.job_type || '-'
                            }</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.skills || 'Skills'}</Text>
                            <Text style={styles.value}>{
                                Array.isArray(userData?.skills)
                                    ? userData.skills.map(s => s.name).join(', ')
                                    : userData?.skills || '-'
                            }</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.language || 'Language'}</Text>
                            <Text style={styles.value}>
                                {userData?.language_pref === 'en' ? 'English' :
                                    userData?.language_pref === 'hi' ? 'Hindi' :
                                        userData?.language_pref === 'ta' ? 'Tamil' :
                                            userData?.language_pref === 'kn' ? 'Kannada' : '-'}
                            </Text>
                        </View>

                        {/* created on */}
                        <View style={styles.row}>   
                            <Text style={styles.label}>{languageTexts?.migrantsList?.created_on || 'Created On'}</Text>
                            <Text style={styles.value}>{formatDate(createdOn) || '-'}</Text>
                        </View>

                        {/* created by */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.migrantsList?.created_by || 'Created By'}</Text>
                            <Text style={styles.value}>{createdBy || '-'}</Text>
                        </View>
                        
                    </View>
                </ScrollView>
{/* {console.log("route.params.from: >>>1 ", route.params.from)}; */}

                <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={() => navigation.navigate('ProfileEdit', { userData, from: route.params?.from || 'Profile' })}
                >
                    <Icon name="edit" size={24} color="#3D2A1A" />
                </TouchableOpacity>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isPasswordModalVisible}
                    onRequestClose={() => {
                        setIsPasswordModalVisible(false);
                        reset();
                        setChangePasswordError('');
                    }}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {languageTexts?.changePassword?.title || 'Change Password'}
                            </Text>
                            {changePasswordError ? (
                                <Text style={[styles.errorText, { textAlign: 'center', marginBottom: 10 }]}>
                                    {changePasswordError}
                                </Text>
                            ) : null}

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>
                                    {languageTexts?.changePassword?.oldPassword || 'Old Password'}
                                </Text>
                                <Controller
                                    control={control}
                                    name="oldPassword"
                                    rules={{
                                        required: languageTexts?.changePassword?.oldPasswordRequired || 'Old password is required',
                                    }}
                                    render={({ field: { onChange, value } }) => (
                                        <View style={[styles.passwordInputWrapper, errors.oldPassword && styles.invalidInput]}>
                                            <TextInput
                                                style={styles.input}
                                                secureTextEntry={!showPassword.oldPassword}
                                                value={value}
                                                onChangeText={onChange}
                                                placeholder={languageTexts?.changePassword?.oldPasswordPlaceholder || 'Enter old password'}
                                                placeholderTextColor="#999"
                                            />
                                            <TouchableOpacity
                                                style={styles.eyeIcon}
                                                onPress={() => toggleShowPassword('oldPassword')}
                                            >
                                                <Icon
                                                    name={showPassword.oldPassword ? "visibility-off" : "visibility"}
                                                    size={20}
                                                    color="#666"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                                {errors.oldPassword && (
                                    <Text style={styles.errorText}>{errors.oldPassword.message}</Text>
                                )}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>
                                    {languageTexts?.changePassword?.newPassword || 'New Password'}
                                </Text>
                                <Controller
                                    control={control}
                                    name="newPassword"
                                    rules={{
                                        required: languageTexts?.changePassword?.newPasswordRequired || 'New password is required',
                                        minLength: {
                                            value: 8,
                                            message: languageTexts?.changePassword?.passwordLength || 'Password must be at least 8 characters long',
                                        },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                            message: languageTexts?.changePassword?.passwordComplexity || 'Password must include uppercase, lowercase, number, and special character',
                                        }
                                    }}
                                    render={({ field: { onChange, value } }) => (
                                        <View style={[styles.passwordInputWrapper, errors.newPassword && styles.invalidInput]}>
                                            <TextInput
                                                style={styles.input}
                                                secureTextEntry={!showPassword.newPassword}
                                                value={value}
                                                onChangeText={onChange}
                                                placeholder={languageTexts?.changePassword?.newPasswordPlaceholder || 'Enter new password'}
                                                placeholderTextColor="#999"
                                            />
                                            <TouchableOpacity
                                                style={styles.eyeIcon}
                                                onPress={() => toggleShowPassword('newPassword')}
                                            >
                                                <Icon
                                                    name={showPassword.newPassword ? "visibility-off" : "visibility"}
                                                    size={20}
                                                    color="#666"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                                {errors.newPassword && (
                                    <Text style={styles.errorText}>{errors.newPassword.message}</Text>
                                )}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>
                                    {languageTexts?.changePassword?.confirmPassword || 'Confirm Password'}
                                </Text>
                                <Controller
                                    control={control}
                                    name="confirmPassword"
                                    rules={{
                                        required: languageTexts?.changePassword?.confirmPasswordRequired || 'Please confirm your new password',
                                        validate: value =>
                                            value === newPassword || (languageTexts?.changePassword?.passwordMismatch || 'New passwords do not match')
                                    }}
                                    render={({ field: { onChange, value } }) => (
                                        <View style={[styles.passwordInputWrapper, errors.confirmPassword && styles.invalidInput]}>
                                            <TextInput
                                                style={styles.input}
                                                secureTextEntry={!showPassword.confirmPassword}
                                                value={value}
                                                onChangeText={onChange}
                                                placeholder={languageTexts?.changePassword?.confirmPasswordPlaceholder || 'Confirm new password'}
                                                placeholderTextColor="#999"
                                            />
                                            <TouchableOpacity
                                                style={styles.eyeIcon}
                                                onPress={() => toggleShowPassword('confirmPassword')}
                                            >
                                                <Icon
                                                    name={showPassword.confirmPassword ? "visibility-off" : "visibility"}
                                                    size={20}
                                                    color="#666"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                                {errors.confirmPassword && (
                                    <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
                                )}
                            </View>

                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => {
                                        setIsPasswordModalVisible(false);
                                        reset();
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        {languageTexts?.common?.cancel || 'Cancel'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.submitButton]}
                                    onPress={handleSubmit(handlePasswordChange)}
                                >
                                    <Text style={styles.submitButtonText}>
                                        {languageTexts?.changePassword?.submit || 'Submit'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Image Modal */}
                <Modal
                    visible={isImageModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setIsImageModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.imageModalOverlay}
                        activeOpacity={1}
                        onPressOut={() => setIsImageModalVisible(false)}
                    >
                        <View style={styles.imageModalContent}>
                            <Image
                                source={imageUri ? { uri: imageUri } : require('../asserts/images/profile.png')}
                                style={styles.imageModalImage}
                                resizeMode="contain"
                            />
                            <TouchableOpacity
                                style={styles.imageModalClose}
                                onPress={() => setIsImageModalVisible(false)}
                            >
                                <Icon name="close" size={30} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, width, height },
    scrollContainer: { flexGrow: 1, paddingBottom: 100 },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 20,
        width: '100%',
    },
    backButton: {
        padding: 10,
        backgroundColor: 'rgba(255, 242, 224, 0.2)',
        borderRadius: 80,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFECD2',
        textAlign: 'center',
        flex: 1,
        paddingHorizontal: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
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
    floatingButton: {
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 30,
        right: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#3D2A1A',
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 15,
    },
    inputLabel: {
        marginBottom: 5,
        color: '#3D2A1A',
        fontSize: 16,
    },
    passwordInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 5,
    },
    input: {
        flex: 1,
        padding: 10,
        color: '#000',
    },
    eyeIcon: {
        padding: 10,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        padding: 12,
        borderRadius: 5,
        width: '48%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#E0E0E0',
    },
    cancelButtonText: {
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#5e3b15',
    },
    submitButtonText: {
        color: '#FFF',
    },
    invalidInput: {
        borderColor: '#ff4444',
    },
    errorText: {
        color: '#ff4444',
        fontSize: 12,
        marginTop: 5,
    },
    hyperlink: {
        color: '#4DA8FF', // Brighter blue for better visibility
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
        alignSelf: 'flex-end',
          textAlign: 'right',
    },
    hyperlinkText: {
        color: '#25dac7', // Brighter blue for better visibility
        // textDecorationLine: 'underline',
        textAlign: 'center',
        marginVertical: 10,
        fontWeight: '600',
        fontSize: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.5)', // Add shadow for contrast
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slight background for emphasis
    },
    imageModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageModalContent: {
        position: 'relative',
        width: '90%',
        height: '60%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageModalImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    imageModalClose: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 5,
    },
});

export default ProfileScreen;