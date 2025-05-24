import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { createEventRegistration, deleteEventRegistration, updateEventRegistration } from '../api/auth';

function CreateRegister({ navigation, route }) {
    const { eventData } = route.params;
    const [status, setStatus] = useState(eventData.currentStatus || 'maybe');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!status) {
            setError('Please select a status');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            let response;
            if (eventData.isRegistered) {
                response = await updateEventRegistration(eventData.id, status);
            } else {
                response = await createEventRegistration(eventData.id, status);
            }

            Alert.alert(
                'Success',
                'Registration updated successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('EventCalendar'),
                    },
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.error('Registration Error:', error);
            setError(error.message || 'Failed to update registration. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Registration',
            'Are you sure you want to delete this registration?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            await deleteEventRegistration(eventData.id);
                            Alert.alert(
                                'Success',
                                'Registration deleted successfully!',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => navigation.navigate('EventCalendar'),
                                    },
                                ]
                            );
                        } catch (error) {
                            console.error('Delete Error:', error);
                            setError(error.message || 'Failed to delete registration.');
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
                    onPress={() => navigation.navigate('EventCalendar')}
                >
                    <Text style={styles.backButtonText}>{'< Back'}</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.headerText}>
                        {eventData.isRegistered ? 'Update Registration' : 'Create Registration'}
                    </Text>
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.label}>Event:</Text>
                    <View style={styles.eventBox}>
                        <Text style={styles.eventTitle}>{eventData.title}</Text>
                        <Text style={styles.eventDetail}>{eventData.description}</Text>
                        <Text style={styles.eventDetail}>{eventData.location}</Text>
                    </View>

                    {/* <Text style={styles.label}>RSVP Status:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={status}
                            onValueChange={(itemValue) => setStatus(itemValue)}
                            style={styles.picker}
                            dropdownIconColor="#2753b2"
                        >
                            <Picker.Item label="Maybe" value="maybe" />
                            <Picker.Item label="Yes" value="yes" />
                            <Picker.Item label="No" value="no" />
                        </Picker>
                    </View> */}

                    <Text style={styles.label}>RSVP Status:</Text>
                    <View style={styles.radioContainer}>
                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setStatus('maybe')}
                        >
                            <View style={styles.radioOuter}>
                                {status === 'maybe' && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioLabel}>Maybe</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setStatus('yes')}
                        >
                            <View style={styles.radioOuter}>
                                {status === 'yes' && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioLabel}>Yes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setStatus('no')}
                        >
                            <View style={styles.radioOuter}>
                                {status === 'no' && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioLabel}>No</Text>
                        </TouchableOpacity>
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.buttonRow}>
                        {eventData.isRegistered && (
                            <TouchableOpacity
                                style={[styles.deleteButton, (isSubmitting || isDeleting) && styles.disabledButton]}
                                onPress={handleDelete}
                                disabled={isSubmitting || isDeleting}
                            >
                                <Text style={styles.buttonText}>
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.submitButton, (isSubmitting || isDeleting) && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={isSubmitting || isDeleting}
                        >
                            <Text style={styles.buttonText}>
                                {isSubmitting ? 'Submitting...' : 'Submit'}
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
    eventBox: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    eventTitle: {
        fontSize: 16,
        color: '#2753b2',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    eventDetail: {
        fontSize: 14,
        color: '#555',
        marginBottom: 3,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        height: 50,
        color: '#333',
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: '#2753b2',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#ff4444',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#2753b2',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // radio button:
    radioContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    radioOuter: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#2753b2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 5,
    },
    radioInner: {
        height: 12,
        width: 12,
        borderRadius: 6,
        backgroundColor: '#2753b2',
    },
    radioLabel: {
        fontSize: 16,
        color: '#333',
    },
});

export default CreateRegister;