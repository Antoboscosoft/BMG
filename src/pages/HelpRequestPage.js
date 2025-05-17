import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, TextInput, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { Dropdown } from 'react-native-element-dropdown';


// Add this to your component
const categories = [
    { label: 'Legal Assistance', value: 'Legal Assistance' },
    { label: 'Job Support', value: 'Job Support' },
    { label: 'Health Services', value: 'Health Services' },
    { label: 'Language Support', value: 'Language Support' },
    { label: 'Other', value: 'Other' },
];

const urgencyLevels = [
    { label: 'Normal', value: 'Normal' },
    { label: 'Urgent', value: 'Urgent' },
];


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
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>{'< Back'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.titleText}>Help Request</Text>
                    <View style={{ width: 60 }} /> 
                </View>
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.subtitleText}>
                        Submit a request for assistance, and we’ll get back to you soon.
                    </Text>
                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Category</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={category}
                                style={styles.picker}
                                onValueChange={(itemValue) => setCategory(itemValue)}
                            >
                                <Picker.Item label="Legal Assistance" value="Legal Assistance" />
                                <Picker.Item label="Job Support" value="Job Support" />
                                <Picker.Item label="Health Services" value="Health Services" />
                                <Picker.Item label="Language Support" value="Language Support" />
                                <Picker.Item label="Food and Shelter" value="Food and Shelter" />
                            </Picker>
                        </View>

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={styles.multilineInput}
                            placeholder="Describe your issue in detail..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={5}
                            maxheight={100}
                            textAlignVertical="top" // Align text to top
                            value={description}
                            onChangeText={setDescription}
                            blurOnSubmit={true}
                            returnKeyType="done"
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
        // position: 'absolute',
        // top: 20,
        // left: 20,
        // padding: 10,
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
        // paddingTop: 50,
        // paddingBottom: 20,
    },
    backButtonText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    contentContainer: {
        paddingHorizontal: 20,
        // paddingTop: 80,
        paddingTop: 40,
        paddingBottom: 40,
        alignItems: 'center',
    },
    titleText: {
        // fontSize: 32,
        // fontWeight: 'bold',
        // color: '#FFF',
        // marginBottom: 15,
        // textAlign: 'center',
        // textShadowColor: 'rgba(0, 0, 0, 0.5)',
        // textShadowOffset: { width: 1, height: 1 },
        // textShadowRadius: 3,
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
    // picker: {
    //     width: '80%',
    //     // height: 50,
    //     backgroundColor: 'rgba(255, 255, 255, 0.9)',
    //     borderRadius: 8,
    //     marginBottom: 20,
    //     color: '#333',
    //     elevation: 2,
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 1 },
    //     shadowOpacity: 0.2,
    //     shadowRadius: 3,
    // },
    textInput: {
        width: '80%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        // padding: 15,
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
    // For Picker solution
    pickerContainer: {
        width: '80%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    picker: {
        width: '100%',
        // height: 50,
        color: '#333',
    },

    // Improved multiline input
    multilineInput: {
        width: '80%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        color: '#333',
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 100,
        maxHeight: 200,
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
        marginTop: 20,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
});