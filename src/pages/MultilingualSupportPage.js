import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useLanguage } from '../language/commondir';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { getSupportedLanguages, updateUserLanguage } from '../api/auth';

function MultilingualSupportPage({ navigation }) {
    const { language, changeLanguage, languageTexts } = useLanguage();
    const [fadeAnim] = useState(new Animated.Value(0));
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    // Map API values to language codes and native names
    const languageMapping = {
        'ENGLISH': { code: 'EN', nativeName: 'English' },
        'HINDI': { code: 'HI', nativeName: 'हिन्दी' },
        'TAMIL': { code: 'TA', nativeName: 'தமிழ்' },
    };

    // Map language codes to English names for selection
    const languageCodeToEnglishName = {
        'EN': 'English',
        'HI': 'Hindi',
        'TA': 'Tamil',
    };

    // Set initial selected language based on current language
    const [selectedLanguage, setSelectedLanguage] = useState(
        languageCodeToEnglishName[language] || 'English'
    );

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                setLoading(true);
                const response = await getSupportedLanguages();
                const formattedLanguages = response.data.map(lang => ({
                    englishName: lang.label,
                    nativeName: languageMapping[lang.value]?.nativeName || lang.label,
                    code: languageMapping[lang.value]?.code || lang.value,
                    value: lang.value, // Store the original API value
                }));
                setLanguages(formattedLanguages);
            } catch (err) {
                setError(err.message || 'Failed to load languages');
                Toast.show({
                    type: 'error',
                    text1: languageTexts?.common?.error || 'Error',
                    text2: err.message || (languageTexts?.multilingual?.error?.load || 'Failed to load languages'),
                });
            } finally {
                setLoading(false);
            }
        };

        fetchLanguages();

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim, languageTexts]);

    const handleLanguageSelect = async (language) => {
        setUpdating(true);
        try {
            setSelectedLanguage(language.englishName);
            const langCode = language.code; // Standard code (e.g., 'EN') for local context
            const langValue = language.value; // Original API value (e.g., 'ENGLISH') for API call
            if (langCode && langValue) {
                // Update language on the server using the original API value
                const response = await updateUserLanguage(langValue);
                if (response.status) {
                    // Successfully updated language on the server
                    Toast.show({
                        type: 'success',
                        text1: languageTexts?.common?.success || 'Success',
                        text2: languageTexts?.multilingual?.languageUpdated || 'Language updated successfully',
                    });
                } else {
                    throw new Error(response.message || 'Failed to update language on server');
                }
                // Update local language context using the standard code
                changeLanguage(langCode);
                Toast.show({
                    type: 'success',
                    text1: languageTexts?.common?.success || 'Success',
                    text2: languageTexts?.multilingual?.languageUpdated || 'Language updated successfully',
                });
            }
        } catch (err) {
            setSelectedLanguage(languageCodeToEnglishName[language] || 'English');
            Toast.show({
                type: 'error',
                text1: languageTexts?.common?.error || 'Error',
                text2: err.message || (languageTexts?.multilingual?.error?.update || 'Failed to update language'),
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleContinue = () => {
        navigation.navigate('Dashboard');
    };

    if (loading) {
        return (
            <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFF" />
                    <Text style={styles.loadingText}>
                        {languageTexts?.multilingual?.loading || 'Loading languages...'}
                    </Text>
                </View>
            </LinearGradient>
        );
    }

    if (error) {
        return (
            <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        {languageTexts?.multilingual?.error?.load || 'Failed to load languages'}
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => {
                        setError(null);
                        setLoading(true);
                        fetchLanguages();
                    }}>
                        <Text style={styles.retryButtonText}>
                            {languageTexts?.common?.retry || 'Retry'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#2753b2', '#e6e9f0']}
            style={styles.container}
        >
            <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.titleText}>
                        {languageTexts?.menu?.multilingualSupport || 'Multilingual Support'}
                    </Text>
                    <View style={{ width: 60 }} />
                </View>
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.subtitleText}>
                        {languageTexts?.multilingual?.select || 'Select your preferred language : -'}
                    </Text>
                    <View style={styles.languageList}>
                        {languages.map((language) => (
                            <TouchableOpacity
                                key={language.code}
                                style={[
                                    styles.languageOption,
                                    selectedLanguage === language.englishName && styles.selectedLanguageOption,
                                    updating && styles.disabledOption,
                                ]}
                                onPress={() => !updating && handleLanguageSelect(language)}
                                disabled={updating}
                            >
                                {updating && selectedLanguage === language.englishName ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text
                                        style={[
                                            styles.languageText,
                                            selectedLanguage === language.englishName && styles.selectedLanguageText,
                                        ]}
                                    >
                                        {language.nativeName}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={[styles.button, updating && styles.disabledButton]}
                        onPress={handleContinue}
                        disabled={updating}
                    >
                        <Text style={styles.buttonText}>
                            {languageTexts?.multilingual?.continue || 'Continue'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 80,
        zIndex: 1,
        marginLeft: 5,
        marginTop: 5,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    backButtonText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 40,
        alignItems: 'center',
    },
    titleText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
    },
    subtitleText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#F0F0F0',
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 22,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    languageList: {
        width: '80%',
        marginBottom: 25,
    },
    languageOption: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    selectedLanguageOption: {
        backgroundColor: '#2753b2',
    },
    disabledOption: {
        opacity: 0.6,
    },
    languageText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    selectedLanguageText: {
        color: '#FFF',
        fontWeight: '600',
    },
    button: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        backgroundColor: '#2753b2',
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#FFF',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        paddingHorizontal: 30,
        paddingVertical: 10,
        backgroundColor: '#FFF',
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        color: '#2753b2',
        fontWeight: '600',
    },
});

export default MultilingualSupportPage;