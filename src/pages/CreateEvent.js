import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Switch,
    Alert,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useLanguage } from '../language/commondir';
import { createEvent, updateEvent } from '../api/auth';
import { useForm, Controller } from 'react-hook-form';

function CreateEvent({ navigation, route }) {
    const { languageTexts } = useLanguage();
    const { userData, eventData } = route.params || {};
    const isAdmin = userData?.data?.role?.name === "Super Admin" || userData?.data?.role?.name === "Admin";
    console.log('User Data:', isAdmin);
    console.log('Event Data for Update:', eventData);

    const isUpdate = !!eventData; // Check if eventData exists to determine if this is an update

    const now = new Date();
    const defaultStart = new Date(now);
    defaultStart.setHours(9, 0, 0, 0); // 9:00 AM
    const defaultEnd = new Date(now);
    defaultEnd.setHours(23, 59, 0, 0); // 11:59 PM

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
        watch,
    } = useForm({
        defaultValues: {
            id: eventData?.id || '',
            title: eventData?.title || '',
            description: eventData?.description || '',
            all_day: eventData?.all_day || false,
            start_datetime: eventData?.start_datetime ? new Date(eventData.start_datetime) : defaultStart,
            end_datetime: eventData?.end_datetime ? new Date(eventData.end_datetime) : defaultEnd,
            location: eventData?.location || '',
            max_participants: eventData?.max_participants ? String(eventData.max_participants) : '80',
        },
    });

    const [files, setFiles] = useState([]);
    const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
    const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
    const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const all_day = watch('all_day');
    const start_datetime = watch('start_datetime');
    const end_datetime = watch('end_datetime');

    const formatDateTime = (date) => {
        return date.toISOString();
    };

    const formatDisplayDate = (date) => {
        return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatDisplayTime = (date) => {
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const onSubmit = async (data) => {
        if (data.end_datetime <= data.start_datetime) {
            setError(languageTexts?.createEvent?.error?.validation || 'End date/time must be after start date/time');
            return;
        }
        console.log('Form Data:', data);

        setError('');
        setIsSubmitting(true);

        try {
            const payload = {
                id: data.id,
                title: data.title,
                description: data.description,
                all_day: data.all_day,
                start_datetime: formatDateTime(data.start_datetime),
                end_datetime: formatDateTime(data.end_datetime),
                location: data.location,
                max_participants: Number(data.max_participants),
            };
            console.log('Payload:', payload);
            const fm = new FormData();
            fm.append('event_data', JSON.stringify(payload));
            if (files && files.length > 0) {
                files.forEach((file) => {
                    fm.append('files', {
                        uri: file.uri,
                        name: file.name,
                        type: file.type || 'application/octet-stream',
                    });
                });
            }

            let response;
            if (isUpdate) {
                response = await updateEvent(data.id, fm);
                Alert.alert(
                    languageTexts?.createEvent?.success?.titleUpdate || 'Success',
                    languageTexts?.createEvent?.success?.messageUpdate || 'Event updated successfully!',
                    [
                        {
                            text: languageTexts?.common?.ok || 'OK',
                            onPress: () => navigation.navigate('EventCalendar', { refresh: true }),
                        },
                    ],
                    { cancelable: false }
                );
            } else {
                response = await createEvent(fm);
                Alert.alert(
                    languageTexts?.createEvent?.success?.title || 'Success',
                    languageTexts?.createEvent?.success?.message || 'Event created successfully!',
                    [
                        {
                            text: languageTexts?.common?.ok || 'OK',
                            onPress: () => navigation.navigate('EventCalendar', { refresh: true }),
                        },
                    ],
                    { cancelable: false }
                );
            }
        } catch (error) {
            console.error('Event Operation Error:', error);
            setError(error.message || (languageTexts?.createEvent?.error?.submit || 'Failed to process event. Please try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartDateChange = (date) => {
        setValue('start_datetime', date);
        const endDate = watch('end_datetime');
        if (
            endDate.getFullYear() === start_datetime.getFullYear() &&
            endDate.getMonth() === start_datetime.getMonth() &&
            endDate.getDate() === start_datetime.getDate()
        ) {
            const newEnd = new Date(date);
            newEnd.setHours(endDate.getHours(), endDate.getMinutes(), endDate.getSeconds(), endDate.getMilliseconds());
            setValue('end_datetime', newEnd);
        } else if (date > endDate) {
            const newEnd = new Date(date);
            newEnd.setHours(endDate.getHours(), endDate.getMinutes(), endDate.getSeconds(), endDate.getMilliseconds());
            setValue('end_datetime', newEnd);
        }
    };

    const handleEndDateChange = (date) => {
        setValue('end_datetime', date);
    };

    return (
        <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('EventCalendar')}
                >
                    <Icon name="arrow-back" size={24} color="#fff" />
                    {/* <Text style={styles.backButtonText}>{languageTexts?.common?.back || '< Back'}</Text> */}
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.headerText}>
                        {isUpdate
                            ? languageTexts?.createEvent?.updateEvent || 'Update Event'
                            : languageTexts?.createEvent?.createEvent || 'Create Event'}
                    </Text>
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.label}>{languageTexts?.createEvent?.title || 'Title'} <Text style={{ color: 'red' }}>*</Text></Text>
                    <Controller
                        control={control}
                        name="title"
                        rules={{ required: languageTexts?.createEvent?.error?.title || 'Title is required' }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, errors.title && styles.inputError]}
                                value={value}
                                onChangeText={onChange}
                                placeholder={languageTexts?.createEvent?.placeholder?.title || 'Enter event title'}
                                placeholderTextColor="#999"
                            />
                        )}
                    />
                    {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

                    <Text style={styles.label}>{languageTexts?.createEvent?.description || 'Description'} <Text style={{ color: 'red' }}>*</Text></Text>
                    <Controller
                        control={control}
                        name="description"
                        rules={{ required: languageTexts?.createEvent?.error?.description || 'Description is required' }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, styles.multilineInput, errors.description && styles.inputError]}
                                value={value}
                                onChangeText={onChange}
                                placeholder={languageTexts?.createEvent?.placeholder?.description || 'Enter event description'}
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={4}
                            />
                        )}
                    />
                    {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}

                    <View style={styles.switchContainer}>
                        <Text style={styles.label}>{languageTexts?.createEvent?.allDay || 'All Day'}</Text>
                        <Controller
                            control={control}
                            name="all_day"
                            render={({ field: { value, onChange } }) => (
                                <Switch
                                    value={value}
                                    onValueChange={(newValue) => {
                                        onChange(newValue);
                                        if (newValue) {
                                            const now = new Date();
                                            const startDate = new Date(now);
                                            startDate.setHours(9, 0, 0, 0);
                                            const endDate = new Date(now);
                                            endDate.setHours(23, 59, 0, 0);
                                            setValue('start_datetime', startDate);
                                            setValue('end_datetime', endDate);
                                        } else {
                                            const now = new Date();
                                            setValue('start_datetime', now);
                                            setValue('end_datetime', new Date(now.getTime() + 3600000));
                                        }
                                    }}
                                    trackColor={{ false: '#767577', true: '#2753b2' }}
                                    thumbColor={value ? '#FFF' : '#f4f3f4'}
                                />
                            )}
                        />
                    </View>

                    <Text style={styles.label}>{languageTexts?.createEvent?.startDateTime || 'Start Date & Time'}</Text>
                    <View style={styles.dateTimeRow}>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setStartDatePickerVisible(true)}
                        >
                            <Text style={styles.dateText}>{formatDisplayDate(start_datetime)}</Text>
                        </TouchableOpacity>
                        {!all_day && (
                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => setStartTimePickerVisible(true)}
                            >
                                <Text style={styles.dateText}>{formatDisplayTime(start_datetime)}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <DateTimePickerModal
                        isVisible={isStartDatePickerVisible}
                        mode="date"
                        date={start_datetime}
                        onConfirm={(date) => {
                            handleStartDateChange(date);
                            setStartDatePickerVisible(false);
                        }}
                        onCancel={() => setStartDatePickerVisible(false)}
                        is24Hour={false}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        minimumDate={new Date()}
                    />
                    <DateTimePickerModal
                        isVisible={isStartTimePickerVisible}
                        mode="time"
                        date={start_datetime}
                        onConfirm={(date) => {
                            setValue('start_datetime', date);
                            setStartTimePickerVisible(false);
                        }}
                        onCancel={() => setStartTimePickerVisible(false)}
                        is24Hour={false}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    />

                    <Text style={styles.label}>{languageTexts?.createEvent?.endDateTime || 'End Date & Time'}</Text>
                    <View style={styles.dateTimeRow}>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setEndDatePickerVisible(true)}
                        >
                            <Text style={styles.dateText}>{formatDisplayDate(end_datetime)}</Text>
                        </TouchableOpacity>
                        {!all_day && (
                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => setEndTimePickerVisible(true)}
                            >
                                <Text style={styles.dateText}>{formatDisplayTime(end_datetime)}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <DateTimePickerModal
                        isVisible={isEndDatePickerVisible}
                        mode="date"
                        date={end_datetime}
                        onConfirm={(date) => {
                            handleEndDateChange(date);
                            setEndDatePickerVisible(false);
                        }}
                        onCancel={() => setEndDatePickerVisible(false)}
                        is24Hour={false}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        minimumDate={new Date()}
                    />
                    <DateTimePickerModal
                        isVisible={isEndTimePickerVisible}
                        mode="time"
                        date={end_datetime}
                        onConfirm={(date) => {
                            setValue('end_datetime', date);
                            setEndTimePickerVisible(false);
                        }}
                        onCancel={() => setEndTimePickerVisible(false)}
                        is24Hour={false}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    />

                    <Text style={styles.label}>{languageTexts?.createEvent?.location || 'Location'} <Text style={{ color: 'red' }}>*</Text></Text>
                    <Controller
                        control={control}
                        name="location"
                        rules={{ required: languageTexts?.createEvent?.error?.location || 'Location is required' }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, errors.location && styles.inputError]}
                                value={value}
                                onChangeText={onChange}
                                placeholder={languageTexts?.createEvent?.placeholder?.location || 'Enter event location'}
                                placeholderTextColor="#999"
                            />
                        )}
                    />
                    {errors.location && <Text style={styles.errorText}>{errors.location.message}</Text>}

                    <Text style={styles.label}>{languageTexts?.createEvent?.maxParticipants || 'Max-Participants'}</Text>
                    <Controller
                        control={control}
                        name="max_participants"
                        rules={{
                            required: languageTexts?.createEvent?.error?.maxParticipants || 'Max participants is required',
                            pattern: {
                                value: /^[0-9]+$/,
                                message: languageTexts?.createEvent?.error?.maxParticipantsInvalid || 'Must be a positive number',
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, errors.max_participants && styles.inputError]}
                                value={value}
                                onChangeText={(val) => {
                                    const cleaned = val.replace(/[^0-9]/g, '');
                                    onChange(cleaned);
                                }}
                                placeholder={languageTexts?.createEvent?.placeholder?.maxParticipants || 'Enter max participants'}
                                placeholderTextColor="#999"
                                keyboardType="number-pad"
                            />
                        )}
                    />
                    {errors.max_participants && <Text style={styles.errorText}>{errors.max_participants.message}</Text>}

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.buttonText}>
                                {isUpdate
                                    ? languageTexts?.createEvent?.update || 'Update'
                                    : languageTexts?.createEvent?.submit || 'Submit'}
                            </Text>
                        )}
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
    scrollContainer: {
        flexGrow: 1,
        padding: 15,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 80,
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
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#f9f9f9',
        marginBottom: 10,
    },
    inputError: {
        borderColor: '#ff6b6b',
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    dateTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    dateButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f9f9f9',
        marginRight: 5,
    },
    timeButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f9f9f9',
        marginLeft: 5,
    },
    dateText: {
        fontSize: 14,
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#2753b2',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.6,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 14,
        marginBottom: 10,
        textAlign: 'center',
    },
});

export default CreateEvent;