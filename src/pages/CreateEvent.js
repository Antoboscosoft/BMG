import React, { useState } from 'react';
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
// import DocumentPicker from 'react-native-document-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useLanguage } from '../language/commondir';
import { createEvent } from '../api/auth';
import { useForm, Controller } from 'react-hook-form';

function CreateEvent({ navigation, route }) {
    const { languageTexts } = useLanguage();
    const { userData } = route.params || {};
    const isAdmin = userData?.data?.role?.name === "Super Admin" || userData?.data?.role?.name === "Admin";
    console.log('User Data:', isAdmin);
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
            title: '',
            description: '',
            all_day: false,
            // start_datetime: new Date(),
            start_datetime: defaultStart,
            // end_datetime: new Date(),
            end_datetime: defaultEnd,
            location: '',
            max_participants: '80',
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

    const handleFilePick = async () => {
        try {
            const results = await DocumentPicker.pickMultiple({
                type: [DocumentPicker.types.allFiles],
            });
            setFiles([...files, ...results]);
        } catch (err) {
            if (!DocumentPicker.isCancel(err)) {
                setError(languageTexts?.createEvent?.error?.filePick || 'Failed to pick files');
            }
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const formatDateTime = (date) => {
        return date.toISOString(); // e.g., "2025-05-23T03:30:00.000Z"
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
            if (files || files.length > 0) {
            files.forEach((file) => {
                fm.append('files', {
                    uri: file.uri,
                    name: file.name,
                    type: file.type || 'application/octet-stream',
                });
            });
            }

            const response = await createEvent(fm);
            Alert.alert(
                languageTexts?.createEvent?.success?.title || 'Success',
                languageTexts?.createEvent?.success?.message || 'Event created successfully!',
                [
                    {
                        text: languageTexts?.common?.ok || 'OK',
                        onPress: () => navigation.navigate('EventCalendar', {
                            refresh: true,
                        }),
                    },
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.error('Create Event Error:', error);
            setError(error.message || (languageTexts?.createEvent?.error?.submit || 'Failed to create event. Please try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        {languageTexts?.createEvent?.title?.create || 'Create Event'}
                    </Text>
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.label}>{languageTexts?.createEvent?.title || 'Title'}</Text>
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

                    <Text style={styles.label}>{languageTexts?.createEvent?.description || 'Description'}</Text>
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
                            onValueChange={(newValue) => {
                                onChange(newValue);
                                if (newValue) {
                                    // When All Day is enabled
                                    const now = new Date();
                                    const startDate = new Date(now);
                                    startDate.setHours(9, 0, 0, 0); // Set to 9:00 AM

                                    const endDate = new Date(now);
                                    endDate.setHours(23, 59, 0, 0); // Set to 11:59 PM

                                    setValue('start_datetime', startDate);
                                    setValue('end_datetime', endDate);
                                } else {
                                    // When All Day is disabled, use current time
                                    const now = new Date();
                                    setValue('start_datetime', now);
                                    setValue('end_datetime', new Date(now.getTime() + 3600000)); // 1 hour later
                                }
                            }}
                            render={({ field: { value, onChange } }) => (
                                <Switch
                                    value={value}
                                    onValueChange={onChange}
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
                            setValue('start_datetime', date);
                            setStartDatePickerVisible(false);
                        }}
                        onCancel={() => setStartDatePickerVisible(false)}
                        is24Hour={false}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
                            setValue('end_datetime', date);
                            setEndDatePickerVisible(false);
                        }}
                        onCancel={() => setEndDatePickerVisible(false)}
                        is24Hour={false}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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

                    <Text style={styles.label}>{languageTexts?.createEvent?.location || 'Location'}</Text>
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

                    <Text style={styles.label}>{languageTexts?.createEvent?.maxParticipants || 'Max Participants'}</Text>
                    <Controller
                        control={control}
                        name="max_participants"
                        rules={{
                            required: languageTexts?.createEvent?.error?.maxParticipants || 'Max participants is required',
                            pattern: {
                                value: /^[1-9]\d*$/,
                                message: languageTexts?.createEvent?.error?.maxParticipantsInvalid || 'Must be a positive number',
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={[styles.input, errors.max_participants && styles.inputError]}
                                value={value}
                                onChangeText={onChange}
                                placeholder={languageTexts?.createEvent?.placeholder?.maxParticipants || 'Enter max participants'}
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                            />
                        )}
                    />
                    {errors.max_participants && <Text style={styles.errorText}>{errors.max_participants.message}</Text>}

                    {/* <Text style={styles.label}>{languageTexts?.createEvent?.attachments || 'Attachments'}</Text>
                    <TouchableOpacity style={styles.fileButton} onPress={handleFilePick}>
                        <Text style={styles.fileButtonText}>
                            {languageTexts?.createEvent?.pickFiles || 'Pick Files'}
                        </Text>
                    </TouchableOpacity>
                    {files.length > 0 && (
                        <View style={styles.fileList}>
                            {files.map((file, index) => (
                                <View key={index} style={styles.fileItem}>
                                    <Text style={styles.fileText}>{file.name}</Text>
                                    <TouchableOpacity onPress={() => removeFile(index)}>
                                        <Icon name="close" size={20} color="#ff4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {error && <Text style={styles.errorText}>{error}</Text>} */}

                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.buttonText}>
                                {languageTexts?.createEvent?.submit || 'Submit'}
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
    fileButton: {
        backgroundColor: '#2753b2',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    fileButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    fileList: {
        marginBottom: 10,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    fileText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
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






// import React, { useState } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     ScrollView,
//     TextInput,
//     Switch,
//     Alert,
//     ActivityIndicator,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import DocumentPicker from 'react-native-document-picker';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import { useLanguage } from '../language/commondir';
// import { createEvent } from '../api/auth';

// function CreateEvent({ navigation }) {
//     const { languageTexts } = useLanguage();
//     const [formData, setFormData] = useState({
//         title: '',
//         description: '',
//         all_day: false,
//         start_datetime: new Date(),
//         end_datetime: new Date(),
//         location: '',
//         max_participants: '80',
//     });
//     const [files, setFiles] = useState([]);
//     const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
//     const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
//     const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
//     const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [error, setError] = useState('');

//     const handleInputChange = (key, value) => {
//         setFormData({ ...formData, [key]: value });
//     };

//     const handleFilePick = async () => {
//         try {
//             const results = await DocumentPicker.pickMultiple({
//                 type: [DocumentPicker.types.allFiles],
//             });
//             setFiles([...files, ...results]);
//         } catch (err) {
//             if (!DocumentPicker.isCancel(err)) {
//                 setError(languageTexts?.createEvent?.error?.filePick || 'Failed to pick files');
//             }
//         }
//     };

//     const removeFile = (index) => {
//         setFiles(files.filter((_, i) => i !== index));
//     };

//     const formatDateTime = (date) => {
//         return date.toISOString(); // e.g., "2025-05-23T03:30:00.000Z"
//     };

//     const formatDisplayDate = (date) => {
//         return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
//     };

//     const formatDisplayTime = (date) => {
//         return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
//     };

//     const validateForm = () => {
//         if (!formData.title.trim()) return 'Title is required';
//         if (!formData.description.trim()) return 'Description is required';
//         if (!formData.location.trim()) return 'Location is required';
//         if (!formData.max_participants || isNaN(formData.max_participants) || Number(formData.max_participants) <= 0) {
//             return 'Max participants must be a positive number';
//         }
//         if (formData.end_datetime <= formData.start_datetime) {
//             return 'End date/time must be after start date/time';
//         }
//         return null;
//     };

//     const handleSubmit = async () => {
//         const validationError = validateForm();
//         if (validationError) {
//             setError(languageTexts?.createEvent?.error?.validation || validationError);
//             return;
//         }

//         setError('');
//         setIsSubmitting(true);

//         try {
//             const payload = {
//                 title: formData.title,
//                 description: formData.description,
//                 all_day: formData.all_day,
//                 start_datetime: formatDateTime(formData.start_datetime),
//                 end_datetime: formatDateTime(formData.end_datetime),
//                 location: formData.location,
//                 max_participants: Number(formData.max_participants),
//             };

//             const fm = new FormData();
//             fm.append('event_data', JSON.stringify(payload));
//             files.forEach((file) => {
//                 fm.append('files', {
//                     uri: file.uri,
//                     name: file.name,
//                     type: file.type || 'application/octet-stream',
//                 });
//             });

//             const response = await createEvent(fm);
//             Alert.alert(
//                 languageTexts?.createEvent?.success?.title || 'Success',
//                 languageTexts?.createEvent?.success?.message || 'Event created successfully!',
//                 [
//                     {
//                         text: languageTexts?.common?.ok || 'OK',
//                         onPress: () => navigation.navigate('EventCalendar'),
//                     },
//                 ],
//                 { cancelable: false }
//             );
//         } catch (error) {
//             console.error('Create Event Error:', error);
//             setError(error.message || (languageTexts?.createEvent?.error?.submit || 'Failed to create event. Please try again.'));
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
//             <ScrollView contentContainerStyle={styles.scrollContainer}>
//                 <TouchableOpacity
//                     style={styles.backButton}
//                     onPress={() => navigation.navigate('EventCalendar')}
//                 >
//                     <Text style={styles.backButtonText}>{languageTexts?.common?.back || '< Back'}</Text>
//                 </TouchableOpacity>

//                 <View style={styles.header}>
//                     <Text style={styles.headerText}>
//                         {languageTexts?.createEvent?.title?.create || 'Create Event'}
//                     </Text>
//                 </View>

//                 <View style={styles.contentContainer}>
//                     <Text style={styles.label}>{languageTexts?.createEvent?.title || 'Title'}</Text>
//                     <TextInput
//                         style={styles.input}
//                         value={formData.title}
//                         onChangeText={(text) => handleInputChange('title', text)}
//                         placeholder={languageTexts?.createEvent?.placeholder?.title || 'Enter event title'}
//                         placeholderTextColor="#999"
//                     />

//                     <Text style={styles.label}>{languageTexts?.createEvent?.description || 'Description'}</Text>
//                     <TextInput
//                         style={[styles.input, styles.multilineInput]}
//                         value={formData.description}
//                         onChangeText={(text) => handleInputChange('description', text)}
//                         placeholder={languageTexts?.createEvent?.placeholder?.description || 'Enter event description'}
//                         placeholderTextColor="#999"
//                         multiline
//                         numberOfLines={4}
//                     />

//                     <View style={styles.switchContainer}>
//                         <Text style={styles.label}>{languageTexts?.createEvent?.allDay || 'All Day'}</Text>
//                         <Switch
//                             value={formData.all_day}
//                             onValueChange={(value) => handleInputChange('all_day', value)}
//                             trackColor={{ false: '#767577', true: '#2753b2' }}
//                             thumbColor={formData.all_day ? '#FFF' : '#f4f3f4'}
//                         />
//                     </View>

//                     <Text style={styles.label}>{languageTexts?.createEvent?.startDateTime || 'Start Date & Time'}</Text>
//                     <View style={styles.dateTimeRow}>
//                         <TouchableOpacity
//                             style={styles.dateButton}
//                             onPress={() => setStartDatePickerVisible(true)}
//                         >
//                             <Text style={styles.dateText}>{formatDisplayDate(formData.start_datetime)}</Text>
//                         </TouchableOpacity>
//                         {!formData.all_day && (
//                             <TouchableOpacity
//                                 style={styles.timeButton}
//                                 onPress={() => setStartTimePickerVisible(true)}
//                             >
//                                 <Text style={styles.dateText}>{formatDisplayTime(formData.start_datetime)}</Text>
//                             </TouchableOpacity>
//                         )}
//                     </View>
//                     <DateTimePickerModal
//                         isVisible={isStartDatePickerVisible}
//                         mode="date"
//                         date={formData.start_datetime}
//                         onConfirm={(date) => {
//                             handleInputChange('start_datetime', date);
//                             setStartDatePickerVisible(false);
//                         }}
//                         onCancel={() => setStartDatePickerVisible(false)}
//                     />
//                     <DateTimePickerModal
//                         isVisible={isStartTimePickerVisible}
//                         mode="time"
//                         date={formData.start_datetime}
//                         onConfirm={(date) => {
//                             handleInputChange('start_datetime', date);
//                             setStartTimePickerVisible(false);
//                         }}
//                         onCancel={() => setStartTimePickerVisible(false)}
//                     />

//                     <Text style={styles.label}>{languageTexts?.createEvent?.endDateTime || 'End Date & Time'}</Text>
//                     <View style={styles.dateTimeRow}>
//                         <TouchableOpacity
//                             style={styles.dateButton}
//                             onPress={() => setEndDatePickerVisible(true)}
//                         >
//                             <Text style={styles.dateText}>{formatDisplayDate(formData.end_datetime)}</Text>
//                         </TouchableOpacity>
//                         {!formData.all_day && (
//                             <TouchableOpacity
//                                 style={styles.timeButton}
//                                 onPress={() => setEndTimePickerVisible(true)}
//                             >
//                                 <Text style={styles.dateText}>{formatDisplayTime(formData.end_datetime)}</Text>
//                             </TouchableOpacity>
//                         )}
//                     </View>
//                     <DateTimePickerModal
//                         isVisible={isEndDatePickerVisible}
//                         mode="date"
//                         date={formData.end_datetime}
//                         onConfirm={(date) => {
//                             handleInputChange('end_datetime', date);
//                             setEndDatePickerVisible(false);
//                         }}
//                         onCancel={() => setEndDatePickerVisible(false)}
//                     />
//                     <DateTimePickerModal
//                         isVisible={isEndTimePickerVisible}
//                         mode="time"
//                         date={formData.end_datetime}
//                         onConfirm={(date) => {
//                             handleInputChange('end_datetime', date);
//                             setEndTimePickerVisible(false);
//                         }}
//                         onCancel={() => setEndTimePickerVisible(false)}
//                     />

//                     <Text style={styles.label}>{languageTexts?.createEvent?.location || 'Location'}</Text>
//                     <TextInput
//                         style={styles.input}
//                         value={formData.location}
//                         onChangeText={(text) => handleInputChange('location', text)}
//                         placeholder={languageTexts?.createEvent?.placeholder?.location || 'Enter event location'}
//                         placeholderTextColor="#999"
//                     />

//                     <Text style={styles.label}>{languageTexts?.createEvent?.maxParticipants || 'Max Participants'}</Text>
//                     <TextInput
//                         style={styles.input}
//                         value={formData.max_participants}
//                         onChangeText={(text) => handleInputChange('max_participants', text)}
//                         placeholder={languageTexts?.createEvent?.placeholder?.maxParticipants || 'Enter max participants'}
//                         placeholderTextColor="#999"
//                         keyboardType="numeric"
//                     />

//                     <Text style={styles.label}>{languageTexts?.createEvent?.attachments || 'Attachments'}</Text>
//                     <TouchableOpacity style={styles.fileButton} onPress={handleFilePick}>
//                         <Text style={styles.fileButtonText}>
//                             {languageTexts?.createEvent?.pickFiles || 'Pick Files'}
//                         </Text>
//                     </TouchableOpacity>
//                     {files.length > 0 && (
//                         <View style={styles.fileList}>
//                             {files.map((file, index) => (
//                                 <View key={index} style={styles.fileItem}>
//                                     <Text style={styles.fileText}>{file.name}</Text>
//                                     <TouchableOpacity onPress={() => removeFile(index)}>
//                                         <Icon name="close" size={20} color="#ff4444" />
//                                     </TouchableOpacity>
//                                 </View>
//                             ))}
//                         </View>
//                     )}

//                     {error && <Text style={styles.errorText}>{error}</Text>}

//                     <TouchableOpacity
//                         style={[styles.submitButton, isSubmitting && styles.disabledButton]}
//                         onPress={handleSubmit}
//                         disabled={isSubmitting}
//                     >
//                         {isSubmitting ? (
//                             <ActivityIndicator color="#FFF" />
//                         ) : (
//                             <Text style={styles.buttonText}>
//                                 {languageTexts?.createEvent?.submit || 'Submit'}
//                             </Text>
//                         )}
//                     </TouchableOpacity>
//                 </View>
//             </ScrollView>
//         </LinearGradient>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     scrollContainer: {
//         flexGrow: 1,
//         padding: 15,
//     },
//     backButton: {
//         position: 'absolute',
//         top: 20,
//         left: 20,
//         padding: 10,
//         backgroundColor: 'rgba(255, 255, 255, 0.2)',
//         borderRadius: 8,
//         zIndex: 1,
//     },
//     backButtonText: {
//         fontSize: 16,
//         color: '#FFF',
//         fontWeight: 'bold',
//     },
//     header: {
//         alignItems: 'center',
//         paddingTop: 60,
//         paddingBottom: 20,
//     },
//     headerText: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: '#ffffff',
//     },
//     contentContainer: {
//         marginTop: 20,
//         padding: 20,
//         backgroundColor: '#FFF',
//         borderRadius: 10,
//         elevation: 3,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//     },
//     label: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#333',
//         marginBottom: 8,
//         marginTop: 10,
//     },
//     input: {
//         borderWidth: 1,
//         borderColor: '#ddd',
//         borderRadius: 8,
//         padding: 12,
//         fontSize: 14,
//         color: '#333',
//         backgroundColor: '#f9f9f9',
//         marginBottom: 10,
//     },
//     multilineInput: {
//         height: 100,
//         textAlignVertical: 'top',
//     },
//     switchContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         marginBottom: 10,
//     },
//     dateTimeRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 10,
//     },
//     dateButton: {
//         flex: 1,
//         borderWidth: 1,
//         borderColor: '#ddd',
//         borderRadius: 8,
//         padding: 12,
//         backgroundColor: '#f9f9f9',
//         marginRight: 5,
//     },
//     timeButton: {
//         flex: 1,
//         borderWidth: 1,
//         borderColor: '#ddd',
//         borderRadius: 8,
//         padding: 12,
//         backgroundColor: '#f9f9f9',
//         marginLeft: 5,
//     },
//     dateText: {
//         fontSize: 14,
//         color: '#333',
//     },
//     fileButton: {
//         backgroundColor: '#2753b2',
//         padding: 12,
//         borderRadius: 8,
//         alignItems: 'center',
//         marginBottom: 10,
//     },
//     fileButtonText: {
//         color: '#FFF',
//         fontSize: 14,
//         fontWeight: '600',
//     },
//     fileList: {
//         marginBottom: 10,
//     },
//     fileItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         padding: 8,
//         borderBottomWidth: 1,
//         borderBottomColor: '#eee',
//     },
//     fileText: {
//         fontSize: 14,
//         color: '#333',
//         flex: 1,
//     },
//     submitButton: {
//         backgroundColor: '#2753b2',
//         padding: 15,
//         borderRadius: 8,
//         alignItems: 'center',
//         marginTop: 20,
//     },
//     buttonText: {
//         color: '#FFF',
//         fontSize: 16,
//         fontWeight: 'bold',
//     },
//     disabledButton: {
//         opacity: 0.6,
//     },
//     errorText: {
//         color: '#ff6b6b',
//         fontSize: 14,
//         marginBottom: 10,
//         textAlign: 'center',
//     },
// });

// export default CreateEvent;