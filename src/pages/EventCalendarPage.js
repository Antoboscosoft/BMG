import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    ScrollView,
    TextInput,
    Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';

function EventCalendarPage({ navigation }) {
    const [selectedDate, setSelectedDate] = useState('2025-05-16');
    const [fadeAnim] = useState(new Animated.Value(0));
    const [modalVisible, setModalVisible] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const [newEvent, setNewEvent] = useState({
        title: '',
        time: new Date(),
        location: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
    });

    const [events, setEvents] = useState({
        '2025-05-16': [
            {
                id: '1',
                title: 'Legal Consultation',
                date: '2025-05-16',
                time: '10:00 AM',
                location: 'Community Center',
                description: 'Free legal advice session for migrant workers.',
                startDate: '2025-05-16T10:00:00',
                endDate: '2025-05-16T11:00:00',
            },
        ],
        '2025-05-18': [
            {
                id: '2',
                title: 'Job Fair',
                date: '2025-05-18',
                time: '9:00 AM - 3:00 PM',
                location: 'City Hall',
                description: 'Meet employers hiring for construction and hospitality roles.',
                startDate: '2025-05-19T10:00:00',
                endDate: '2025-05-19T11:00:00',
            },
        ],
    });

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const markedDates = Object.keys(events).reduce((acc, date) => {
        acc[date] = { marked: true, dotColor: '#2753b2' };
        if (date === selectedDate) {
            acc[date].selected = true;
            acc[date].selectedColor = '#2753b2';
        }
        return acc;
    }, {});

    const selectedEvents = events[selectedDate] || [];

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleCreateEvent = () => {
        const newEventId = Date.now().toString();
        const eventToAdd = {
            id: newEventId,
            ...newEvent,
            date: selectedDate,
            time: formatTime(newEvent.time),
            startDate: newEvent.startDate.toISOString(),
            endDate: newEvent.endDate.toISOString(),
        };

        setEvents(prev => ({
            ...prev,
            [selectedDate]: [...(prev[selectedDate] || []), eventToAdd],
        }));

        setNewEvent({
            title: '',
            time: new Date(),
            location: '',
            description: '',
            startDate: new Date(),
            endDate: new Date(),
        });
        setModalVisible(false);
    };

    const handleTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setNewEvent(prev => ({
                ...prev,
                time: selectedTime,
            }));
        }
    };

    const handleStartDateChange = (event, selectedDate) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setNewEvent(prev => ({
                ...prev,
                startDate: selectedDate,
            }));
        }
    };

    const handleEndDateChange = (event, selectedDate) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setNewEvent(prev => ({
                ...prev,
                endDate: selectedDate,
            }));
        }
    };


    // const handleCreateEvent = () => {
    //     const newEventId = Date.now().toString();
    //     const eventToAdd = {
    //         id: newEventId,
    //         ...newEvent,
    //         date: selectedDate,
    //     };
    //     setEvents(prev => ({
    //         ...prev,
    //         [selectedDate]: [...(prev[selectedDate] || []), eventToAdd],
    //     }));
    //     setNewEvent({ title: '', time: '', location: '', description: '' });
    //     setModalVisible(false);
    // };

    return (
        <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
            <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Dashboard')}>
                        <Text style={styles.backButtonText}>{'< Back'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.titleText}>Event Calendar</Text>
                    <View style={{ width: 60 }} />
                </View>

                <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    <Text style={styles.subtitleText}>View upcoming events and activities.</Text>

                    <View style={styles.calendarContainer}>
                        <Calendar
                            current={selectedDate}
                            onDayPress={(day) => setSelectedDate(day.dateString)}
                            markedDates={markedDates}
                            theme={{
                                calendarBackground: 'rgba(255, 255, 255, 0.9)',
                                textSectionTitleColor: '#333',
                                dayTextColor: '#333',
                                todayTextColor: '#2753b2',
                                selectedDayTextColor: '#FFF',
                                selectedDayBackgroundColor: '#2753b2',
                                monthTextColor: '#2753b2',
                                textMonthFontSize: 18,
                                textMonthFontWeight: 'bold',
                                arrowColor: '#2753b2',
                                textDayHeaderFontWeight: '500',
                                textDayFontWeight: '500',
                                'stylesheet.calendar.header': {
                                    monthText: {
                                        backgroundColor: 'rgba(39, 83, 178, 0.7)',
                                        padding: 10,
                                        borderRadius: 20,
                                        overflow: 'hidden',
                                        color: '#FFF',
                                    }
                                }
                            }}
                            style={styles.calendarStyle}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.createButtonText}>+ Create Event</Text>
                    </TouchableOpacity>

                    {/* <View style={styles.eventList}>
                        {selectedEvents.length > 0 ? (
                            selectedEvents.map((event) => (
                                <TouchableOpacity
                                    key={event.id}
                                    style={styles.eventItem}
                                >
                                    <Text style={styles.eventTitle}>{event.title}</Text>
                                    <Text style={styles.eventDetail}>
                                        <Text style={styles.eventDetailValue}>Date: </Text>{event.date}
                                    </Text>
                                    <Text style={styles.eventDetail}>
                                        <Text style={styles.eventDetailValue}>Time: </Text>{event.time}
                                    </Text>
                                    <Text style={styles.eventDetail}>
                                        <Text style={styles.eventDetailValue}>Location: </Text>{event.location}
                                    </Text>
                                    <Text style={styles.eventDescription}>{event.description}</Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.noEventsText}>No events scheduled for this date.</Text>
                        )}
                    </View> */}
                    <View style={styles.eventList}>
                        {selectedEvents.length > 0 ? (
                            selectedEvents.map((event) => {
                                // Format the dates for display
                                const startDate = new Date(event.startDate);
                                const endDate = new Date(event.endDate);
                                const formattedStart = startDate.toLocaleDateString() + ' ' + startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                const formattedEnd = endDate.toLocaleDateString() + ' ' + endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                return (
                                    <TouchableOpacity
                                        key={event.id}
                                        style={styles.eventItem}
                                    >
                                        <Text style={styles.eventTitle}>{event.title}</Text>
                                        <Text style={styles.eventDetail}>
                                            <Text style={styles.eventDetailValue}>Date: </Text>
                                            {event.date}
                                        </Text>
                                        <Text style={styles.eventDetail}>
                                            <Text style={styles.eventDetailValue}>Time: </Text>
                                            {event.time}
                                        </Text>
                                        <Text style={styles.eventDetail}>
                                            <Text style={styles.eventDetailValue}>Start: </Text>
                                            {formattedStart}
                                        </Text>
                                        <Text style={styles.eventDetail}>
                                            <Text style={styles.eventDetailValue}>End: </Text>
                                            {formattedEnd}
                                        </Text>
                                        <Text style={styles.eventDetail}>
                                            <Text style={styles.eventDetailValue}>Location: </Text>
                                            {event.location}
                                        </Text>
                                        <Text style={styles.eventDescription}>{event.description}</Text>
                                    </TouchableOpacity>
                                );
                            })
                        ) : (
                            <Text style={styles.noEventsText}>No events scheduled for this date.</Text>
                        )}
                    </View>
                </ScrollView>

                {/* Modal for creating event */}
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Create Event</Text>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Event Title</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Title"
                                    value={newEvent.title}
                                    onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Time</Text>
                                {/* <TextInput
                                style={styles.input}
                                placeholder="Time"
                                value={newEvent.time}
                                onChangeText={(text) => setNewEvent({ ...newEvent, time: text })}
                                /> */}
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Text style={styles.dateInputText}>
                                        {formatTime(newEvent.time)}
                                    </Text>
                                </TouchableOpacity>
                                {showTimePicker && (
                                    <DateTimePicker
                                        value={newEvent.time}
                                        mode="time"
                                        display="default"
                                        onChange={handleTimeChange}
                                    />
                                )}
                            </View>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Start Date & Time</Text>
                                <View style={[styles.dateInput, styles.disabledInput]}>
                                    <Text style={[styles.dateInputText, { opacity: 0.5 }]}>
                                        {formatDate(newEvent.startDate)} {formatTime(newEvent.startDate)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>End Date & Time</Text>
                                <View style={[styles.dateInput, styles.disabledInput]}>
                                    <Text style={[styles.dateInputText, { opacity: 0.5 }]}>
                                        {formatDate(newEvent.endDate)} {formatTime(newEvent.endDate)}
                                    </Text>
                                </View>
                            </View>
                            {/* <TouchableOpacity
                                style={[styles.dateInput, { opacity: 0.5 }]}
                                onPress={() => setShowStartDatePicker(true)}
                                disabled
                            >
                                <Text style={styles.dateInputText}>
                                   {formatDate(newEvent.startDate)} {formatTime(newEvent.startDate)}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.dateInput, { opacity: 0.5 }]}
                                onPress={() => setShowEndDatePicker(true)}
                                disabled
                            >
                                <Text style={styles.dateInputText}>
                                 {formatDate(newEvent.endDate)} {formatTime(newEvent.endDate)}
                                </Text>
                            </TouchableOpacity> */}

                            {showStartDatePicker && (
                                <DateTimePicker
                                    value={newEvent.startDate}
                                    mode="datetime"
                                    display="default"
                                    onChange={handleStartDateChange}
                                    disabled
                                />
                            )}

                            {showEndDatePicker && (
                                <DateTimePicker
                                    value={newEvent.endDate}
                                    mode="datetime"
                                    display="default"
                                    onChange={handleEndDateChange}
                                    minimumDate={newEvent.startDate}
                                />
                            )}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Location</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Location"
                                    value={newEvent.location}
                                    onChangeText={(text) => setNewEvent({ ...newEvent, location: text })}
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Description</Text>
                                <TextInput
                                    style={[styles.input, { height: 45 }]}
                                    placeholder="Description"
                                    multiline
                                    value={newEvent.description}
                                    onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
                                />
                            </View>

                            <Text style={styles.modalDate}>Date: {selectedDate}</Text>

                            <View style={styles.modalActions}>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleCreateEvent} style={styles.saveButton}>
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </Animated.View>
        </LinearGradient>
    );
}

export default EventCalendarPage;

const styles = StyleSheet.create({
    container: { flex: 1 },
    innerContainer: { flex: 1 },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    inputContainer: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    titleText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },
    subtitleText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#F0F0F0',
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 22,
    },
    calendarContainer: {
        width: '100%',
        marginBottom: 20,
    },
    calendarStyle: {
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    createButton: {
        backgroundColor: '#FFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginBottom: 15,
        alignSelf: 'center',
        elevation: 3,
    },
    createButtonText: {
        color: '#2753b2',
        fontWeight: 'bold',
        fontSize: 16,
    },
    eventList: {
        width: '100%',
    },
    eventItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    eventDetail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    eventDetailValue: {
        fontSize: 14,
        color: '#3d31e6',
    },
    eventDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    noEventsText: {
        fontSize: 16,
        color: '#FFF',
        textAlign: 'center',
        marginTop: 20,
    },

    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    modalDate: {
        fontSize: 14,
        color: '#444',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#2753b2',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    dateInputText: {
        fontSize: 16,
    },
});
