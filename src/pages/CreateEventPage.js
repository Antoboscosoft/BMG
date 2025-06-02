import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Switch, Button, Alert, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateEventPage = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [allDay, setAllDay] = useState(false);
    const [startDateTime, setStartDateTime] = useState(new Date());
    const [endDateTime, setEndDateTime] = useState(new Date());

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const handleCreate = () => {
        if (!title || !startDateTime || !location) {
            Alert.alert('Validation', 'Title, Start Time, and Location are required.');
            return;
        }

        const newEvent = {
            title,
            description,
            all_day: allDay,
            start_datetime: startDateTime.toISOString(),
            end_datetime: endDateTime ? endDateTime.toISOString() : '',
            location,
        };

        navigation.goBack(); // Or navigate to calendar
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Title*</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Event title" />

            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.textArea} value={description} onChangeText={setDescription} multiline numberOfLines={4} />

            <Text style={styles.label}>All Day Event</Text>
            <Switch value={allDay} onValueChange={setAllDay} />

            <Text style={styles.label}>Start Date & Time*</Text>
            <TouchableOpacity onPress={() => setShowStartPicker(true)}>
                <Text style={styles.datetime}>{startDateTime.toLocaleString()}</Text>
            </TouchableOpacity>

            {showStartPicker && (
                <DateTimePicker
                    value={startDateTime}
                    mode="datetime"
                    display="default"
                    onChange={(event, date) => {
                        if (date) {
                            setStartDateTime(date);
                        }
                        setShowStartPicker(false);
                    }}
                />
            )}

            <Text style={styles.label}>End Date & Time</Text>
            <TouchableOpacity onPress={() => setShowEndPicker(true)}>
                <Text style={styles.datetime}>{endDateTime.toLocaleString()}</Text>
            </TouchableOpacity>

            {showEndPicker && (
                <DateTimePicker
                    value={endDateTime}
                    mode="datetime"
                    display="default"
                    onChange={(event, date) => {
                        if (date) {
                            setEndDateTime(date);
                        }
                        setShowEndPicker(false);
                    }}

                />
            )}

            <Text style={styles.label}>Location*</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Event venue" />

            <View style={{ marginTop: 30 }}>
                <Button title="Create Event" onPress={handleCreate} color="#2753b2" />
            </View>
        </View>
    );
};

export default CreateEventPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F7FA',
    },
    label: {
        fontWeight: 'bold',
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        padding: 10,
        marginTop: 5,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        padding: 10,
        height: 100,
        marginTop: 5,
    },
    datetime: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        marginTop: 5,
        color: '#333',
    },
});











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