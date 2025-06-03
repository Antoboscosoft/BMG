import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getUserData } from '../api/auth';
import { clearAuthToken } from '../api/axiosInstance';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../language/commondir';

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

    // fetch user data when the component mounts or when passedUserData or updatedUserData changes:
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                let user;
                if (updatedUserData) {
                    user = updatedUserData;
                    // setIsSuperAdmin(user?.role?.name === 'Super Admin');
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
        if (navigation.canGoBack()) {
        //     navigation.goBack();
        // } else {
            navigation.navigate('Dashboard');
        }
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
                        <TouchableOpacity style={styles.backButton} onPress={() => goback()}>
                            <Icon name="arrow-back-ios" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{languageTexts?.profile?.screen?.title || 'Your Profile'}</Text>
                        <View style={{ width: 60 }} />
                    </View>

                    <View style={styles.contentContainer}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={
                                    imageUri
                                        ? { uri: imageUri }
                                        : require('../asserts/images/profile.png')
                                }
                                style={styles.avatar}
                            />
                        </View>

                        {/* Name */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.name || 'Name'}</Text>
                            <Text style={styles.value}>{userData?.name || '-'}</Text>
                        </View>

                        {/* Email */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.email || 'Email'}</Text>
                            <Text style={styles.value}>{userData?.email || '-'}</Text>
                        </View>

                        {/* Mobile */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.mobile || 'Mobile'}</Text>
                            <Text style={styles.value}>
                                {userData?.mobile_code ? `+${userData.mobile_code}` : '-'} {userData?.mobile_number || '-'}
                            </Text>
                        </View>

                        {/* Aadhaar */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.aadhaar || 'Aadhaar'}</Text>
                            <Text style={styles.value}>{userData?.aadhaar_number || '-'}</Text>
                        </View>

                        {/* Date of Birth */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.dob || 'Date of Birth'}</Text>
                            <Text style={styles.value}>{formatDate(userData?.date_of_birth) || '-'}</Text>
                        </View>

                        {/* Age */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.age || 'Age'}</Text>
                            <Text style={styles.value}>{calculateAge(userData?.date_of_birth) || '-'}</Text>
                        </View>

                        {/* Current Address */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.currentAddress || 'Current Address'}</Text>
                            <Text style={styles.value}>{userData?.current_address_line || '-'}</Text>
                        </View>

                        {/* Current Country */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.currentCountry || 'Current Country'}</Text>
                            <Text style={styles.value}>{userData?.current_country?.name || '-'}</Text>
                        </View>

                        {/* Current State */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.currentState || 'Current State'}</Text>
                            <Text style={styles.value}>{userData?.current_state?.name || '-'}</Text>
                        </View>

                        {/* Current District */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.currentDistrict || 'Current District'}</Text>
                            <Text style={styles.value}>{userData?.current_district?.name || '-'}</Text>
                        </View>

                        {/* Native Address */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.nativeAddress || 'Native Address'}</Text>
                            <Text style={styles.value}>{userData?.native_address_line || '-'}</Text>
                        </View>

                        {/* Native Country */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.nativeCountry || 'Native Country'}</Text>
                            <Text style={styles.value}>{userData?.native_country?.name || '-'}</Text>
                        </View>

                        {/* Native State */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.nativeState || 'Native State'}</Text>
                            <Text style={styles.value}>{userData?.native_state?.name || '-'}</Text>
                        </View>

                        {/* Native District */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.nativeDistrict || 'Native District'}</Text>
                            <Text style={styles.value}>{userData?.native_district?.name || '-'}</Text>
                        </View>

                        {/* Language Preference */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.language || 'Language'}</Text>
                            <Text style={styles.value}>
                                {/* {languageTexts?.profile?.screen?.languages?.[userData?.language_pref] || '-'} */}
                                {userData?.language_pref === 'en' ? 'English' :
                                    userData?.language_pref === 'hi' ? 'Hindi' :
                                        userData?.language_pref === 'ta' ? 'Tamil' :
                                            userData?.language_pref === 'kn' ? 'Kannada' : '-'}
                            </Text>
                        </View>

                        {/* Skills */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.skills || 'Skills'}</Text>
                            <Text style={styles.value}>{userData?.skills || '-'}</Text>
                        </View>

                        {/* Job Type */}
                        <View style={styles.row}>
                            <Text style={styles.label}>{languageTexts?.profile?.screen?.labels?.jobType || 'Job Type'}</Text>
                            <Text style={styles.value}>{userData?.job_type || '-'}</Text>
                        </View>

                    </View>
                </ScrollView>
                {/* Add the floating edit button */}
                <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={() => navigation.navigate('ProfileEdit', { userData })}
                >
                    <Icon name="edit" size={24} color="#3D2A1A" />
                </TouchableOpacity>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, width, height },
    scrollContainer: { flexGrow: 1, paddingBottom: 50 },
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
});

export default ProfileScreen;