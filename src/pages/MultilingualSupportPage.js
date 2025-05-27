import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useLanguage } from '../language/commondir';
import Icon from 'react-native-vector-icons/MaterialIcons';

function MultilingualSupportPage({ navigation }) {
    const { language, changeLanguage, languageTexts } = useLanguage();
    const [fadeAnim] = useState(new Animated.Value(0));

    // Map English names to language codes
    const languageMap = {
        'English': 'EN',
        'Hindi': 'HI',
        'Tamil': 'TA',
        'Bengali': 'BN',
        // 'Arabic': 'AR', // Note: Arabic is not implemented in translations yet
    };

    // Map language codes to native names for display
    const languages = [
        { englishName: 'English', nativeName: 'English', code: 'EN' },
        { englishName: 'Hindi', nativeName: 'हिन्दी', code: 'HI' },
        { englishName: 'Tamil', nativeName: 'தமிழ்', code: 'TA' },
        // { englishName: 'Bengali', nativeName: 'বাংলা', code: 'BN' },
        // { englishName: 'Arabic', nativeName: 'العربية', code: 'AR' },
    ];

    // Set initial selected language based on current language
    const [selectedLanguage, setSelectedLanguage] = useState(
        Object.keys(languageMap).find(key => languageMap[key] === language) || 'English'
    );

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const handleLanguageSelect = (language) => {
        setSelectedLanguage(language.englishName);
        const langCode = languageMap[language.englishName];
        if (langCode) {
            changeLanguage(langCode);
        }
    };

    const handleContinue = () => {
        navigation.navigate('Dashboard');
    };

    // const changeLanguage = async (langCode) => {
    //     try {
    //         await AsyncStorage.setItem('languageSelect', langCode);
    //         setLanguage(langCode);
    //         await updateLanguageTexts(langCode);
    //         // Optional: Update backend
    //         // await updateUserLanguage(langCode.toLowerCase()); // Implement this API call
    //     } catch (error) {
    //         console.error('Failed to change language:', error);
    //     }
    // };

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
                        {/* <Text style={styles.backButtonText}>{'< Back'}</Text> */}
                        <Icon name="arrow-back-ios" size={24} color="#FFF" />
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
                                key={language.englishName}
                                style={[
                                    styles.languageOption,
                                    selectedLanguage === language.englishName && styles.selectedLanguageOption,
                                ]}
                                onPress={() => handleLanguageSelect(language)}
                            >
                                <Text
                                    style={[
                                        styles.languageText,
                                        selectedLanguage === language.englishName && styles.selectedLanguageText,
                                    ]}
                                >
                                    {language.nativeName}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleContinue}
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
        borderRadius: 8,
        zIndex: 1,
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
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default MultilingualSupportPage;