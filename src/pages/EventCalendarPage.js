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
import moment from 'moment';
// import Toast from 'react-native-toast-message';
import Toast from 'react-native-simple-toast'; // Changed import
import { getEvents } from '../api/auth';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Add this import

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
                startDate: '2025-05-18T10:00:00',
                endDate: '2025-05-18T11:00:00',
            },
        ],
        '2025-05-18': [
            {
                id: '0',
                title: 'Job Fair',
                date: '2025-05-18',
                time: '9:00 AM - 3:00 PM',
                location: 'City Hall',
                description: 'Meet employers hiring for construction and hospitality roles.',
                startDate: '2025-05-18T10:00:00',
                endDate: '2025-05-18T11:00:00',
            },
        ],
        '2025-05-20': [
            {
                id: '3',
                title: 'Job Fair',
                date: '2025-05-16',
                time: '10:00 AM',
                location: 'Community Center',
                description: 'Free legal advice session for migrant workers.',
                startDate: '2025-05-20T10:00:00',
                endDate: '2025-05-21T11:00:00',
            },
            {
                id: '4',
                title: 'Cultural Festival',
                date: '2025-05-16',
                time: '10:00 AM',
                location: 'Community Center',
                description: 'Free legal advice session for migrant workers.',
                startDate: '2025-05-20T10:00:00',
                endDate: '2025-05-20T11:00:00',
            },
            {
                id: '5',
                title: 'Legal Consultation',
                date: '2025-05-16',
                time: '10:00 AM',
                location: 'Community Center',
                description: 'Free legal advice session for migrant workers.',
                startDate: '2025-05-20T10:00:00',
                endDate: '2025-05-22T11:00:00',
            },
        ],
        '2025-05-23': [
            {
                id: '6',
                title: 'Legal Consultation',
                date: '2025-05-16',
                time: '10:00 AM',
                location: 'Community Center',
                description: 'Free legal advice session for migrant workers.',
                startDate: '2025-05-23T10:00:00',
                endDate: '2025-05-24T11:00:00',
            },
            {
                id: '7',
                title: 'Cultural Festival',
                date: '2025-05-16',
                time: '10:00 AM',
                location: 'Community Center',
                description: 'Free legal advice session for migrant workers.',
                startDate: '2025-05-23T10:00:00',
                endDate: '2025-05-23T11:00:00',
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


    const fetchEvents = async () => {
        try {
            // setLoading(true);
            const response = await getEvents();
            console.log('API Response Events:', response);
            if (response.status && response.data) {
                // Transform API data to match our UI structure
                const formattedEvents = {};

                response.data.forEach(event => {
                    const eventDate = event.start_datetime.split('T')[0];
                    const formattedEvent = {
                        id: event.id.toString(),
                        title: event.title,
                        description: event.description,
                        location: event.location,
                        startDate: event.start_datetime,
                        endDate: event.end_datetime,
                        registered: event.registered
                    };

                    if (!formattedEvents[eventDate]) {
                        formattedEvents[eventDate] = [];
                    }
                    formattedEvents[eventDate].push(formattedEvent);
                });

                setEvents(formattedEvents);
            } else {
                throw new Error(response.details || 'Failed to fetch events');
            }
        } catch (err) {
            console.error('Failed to fetch events:', err);
            setError(err.message);
            Toast.show(err.message, Toast.LONG);
        } finally {
            // setLoading(false);
        }
    };

    console.log('Events:', events);


    useEffect(() => {
        // Fetch events when the component mounts
        fetchEvents();
    }, []);

    const selectedEvents = events[selectedDate] || [];

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

    // Format date range for display
    const formatDateRange = (start, end) => {
        const startMoment = moment(start);
        const endMoment = moment(end);


        if (startMoment.isSame(endMoment, 'day')) {
            // Same day event only
            // return `${startMoment.format('MMM D, YYYY')}\n${startMoment.format('h:mm A')} - ${endMoment.format('h:mm A')}`;
            return `${startMoment.format('MMM D, YYYY')}, ${startMoment.format('h:mm A')} - ${endMoment.format('h:mm A')}`;
        } else {
            // Multi-day event
            return `${startMoment.format('MMM D')} - ${endMoment.format('MMM D, YYYY')}`;
        }
    };

    // Enhanced date and time formatting
    const formatEventDateTime = (start, end) => {
        const startMoment = moment(start);
        const endMoment = moment(end);


        if (startMoment.isSame(endMoment, 'day')) {
            // Same day - show date once with time range
            return {
                date: startMoment.format('MMM D, YYYY'),
                time: `${startMoment.format('h:mm A')} - ${endMoment.format('h:mm A')}`
            };
        } else {
            // Multi-day event - show date range
            return {
                date: `${startMoment.format('MMM D')} - ${endMoment.format('MMM D, YYYY')}`,
                time: `${startMoment.format('h:mm A')} - ${endMoment.format('h:mm A')}`
            };
        }
    };


    // Handle registration button click
    // const handleRegister = (eventTitle) => {
    //             Toast.show(`You have registered for "${eventTitle}"`, Toast.LONG);
    // };

    // In your EventCalendarPage.js, modify the handleRegister function:
    // const handleRegister = (event) => {
    //     navigation.navigate('CreateRegister', {
    //         eventData: {
    //             id: event.id,
    //             title: event.title,
    //             description: event.description,
    //             location: event.location,
    //             isRegistered: false
    //         }
    //     });
    // };

    // const handleRegistered = (event) => {
    //     navigation.navigate('CreateRegister', { 
    //         eventData: {
    //             id: event.id,
    //             title: event.title,
    //             description: event.description,
    //             location: event.location,
    //             currentStatus: event.registered,
    //             isRegistered: true
    //         } 
    //     });
    // };


    const handleRegister = (event) => {
        try {
            if (!event?.id) {
                throw new Error('Invalid event data');
            }
            navigation.navigate('CreateRegister', {
                eventData: {
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    location: event.location,
                    isRegistered: false
                }
            });
        } catch (error) {
            console.error('Registration Error:', error);
            Toast.show('Failed to start registration. Please try again.', Toast.LONG);
        }
    };

    const handleRegistered = (event) => {
        try {
            if (!event?.id) {
                throw new Error('Invalid event data');
            }
            navigation.navigate('CreateRegister', {
                eventData: {
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    location: event.location,
                    currentStatus: event.registered?.status?.toLowerCase() || 'maybe',
                    isRegistered: true
                }
            });
        } catch (error) {
            console.error('Registered Event Error:', error);
            Toast.show('Failed to view registration. Please try again.', Toast.LONG);
        }
    };


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
                    <View style={styles.eventsContainer}>
                        {selectedEvents.length > 0 ? (
                            selectedEvents.map((event) => (
                                <View key={event?.id} style={styles.eventCard}>
                                    <View style={styles.eventContent}>

                                        {/* <Text style={styles.eventTitle}>{event.title}</Text>
                                    
                                    <View style={styles.eventDetailRow}>
                                        <Text style={styles.eventDetailLabel}>Date & Time:</Text>
                                        <Text style={styles.eventDetailText}>
                                            {formatDateRange(event.startDate, event.endDate)}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.eventDetailRow}>
                                        <Text style={styles.eventDetailLabel}>Location:</Text>
                                        <Text style={styles.eventDetailText}>{event.location}</Text>
                                    </View>
                                    
                                    <Text style={styles.eventDescription}>{event.description}</Text> */}

                                        <Text style={styles.eventTitle}>{event?.title}</Text>

                                        {/* <View style={styles.eventDetailRow}>
                                        <Text style={styles.eventDetailLabel}>Date & Time:</Text>
                                        <Text style={styles.eventDetailText}>
                                            {formatDateRange(event?.startDate, event?.endDate)}
                                        </Text>
                                    </View>

                                    <View style={styles.eventDetailRow}>
                                        <Text style={styles.eventDetailLabel}>Location:</Text>
                                        <Text style={styles.eventDetailText}>{event?.location}</Text>
                                    </View>

                                    <View style={styles.eventDetailRow}>
                                        <Text style={styles.eventDetailLabel}>Description:</Text>
                                        <Text style={styles.eventDescription}>{event?.description}</Text>
                                    </View> */}

                                        <View style={styles.eventDetailRow}>
                                            <Icon name="event" size={20} color="#2753b2" style={styles.icon} />
                                            <Text style={styles.eventDetailText}>
                                                {formatDateRange(event?.startDate, event?.endDate)}
                                            </Text>
                                        </View>

                                        <View style={styles.eventDetailRow}>
                                            <Icon name="location-on" size={20} color="#2753b2" style={styles.icon} />
                                            <Text style={styles.eventDetailText}>{event?.location}</Text>
                                        </View>

                                        <View style={styles.eventDetailRow}>
                                            <Icon name="notes" size={20} color="#2753b2" style={styles.icon} />
                                            <Text style={styles.eventDescription}>{event?.description}</Text>
                                        </View>

                                        {/* <View style={styles.eventDetailRow}>
                                    <Text style={styles.eventDetailLabel}>Registered:</Text>
                                    <Text style={styles.eventDetailText}>{event?.registered ? 'Yes' : 'No'}</Text>
                                </View> */}
                                    <View style={styles.buttonContainer}>
                                        {event.registered === null ? (
                                            <TouchableOpacity
                                                style={styles.registerButton}
                                                onPress={() => handleRegister(event)}
                                            >
                                                <Text style={styles.registerButtonText}>Register</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity
                                                style={styles.registeredButton}
                                                onPress={() => handleRegistered(event)}
                                            >
                                                <Text style={styles.registeredButtonText}>Registered</Text>
                                                {/* <Text style={styles.registeredButtonText}>Registered: {event?.registered?.status}</Text> */}
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    </View>

                                    {/* <TouchableOpacity
                                        style={styles.registerButton}
                                        onPress={() => handleRegister(event)}
                                    >
                                        <Text style={styles.registerButtonText}>Register</Text>
                                    </TouchableOpacity> */}

                                </View>
                            ))
                        ) : (
                            <View style={styles.noEventsCard}>
                                <Text style={styles.noEventsText}>No events scheduled for this date</Text>
                            </View>
                        )}
                    </View>



                    {/* <View key={event?.id} style={styles.eventCard}>
    <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{event?.title}</Text>
        
        <View style={styles.eventDetailRow}>
            <Icon name="event" size={20} color="#2753b2" style={styles.icon} />
            <Text style={styles.eventDetailText}>
                {formatDateRange(event?.startDate, event?.endDate)}
            </Text>
        </View>
        
        <View style={styles.eventDetailRow}>
            <Icon name="location-on" size={20} color="#2753b2" style={styles.icon} />
            <Text style={styles.eventDetailText}>{event?.location}</Text>
        </View>
        
        {event.description && (
            <View style={styles.eventDetailRow}>
                <Icon name="notes" size={20} color="#2753b2" style={styles.icon} />
                <Text style={styles.eventDescription}>{event?.description}</Text>
            </View>
        )}
    </View>
    
    <View style={styles.buttonContainer}>
        {event.registered === null ? (
            <TouchableOpacity
                style={styles.registerButton}
                onPress={() => handleRegister(event)}
            >
                <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
        ) : (
            <TouchableOpacity
                style={styles.registeredButton}
                onPress={() => handleRegistered(event)}
            >
                <Text style={styles.registeredButtonText}>Registered</Text>
            </TouchableOpacity>
        )}
    </View>
</View> */}


                </ScrollView>

            </Animated.View>
        </LinearGradient>
    );
}

export default EventCalendarPage;


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 30,
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
        paddingBottom: 20,
    },
    subtitleText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#F0F0F0',
        marginBottom: 10,
        textAlign: 'center',
        lineHeight: 22,
    },
    calendarContainer: {
        width: '100%',
        marginBottom: 15,
    },
    calendarStyle: {
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    eventsContainer: {
        width: '100%',
        marginBottom: 20,
    },
    eventCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        elevation: 2,
        flexDirection: 'row', // Add this
        justifyContent: 'space-between', // Add this
        alignItems: 'center', // Add this to vertically center
    },
    eventContent: {
        flex: 1, // Take up available space
    },
    buttonContainer: {
        // flexDirection: 'row',
        // justifyContent: 'center',
        // alignItems: 'center',
        marginLeft: 10, // Add some space between content and buttons
    },
    noEventsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 8,
        // padding: 20,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2753b2',
        // marginBottom: 5,
    },
    icon: {
        marginRight: 8,
        width: 20,
    },
    eventDetailRow: {
        flexDirection: 'row',
        // marginBottom: 10,
        alignItems: 'center',
        marginBottom: 2,
    },
    eventDetailLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        width: 80,
    },
    eventDetailText: {
        fontSize: 14,
        color: '#555',
        flex: 1,
    },
    eventDescription: {
        fontSize: 14,
        color: '#666',
        // marginTop: 5,
        // marginBottom: 5,
        lineHeight: 22,
    },
    noEventsText: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
    },
    registerButton: {
        backgroundColor: '#2753b2',
        paddingVertical: 8,
        width: '30%',
        borderRadius: 6,
        // paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        marginTop: 2,
    },
    registerButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },

    registeredButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        width: '30%',
        borderRadius: 6,
        // paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        marginTop: 2,
    },
    registeredButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },


    loadingText: {
        color: '#FFF',
        fontSize: 16,
        marginTop: 10,
    },
    errorText: {
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#2753b2',
        fontWeight: 'bold',
    },
});
