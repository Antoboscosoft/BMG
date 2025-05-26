import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { createServiceRequest, deleteServiceRequest, updateServiceRequest } from '../api/auth';
import { useLanguage } from '../language/commondir';

function CreateService({ navigation, route }) {
    const { languageTexts } = useLanguage();
    const { serviceData } = route.params;
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [description, setDescription] = useState(serviceData.description || '');
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(!serviceData.isApplied);

    useEffect(() => {
        if (serviceData.isApplied && serviceData.description) {
            setDescription(serviceData.description);
        }
    }, [serviceData]);

    const handleSubmit = async () => {
        if (!description.trim()) {
            setError(languageTexts?.createService?.error?.description || 'Description is required');
            return;
        }

        setError('');

        if (serviceData?.isApplied && serviceData?.service_id) {
            if (!isEditing) {
                setIsEditing(true);
                return;
            }
            setIsUpdating(true);
            try {
                const requestData = {
                    category_id: serviceData.category_id,
                    description: description,
                    requested_user_id: serviceData.requested_user_id || 0,
                };

                const response = await updateServiceRequest(serviceData?.service_id, requestData);
                Alert.alert(
                    languageTexts?.createService?.success?.title || 'Success',
                    languageTexts?.createService?.success?.update || 'Service request updated successfully!',
                    [{ text: languageTexts?.common?.ok || 'OK', onPress: () => navigation.navigate('ServicesDirectory') }],
                    { cancelable: false }
                );
            } catch (error) {
                Alert.alert(
                    languageTexts?.createService?.error?.title || 'Error',
                    languageTexts?.createService?.error?.update || 'Failed to update service request. Please try again.'
                );
            } finally {
                setIsUpdating(false);
                setIsEditing(false);
            }
        } else {
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
                    [{ text: languageTexts?.common?.ok || 'OK', onPress: () => navigation.navigate('ServicesDirectory') }],
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
        }
    };

    const handleDeleteRequest = async () => {
        Alert.alert(
            languageTexts?.createService?.delete?.title || 'Delete Request',
            languageTexts?.createService?.delete?.message || 'Are you sure you want to delete this service request?',
            [
                { text: languageTexts?.common?.cancel || 'Cancel', style: 'cancel' },
                {
                    text: languageTexts?.createService?.delete?.confirm || 'Delete',
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            await deleteServiceRequest(serviceData?.service_id);
                            Alert.alert(
                                languageTexts?.createService?.success?.title || 'Success',
                                languageTexts?.createService?.success?.delete || 'Service request deleted successfully!',
                                [{ text: languageTexts?.common?.ok || 'OK', onPress: () => navigation.navigate('ServicesDirectory') }]
                            );
                        } catch (error) {
                            Alert.alert(
                                languageTexts?.createService?.error?.title || 'Error',
                                languageTexts?.createService?.error?.delete || 'Failed to delete service request. Please try again.'
                            );
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    return (
        <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('ServicesDirectory')}
                >
                    <Text style={styles.backButtonText}>
                        {languageTexts?.common?.back || '< Back'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.headerText}>
                        {serviceData.isApplied
                            ? languageTexts?.createService?.title?.update || 'Service Request'
                            : languageTexts?.createService?.title?.create || 'Create Service Request'}
                    </Text>
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.label}>
                        {languageTexts?.createService?.category || 'Service Category:'}
                    </Text>
                    <View style={styles.categoryBox}>
                        <Text style={styles.categoryText}>{serviceData.category_name}</Text>
                    </View>

                    <Text style={styles.label}>
                        {languageTexts?.createService?.description || 'Description:'}
                    </Text>
                    {serviceData.isApplied && !isEditing ? (
                        <View style={styles.descriptionBox}>
                            <Text style={styles.descriptionText}>{description}</Text>
                        </View>
                    ) : (
                        <TextInput
                            style={[styles.input, error ? styles.inputError : null]}
                            placeholder={languageTexts?.createService?.placeholder || 'Enter your request details'}
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={(text) => {
                                setDescription(text);
                                if (error && text.trim()) setError('');
                            }}
                            editable={isEditing || !serviceData.isApplied}
                        />
                    )}
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.buttonRow}>
                        {serviceData.isApplied ? (
                            <>
                                <TouchableOpacity
                                    style={[
                                        styles.editButton,
                                        (isUpdating || isDeleting) && styles.disabledButton,
                                    ]}
                                    onPress={handleSubmit}
                                    disabled={isUpdating || isDeleting}
                                >
                                    <Text style={styles.buttonText}>
                                        {isEditing
                                            ? (isUpdating
                                                ? languageTexts?.createService?.updating || 'Updating...'
                                                : languageTexts?.createService?.update || 'Update')
                                            : languageTexts?.createService?.edit || 'Edit'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.deleteButton,
                                        (isUpdating || isDeleting) && styles.disabledButton,
                                    ]}
                                    onPress={handleDeleteRequest}
                                    disabled={isUpdating || isDeleting}
                                >
                                    <Text style={styles.buttonText}>
                                        {isDeleting
                                            ? languageTexts?.createService?.deleting || 'Deleting...'
                                            : languageTexts?.createService?.delete?.button || 'Delete'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    isCreating && styles.disabledButton,
                                ]}
                                onPress={handleSubmit}
                                disabled={isCreating}
                            >
                                <Text style={styles.buttonText}>
                                    {isCreating
                                        ? languageTexts?.createService?.submitting || 'Submitting...'
                                        : languageTexts?.createService?.submit || 'Submit Request'}
                                </Text>
                            </TouchableOpacity>
                        )}
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
        borderRadius: 8,
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
        borderRadius: 8,
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
    descriptionBox: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 16,
        color: '#333',
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
    editButton: {
        backgroundColor: '#2753b2',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        marginRight: 5,
    },
    deleteButton: {
        backgroundColor: '#D32F2F',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        marginLeft: 5,
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