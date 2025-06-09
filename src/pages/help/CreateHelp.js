import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../language/commondir';
import { createHelpRequest } from '../../api/auth';

function CreateHelp({ route, navigation }) {
    const { category, userId } = route.params;
    const { languageTexts } = useLanguage();
    const [description, setDescription] = useState('');

    const handleSubmit = async () => {
        if (!description.trim()) {
            Alert.alert(
                languageTexts?.helpRequest?.error?.title || 'Error',
                languageTexts?.helpRequest?.error?.description || 'Please provide a description of your issue.'
            );
            return;
        }

        try {
            // const formData = new FormData();
            // formData.append('category_id', category.id);
            // formData.append('description', description);

            // // Log FormData for debugging (note: FormData logging might not show all data directly)
            // console.log('FormData prepared:', { category_id: category.id, description });

            // await createHelpRequest(formData);
            const response = await createHelpRequest({
                category_id: category.id,
                description: description,
            });

            Alert.alert(
                languageTexts?.helpRequest?.success?.title || 'Success',
                languageTexts?.helpRequest?.success?.message || 'Your help request has been submitted successfully!'
            );
            navigation.navigate('CategoryHelp', {
                category: { id: category.id, name: category.name },
                userId: userId,
                newRequest: response, // Pass the newly created request
            });
        } catch (err) {
            const errorMessage = err.message || 'Failed to submit help request. Please try again.';
            Alert.alert(
                'Error',
                errorMessage
            );
        }
    };

    return (
        <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('CategoryHelp', { category, userId })}
                >
                    <Icon name="arrow-back-ios" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.titleText}>
                    {languageTexts?.helpRequest?.modalTitle || 'New Help Request'}
                </Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>
                    <Text style={styles.label}>
                        {languageTexts?.helpRequest?.category || 'Category'}
                    </Text>
                    <Text style={styles.categoryText}>{category?.name}</Text>

                    <Text style={styles.label}>
                        {languageTexts?.helpRequest?.description || 'Description'}
                    </Text>
                    <TextInput
                        style={styles.multilineInput}
                        placeholder={languageTexts?.helpRequest?.placeholder || "Describe your issue in detail..."}
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                    />

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.buttonText}>
                            {languageTexts?.helpRequest?.submit || 'Submit Request'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        zIndex: 1,
    },
    titleText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        padding: 20,
        elevation: 2,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
        marginTop: 15,
    },
    categoryText: {
        fontSize: 16,
        color: '#333',
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 15,
    },
    multilineInput: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        color: '#333',
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 100,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    submitButton: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        backgroundColor: '#2753b2',
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default CreateHelp;