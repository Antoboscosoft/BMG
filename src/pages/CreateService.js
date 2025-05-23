import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { createServiceRequest, deleteServiceRequest, updateServiceRequest } from '../api/auth';

function CreateService({ navigation, route }) {
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
            setError('Description is required');
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
                    'Success',
                    'Service request updated successfully!',
                    [{ text: 'OK', onPress: () => navigation.navigate('ServicesDirectory') }],
                    { cancelable: false }
                );
            } catch (error) {
                Alert.alert('Error', 'Failed to update service request. Please try again.');
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
                    'Success',
                    'Service request created successfully!',
                    [{ text: 'OK', onPress: () => navigation.navigate('ServicesDirectory') }],
                    { cancelable: false }
                );
            } catch (error) {
                Alert.alert('Error', 'Failed to create service request. Please try again.');
            } finally {
                setIsCreating(false);
            }
        }
    };

    const handleDeleteRequest = async () => {
        Alert.alert(
            'Delete Request',
            'Are you sure you want to delete this service request?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            await deleteServiceRequest(serviceData?.service_id);
                            Alert.alert(
                                'Success',
                                'Service request deleted successfully!',
                                [{ text: 'OK', onPress: () => navigation.navigate('ServicesDirectory') }]
                            );
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete service request. Please try again.');
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
                    <Text style={styles.backButtonText}>{'< Back'}</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.headerText}>
                        {serviceData.isApplied ? 'Service Request' : 'Create Service Request'}
                    </Text>
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.label}>Service Category:</Text>
                    <View style={styles.categoryBox}>
                        <Text style={styles.categoryText}>{serviceData.category_name}</Text>
                    </View>

                    <Text style={styles.label}>Description:</Text>
                    {serviceData.isApplied && !isEditing ? (
                        <View style={styles.descriptionBox}>
                            <Text style={styles.descriptionText}>{description}</Text>
                        </View>
                    ) : (
                        <TextInput
                            style={[styles.input, error ? styles.inputError : null]}
                            placeholder="Enter your request details"
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
                                        (isUpdating || isDeleting) && styles.disabledButton
                                    ]}
                                    onPress={handleSubmit}
                                    disabled={isUpdating || isDeleting}
                                >
                                    <Text style={styles.buttonText}>
                                        {isEditing ? (isUpdating ? 'Updating...' : 'Update') : 'Edit'}
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={[
                                        styles.deleteButton,
                                        (isUpdating || isDeleting) && styles.disabledButton
                                    ]}
                                    onPress={handleDeleteRequest}
                                    disabled={isUpdating || isDeleting}
                                >
                                    <Text style={styles.buttonText}>
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    isCreating && styles.disabledButton
                                ]}
                                onPress={handleSubmit}
                                disabled={isCreating}
                            >
                                <Text style={styles.buttonText}>
                                    {isCreating ? 'Submitting...' : 'Submit Request'}
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
        flexGrow: 1,
        padding: 15,
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
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    contentContainer: {
        marginTop: 20,
        padding: 20,
        backgroundColor: '#FFF',
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    categoryBox: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    categoryText: {
        fontSize: 16,
        color: '#2753b2',
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
    },
    inputError: {
        borderColor: '#ff6b6b',
    },
    descriptionBox: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minHeight: 100,
    },
    descriptionText: {
        fontSize: 16,
        color: '#333',
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 14,
        marginBottom: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    editButton: {
        flex: 1,
        backgroundColor: '#2753b2',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#ff4444',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#2753b2',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.6,
    },
});

export default CreateService;