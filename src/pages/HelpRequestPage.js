import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, TextInput, Picker, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

function HelpRequestPage({ navigation }) {
    const [category, setCategory] = useState('Legal Assistance');
    const [description, setDescription] = useState('');
    const [urgency, setUrgency] = useState('Normal');
    const fadeAnim = useState(new Animated.Value(0))[0]; // Animation for fade-in effect

    useEffect(() => {
        // Start fade-in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const handleSubmit = () => {
        if (!description.trim()) {
            Alert.alert('Error', 'Please provide a description of your issue.');
            return;
        }
        // Add logic to submit the help request (e.g., API call)
        Alert.alert('Success', 'Your help request has been submitted successfully!');
        setDescription(''); // Reset description field
    };

    return (
        <LinearGradient
            colors={['#2753b2', '#e6e9f0']} // Gradient from blue to light gray
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
                    <Text style={styles.titleText}>Help Request</Text>
                    <Text style={styles.subtitleText}>
                        Submit a request for assistance, and we’ll get back to you soon.
                    </Text>
                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Category</Text>
                        {/* <Picker
              selectedValue={category}
              style={styles.picker}
              onValueChange={(itemValue) => setCategory(itemValue)}
            >
              <Picker.Item label="Legal Assistance" value="Legal Assistance" />
              <Picker.Item label="Job Support" value="Job Support" />
              <Picker.Item label="Health Services" value="Health Services" />
              <Picker.Item label="Language Support" value="Language Support" />
              <Picker.Item label="Other" value="Other" />
            </Picker> */}
                        <TextInput
                            style={styles.textInput}
                            placeholder="Describe your issue..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                        />

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Describe your issue..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                        />

                        <Text style={styles.label}>Urgency</Text>
                        {/* <Picker
              selectedValue={urgency}
              style={styles.picker}
              onValueChange={(itemValue) => setUrgency(itemValue)}
            >
              <Picker.Item label="Normal" value="Normal" />
              <Picker.Item label="Urgent" value="Urgent" />
            </Picker> */}
                        <TextInput
                            style={styles.textInput}
                            placeholder="Describe your issue..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                        />

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.buttonText}>Submit Request</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Animated.View>
        </LinearGradient>
    );
}

export default HelpRequestPage;

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
        zIndex: 1,
    },
    backButtonText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 80,
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
    formContainer: {
        width: '100%',
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
        alignSelf: 'flex-start',
        marginLeft: '10%',
        marginBottom: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    picker: {
        width: '80%',
        height: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        marginBottom: 20,
        color: '#333',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    textInput: {
        width: '80%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        color: '#333',
        fontSize: 16,
        textAlignVertical: 'top',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
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