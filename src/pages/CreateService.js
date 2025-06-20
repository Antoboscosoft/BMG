import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { createServiceRequest } from '../api/auth';
import { useLanguage } from '../language/commondir';
import Icon from 'react-native-vector-icons/MaterialIcons';

function CreateService({ navigation, route }) {
    const { languageTexts } = useLanguage();
    const serviceData = route.params?.serviceData || {};
    console.log("Service Data:", serviceData);
    
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async () => {
        if (!description.trim()) {
            setError(languageTexts?.createService?.error?.description || 'Description is required');
            return;
        }

        setError('');
        setIsCreating(true);
        try {
            const requestData = {
                category_id: serviceData.category_id,
                description: description,
                requested_user_id: 0,
            };

            const response = await createServiceRequest(requestData);
            Alert.alert(
                languageTexts?.createService?.success?.title || 'Success',
                languageTexts?.createService?.success?.create || 'Service request created successfully!',
                [
                    {
                        text: languageTexts?.common?.ok || 'OK',
                        onPress: () =>
                            navigation.navigate('CategoryServices', {
                                serviceData: {
                                    category_id: serviceData.category_id,
                                    category_name: serviceData.category_name,
                                },
                            }),
                    },
                ],
                { cancelable: false }
            );
        } catch (error) {
            Alert.alert(
                languageTexts?.createService?.error?.title || 'Error',
                languageTexts?.createService?.error?.create || 'Failed to create service request. Please try again.'
            );
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() =>
                        navigation.navigate('CategoryServices', {
                            serviceData: {
                                category_id: serviceData.category_id,
                                category_name: serviceData.category_name,
                            },
                        })
                    }
                >
                    <Icon name="arrow-back" size={24} color="#FFF" />
                    {/* <Text style={styles.backButtonText}>
                        {languageTexts?.common?.back || '< Back'}
                    </Text> */}
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.headerText}>
                        {languageTexts?.createService?.title?.create || 'Create Service Request'}
                    </Text>
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.label}>
                        {languageTexts?.createService?.category || 'Service Category:'}
                    </Text>
                    <View style={styles.categoryBox}>
                        <Text style={styles.categoryText}>{serviceData.category_name || 'No Category'}</Text>
                    </View>

                    <Text style={styles.label}>
                        {languageTexts?.createService?.description || 'Description:'} <Text style={[{ color: 'red' }]}>*</Text>
                    </Text>
                    <TextInput
                        style={[styles.input, error ? styles.inputError : null, { height: 100 }]}
                        placeholder={languageTexts?.createService?.placeholder || 'Enter your request details'}
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4}
                        value={description}
                        onChangeText={(text) => {
                            setDescription(text);
                            if (error && text.trim()) setError('');
                        }}
                    />
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.submitButton, isCreating && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={isCreating}
                        >
                            <Text style={styles.buttonText}>
                                {isCreating
                                    ? languageTexts?.createService?.submitting || 'Submitting...'
                                    : languageTexts?.createService?.submit || 'Submit Request'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingVertical: 30,
    },
    backButton: {
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 80,
        marginBottom: 20,
    },
    backButtonText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    header: {
        marginBottom: 20,
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
    },
    contentContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        padding: 20,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    categoryBox: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#F5F5F5',
        borderRadius: 8 ,
    },
    categoryText: {
        fontSize: 16,
        color: '#333',
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#DDD',
        marginBottom: 10,
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: '#D32F2F',
    },
    errorText: {
        fontSize: 14,
        color: '#D32F2F',
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    submitButton: {
        backgroundColor: '#2753b2',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
    },
    disabledButton: {
        backgroundColor: '#B0BEC5',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default CreateService;