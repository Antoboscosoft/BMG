import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
    Linking,
    FlatList,
    Dimensions,
    Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RenderHtml from 'react-native-render-html';
import { createEventRegistration, deleteEventRegistration, getEventById, updateEventRegistration } from '../api/auth';
import { useLanguage } from '../language/commondir';

// Utility function to strip HTML tags
const stripHtmlTags = (html) => {
    return html.replace(/<[^>]+>/g, '');
};

// Utility function to format datetime to date (e.g., "May 29, 2025")
// const formatDate = (datetime) => {
//     const date = new Date(datetime);
//     return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
// };

// Utility function to format datetime to time (e.g., "3:30 AM")
// const formatTime = (datetime) => {
//     const date = new Date(datetime);
//     return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
// };

// Utility function to format datetime to date (e.g., "May 23, 2025")
const formatDate = (startDatetime, endDatetime) => {
    const start = new Date(startDatetime);
    const end = new Date(endDatetime);
    const startFormatted = start.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
    const endFormatted = end.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
    return startFormatted === endFormatted ? startFormatted : `${startFormatted} - ${endFormatted}`;
};

// Utility function to format datetime to time (e.g., "3:30 AM - 6:29 PM")
const formatTime = (startDatetime, endDatetime) => {
    const start = new Date(startDatetime);
    const end = new Date(endDatetime);

    // 12 hour format
     const options = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true // This ensures 12-hour format with AM/PM
    };
    
    const startFormatted = start.toLocaleTimeString([], options);
    const endFormatted = end.toLocaleTimeString([], options);

    // 24 hour format
    // const startFormatted = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    // const endFormatted = end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    return startFormatted === endFormatted ? startFormatted : `${startFormatted} - ${endFormatted}`;
};

// Utility function to format file size (e.g., from bytes to KB/MB)
const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Utility function to check if a file is an image
const isImageFile = (fileName) => {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};



function CreateRegister({ navigation, route }) {
    const { languageTexts } = useLanguage();
    const { eventData } = route.params; // Expect eventId from route.params
    const [status, setStatus] = useState(eventData.currentStatus || 'maybe');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const eventId = eventData?.eventData?.id; // Use the event ID from the route params
    const [eventAttachments, setEventAttachments] = useState([]); // State to hold event attachments
    // console.log('Event Attachments:', eventAttachments);

    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);

    // Fetch event data when component mounts or eventId changes
    useEffect(() => {
        const fetchEventData = async () => {
            setLoading(true);
            try {
                const data = await getEventById(eventId);
                // setEventData(data);/
                // setStatus(data.currentStatus || 'maybe');
                // console.log('Fetched Event Data:', data);
                // console.log("data?.event_attachments", data?.data?.event_attachments);
                setEventAttachments(data?.data?.event_attachments || []);
            } catch (error) {
                console.error('Fetch Event Error:', error);
                setError(error.message || (languageTexts?.createRegister?.error?.fetch || 'Failed to fetch event details.'));
            } finally {
                setLoading(false);
            }
        };

        fetchEventData();
    }, [eventId, languageTexts]);

    const handleSubmit = async () => {
        if (!status) {
            setError(languageTexts?.createRegister?.error?.status || 'Please select a status');
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
                languageTexts?.createRegister?.success?.title || 'Success',
                languageTexts?.createRegister?.success?.message || 'Registration updated successfully!',
                [
                    {
                        text: languageTexts?.common?.ok || 'OK',
                        onPress: () => navigation.navigate('EventCalendar'),
                    },
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.error('Registration Error:', error);
            setError(error.message || (languageTexts?.createRegister?.error?.submit || 'Failed to update registration. Please try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            languageTexts?.createRegister?.delete?.title || 'Delete Registration',
            languageTexts?.createRegister?.delete?.message || 'Are you sure you want to delete this registration?',
            [
                { text: languageTexts?.common?.cancel || 'Cancel', style: 'cancel' },
                {
                    text: languageTexts?.createRegister?.delete?.confirm || 'Delete',
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            await deleteEventRegistration(eventData.id);
                            Alert.alert(
                                languageTexts?.createRegister?.success?.title || 'Success',
                                languageTexts?.createRegister?.success?.delete || 'Registration deleted successfully!',
                                [
                                    {
                                        text: languageTexts?.common?.ok || 'OK',
                                        onPress: () => navigation.navigate('EventCalendar'),
                                    },
                                ]
                            );
                        } catch (error) {
                            console.error('Delete Error:', error);
                            setError(error.message || (languageTexts?.createRegister?.error?.delete || 'Failed to delete registration.'));
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    if (loading) {
        return (
            <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={styles.loadingText}>{languageTexts?.common?.loading || 'Loading...'}</Text>
                </View>
            </LinearGradient>
        );
    }
    if (error && !eventData) {
        return (
            <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => navigation.navigate('EventCalendar')}
                    >
                        <Text style={styles.buttonText}>{languageTexts?.common?.back || 'Back'}</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }


    return (
        <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('EventCalendar')}
                >
                    <Text style={styles.backButtonText}>{languageTexts?.common?.back || '< Back'}</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.headerText}>
                        {eventData.isRegistered ? languageTexts?.createRegister?.title?.update || 'Update Registration' : languageTexts?.createRegister?.title?.create || 'Create Registration'}
                    </Text>
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.label}>{languageTexts?.createRegister?.event || 'Event:'}</Text>
                    <View style={styles.eventBox}>
                        <Text style={styles.eventTitle}>{eventData.title}</Text>
                        {/* <View style={styles.eventDetailRow}>
                            <Icon name="calendar-today" size={20} color="#555" style={styles.icon} />
                            <Text style={styles.eventDetail}>
                                {languageTexts?.createRegister?.startDate || 'Start Date'}: {formatDate(eventData.eventData.start_datetime)}
                            </Text>
                        </View>
                        <View style={styles.eventDetailRow}>
                            <Icon name="calendar-today" size={20} color="#555" style={styles.icon} />
                            <Text style={styles.eventDetail}>
                                {languageTexts?.createRegister?.endDate || 'End Date'}: {formatDate(eventData.eventData.end_datetime)}
                            </Text>
                        </View>
                        <View style={styles.eventDetailRow}>
                            <Icon name="access-time" size={20} color="#555" style={styles.icon} />
                            <Text style={styles.eventDetail}>
                                {languageTexts?.createRegister?.startTime || 'Start Time'}: {formatTime(eventData.eventData.start_datetime)}
                            </Text>
                        </View>
                        <View style={styles.eventDetailRow}>
                            <Icon name="access-time" size={20} color="#555" style={styles.icon} />
                            <Text style={styles.eventDetail}>
                                {languageTexts?.createRegister?.endTime || 'End Time'}: {formatTime(eventData.eventData.end_datetime)}
                            </Text>
                        </View> */}
                        <View style={styles.eventDetailRow}>
                            <Icon name="calendar-today" size={20} color="#555" style={styles.icon} />
                            <Text style={styles.eventDetail}>
                                {/* {languageTexts?.createRegister?.date || 'Date'}:  */}
                                {formatDate(eventData?.eventData?.start_datetime, eventData?.eventData?.end_datetime)}
                            </Text>
                        </View>
                        <View style={styles.eventDetailRow}>
                            <Icon name="access-time" size={20} color="#555" style={styles.icon} />
                            <Text style={styles.eventDetail}>
                                {/* {languageTexts?.createRegister?.time || 'Time'}:  */}
                                {formatTime(eventData?.eventData?.start_datetime, eventData?.eventData?.end_datetime)}
                            </Text>
                        </View>
                        <View style={styles.eventDetailRow}>
                            <Icon name="event" size={20} color="#555" style={styles.icon} />
                            <Text style={styles.eventDetail}>
                                {languageTexts?.createRegister?.allDay || 'All Day'}: {eventData.eventData.all_day ? 'Yes' : 'No'}
                            </Text>
                        </View>
                        <View style={styles.eventDetailRow}>
                            <Icon name="location-on" size={20} color="#555" style={styles.icon} />
                            <Text style={styles.eventDetail}>
                                {/* {languageTexts?.createRegister?.location || 'Location'}:  */}
                                {eventData.location}
                            </Text>
                        </View>
                        {console.log("eventData.description", eventData.description)}
                        <View style={styles.eventDetailRow}>
                            <Icon name="description" size={20} color="#555" style={styles.icon} />
                            <View style={[ styles.eventDetail, { flex: 1, marginLeft: 8 }]}>
                                <RenderHtml
                                    contentWidth={Dimensions.get('window').width - 100}
                                    source={{ html: eventData.description || '' }}
                                    baseStyle={{ color: '#555', fontSize: 14 }}
                                    tagsStyles={{
                                        b: { fontWeight: 'bold', color: '#555', fontSize: 14 },
                                        strong: { fontWeight: 'bold', color: '#555', fontSize: 14 },
                                        u: { textDecorationLine: 'underline' },
                                        i: { fontStyle: 'italic' },
                                        em: { fontStyle: 'italic' },
                                        p: { marginBottom: 4 },
                                    }}
                                    enableExperimentalBRCollapsing={true}
                                />
                            </View>
                        </View>
                        {/* {eventAttachments.length > 0 && (
                            <View style={styles.eventDetailRow}>
                                <Icon name="attachment" size={20} color="#555" style={styles.icon} />
                                <View style={styles.attachmentContainer}>
                                    <Text style={styles.eventDetail}>
                                        {languageTexts?.createRegister?.attachments || 'Attachments'}:
                                    </Text>
                                    Image Slider
                                    {eventAttachments.some(attachment => isImageFile(attachment.file_name)) && (
                                        <FlatList
                                            data={eventAttachments.filter(attachment => isImageFile(attachment.file_name))}
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            keyExtractor={(item) => item.id.toString()}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    style={styles.sliderItem}
                                                    onPress={() => Linking.openURL(item.file_url)}
                                                >
                                                    <Image
                                                        source={{ uri: item.file_url }}
                                                        style={styles.attachmentImage}
                                                        resizeMode="cover"
                                                    />
                                                    <Text style={styles.attachmentText} numberOfLines={1}>
                                                        {item.file_name} ({formatFileSize(item.file_size)})
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                            contentContainerStyle={styles.sliderContainer}
                                        />
                                    )}
                                    Non-Image Attachments
                                    {eventAttachments.some(attachment => !isImageFile(attachment.file_name)) && (
                                        <View style={styles.nonImageContainer}>
                                            {eventAttachments
                                                .filter(attachment => !isImageFile(attachment.file_name))
                                                .map((attachment) => (
                                                    <TouchableOpacity
                                                        key={attachment.id}
                                                        style={styles.attachmentItem}
                                                        onPress={() => Linking.openURL(attachment.file_url)}
                                                    >
                                                        <Text style={styles.attachmentText}>
                                                            {attachment.file_name} ({formatFileSize(attachment.file_size)})
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                        </View>
                                    )}
                                </View>
                            </View>
                        )} */}
                        {eventAttachments.length > 0 && (
                            <View style={styles.eventDetailRow}>
                                <Icon name="attachment" size={20} color="#555" style={styles.icon} />
                                <View style={styles.attachmentContainer}>
                                    <Text style={styles.eventDetail}>
                                        {languageTexts?.createRegister?.attachments || 'Attachments'}:
                                    </Text>
                                    {/* Image Slider */}
                                    {eventAttachments.some(attachment => isImageFile(attachment.file_name)) && (
                                        <FlatList
                                            data={eventAttachments.filter(attachment => isImageFile(attachment.file_name))}
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            keyExtractor={(item) => item.id.toString()}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    style={styles.sliderItem}
                                                    onPress={() => {
                                                        setSelectedImageUrl(item.file_url);
                                                        setModalVisible(true);
                                                    }}
                                                >
                                                    <Image
                                                        source={{ uri: item.file_url }}
                                                        style={styles.attachmentImage}
                                                        resizeMode="cover"
                                                    />
                                                    {/* <Text style={styles.attachmentText} numberOfLines={1}>
                                {item.file_name} ({formatFileSize(item.file_size)})
                            </Text> */}
                                                </TouchableOpacity>
                                            )}
                                            contentContainerStyle={styles.sliderContainer}
                                        />
                                    )}
                                    {/* Non-Image Attachments */}
                                    {eventAttachments.some(attachment => !isImageFile(attachment.file_name)) && (
                                        <View style={styles.nonImageContainer}>
                                            {eventAttachments
                                                .filter(attachment => !isImageFile(attachment.file_name))
                                                .map((attachment) => (
                                                    <TouchableOpacity
                                                        key={attachment.id}
                                                        style={styles.attachmentItem}
                                                        onPress={() => Linking.openURL(attachment.file_url)}
                                                    >
                                                        <Text style={styles.attachmentText}>
                                                            {attachment.file_name} ({formatFileSize(attachment.file_size)})
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}
                        {/* Image Modal */}
                        <Modal
                            visible={isModalVisible}
                            transparent={true}
                            animationType="fade"
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <View style={styles.modalContainer}>
                                {selectedImageUrl && (
                                    <Image
                                        source={{ uri: selectedImageUrl }}
                                        style={styles.modalImage}
                                        resizeMode="contain"
                                    />
                                )}
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Icon name="close" size={24} style={styles.closeIcon} />
                                </TouchableOpacity>
                            </View>
                        </Modal>
                    </View>

                    <Text style={styles.label}>{languageTexts?.createRegister?.rsvpStatus || 'RSVP Status:'}</Text>
                    <View style={styles.radioContainer}>
                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setStatus('maybe')}
                        >
                            <View style={styles.radioOuter}>
                                {status === 'maybe' && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioLabel}>{languageTexts?.createRegister?.statusOptions?.maybe || 'Maybe'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setStatus('yes')}
                        >
                            <View style={styles.radioOuter}>
                                {status === 'yes' && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioLabel}>{languageTexts?.createRegister?.statusOptions?.yes || 'Yes'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setStatus('no')}
                        >
                            <View style={styles.radioOuter}>
                                {status === 'no' && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioLabel}>{languageTexts?.createRegister?.statusOptions?.no || 'No'}</Text>
                        </TouchableOpacity>
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.buttonRow}>
                        {/* {eventData.isRegistered && (
                            <TouchableOpacity
                                style={[styles.deleteButton, (isSubmitting || isDeleting) && styles.disabledButton]}
                                onPress={handleDelete}
                                disabled={isSubmitting || isDeleting}
                            >
                                <Text style={styles.buttonText}>
                                    {isDeleting ? languageTexts?.createRegister?.deleting || 'Deleting...' : languageTexts?.createRegister?.delete?.button || 'Delete'}
                                </Text>
                            </TouchableOpacity>
                        )} */}
                        <TouchableOpacity
                            style={[styles.submitButton, (isSubmitting || isDeleting) && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={isSubmitting || isDeleting}
                        >
                            <Text style={styles.buttonText}>
                                {isSubmitting ? languageTexts?.createRegister?.submitting || 'Submitting...' : languageTexts?.createRegister?.submit || 'Submit'}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFF',
        fontSize: 16,
        marginTop: 10,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#2753b2',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 50,
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
        paddingTop: 40,
        // paddingBottom: 20,
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
    eventDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    icon: {
        marginRight: 8,
        // color: '#555',
        // fontSize: 20,

        alignItems: 'flex-start',
        alignSelf: 'flex-start',
        justifyContent: 'flex-start',
    },
    eventDetail: {
        fontSize: 14,
        color: '#555',
        marginBottom: 3,
        marginLeft: 8,
        flex: 1, // Allow text to take available space
        flexWrap: 'wrap', // Allow text to wrap if it exceeds the width
    },
    attachmentContainer: {
        flex: 1,
    },
    attachmentItem: {
        marginTop: 8,
    },
    attachmentImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginBottom: 4,
    },
    attachmentText: {
        fontSize: 14,
        color: '#2753b2',
        textDecorationLine: 'underline',
    },
    sliderContainer: {
        paddingVertical: 8,
    },
    sliderItem: {
        // width: (Dimensions.get('window').width - 80) / 2, // Two items visible (minus container padding)
        width: (Dimensions.get('window').width) / 4, // Two items visible (minus container padding)
        marginRight: 8,
        alignItems: 'center',
    },
    nonImageContainer: {
        marginTop: 8,
    },

    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: Dimensions.get('window').width * 0.9,
        height: Dimensions.get('window').height * 0.7,
        borderRadius: 8,
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 20,
    },
    closeIcon: {
        color: '#FFF',
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