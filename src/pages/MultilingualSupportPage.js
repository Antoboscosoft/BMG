import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

function MultilingualSupportPage({ navigation }) {
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    // Updated languages array with native names
    const languages = [
        { englishName: 'English', nativeName: 'English' },
        // { englishName: 'Spanish', nativeName: 'Español' },
        { englishName: 'Hindi', nativeName: 'हिन्दी' },
        { englishName: 'Tamil', nativeName: 'தமிழ்' },
        // { englishName: 'Mandarin', nativeName: '普通话' },
        { englishName: 'Arabic', nativeName: 'العربية' },
        // { englishName: 'French', nativeName: 'Français' },
    ];

    const handleLanguageSelect = (language) => {
        setSelectedLanguage(language.englishName);
    };

    const handleContinue = () => {
        navigation.navigate('Dashboard');
    };

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
                        <Text style={styles.backButtonText}>{'< Back'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.titleText}>Multilingual Support</Text>
                    <View style={{ width: 60 }} />
                </View>
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.subtitleText}>
                        Select your preferred language : -
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
                                    {/* - 
                                    {language.englishName} */}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleContinue}
                    >
                        <Text style={styles.buttonText}>Continue</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Animated.View>
        </LinearGradient>
    );
}

// Keep all your existing styles exactly the same
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