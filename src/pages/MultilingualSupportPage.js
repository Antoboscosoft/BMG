import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

function MultilingualSupportPage({ navigation }) {
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const fadeAnim = useState(new Animated.Value(0))[0]; // Animation for fade-in effect

    useEffect(() => {
        // Start fade-in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const languages = [
        'English',
        'Spanish',
        'Hindi',
        'Mandarin',
        'Arabic',
        'French',
    ];

    const handleLanguageSelect = (language) => {
        setSelectedLanguage(language);
    };

    const handleContinue = () => {
        // Add logic to set the app language and navigate
        navigation.navigate('Dashboard'); // Replace with your desired screen
    };

    return (
        <LinearGradient
            colors={['#2753b2', '#e6e9f0']} // Gradient from blue to light gray
            //   colors={['#5e3b15', '#b06a2c']}
            style={styles.container}
        >
            <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>{'< Back'}</Text>
                </TouchableOpacity>
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.titleText}>Multilingual Support</Text>
                    <Text style={styles.subtitleText}>
                        Select your preferred language to continue.
                    </Text>
                    <View style={styles.languageList}>
                        {languages.map((language) => (
                            <TouchableOpacity
                                key={language}
                                style={[
                                    styles.languageOption,
                                    selectedLanguage === language && styles.selectedLanguageOption,
                                ]}
                                onPress={() => handleLanguageSelect(language)}
                            >
                                <Text
                                    style={[
                                        styles.languageText,
                                        selectedLanguage === language && styles.selectedLanguageText,
                                    ]}
                                >
                                    {language}
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

export default MultilingualSupportPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        zIndex: 1, // Ensure back button stays above the ScrollView
    },
    backButtonText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 80, // Start content below the back button
        paddingBottom: 40,
        alignItems: 'center',
    },
    titleText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 15,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
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