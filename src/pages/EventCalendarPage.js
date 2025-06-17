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
    Image,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import moment from 'moment';
import Toast from 'react-native-simple-toast';
import { getEvents, deleteEvent } from '../api/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../language/commondir';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RenderHtml from 'react-native-render-html';

function EventCalendarPage({ navigation }) {
    const { languageTexts } = useLanguage();
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [fadeAnim] = useState(new Animated.Value(0));
    const [events, setEvents] = useState({});
    const route = useRoute();
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    const stripHtmlTags = (html) => {
        return html.replace(/<[^>]+>/g, '');
    };

    useEffect(() => {
        const getUserRole = async () => {
            try {
                const role = await AsyncStorage.getItem('userRole');
                console.log('Retrieved userRole from AsyncStorage:', role);
                setIsSuperAdmin(role === 'Super Admin' || role === 'Admin' || role === 'Staff');
            } catch (error) {
                console.error('Failed to retrieve user role from AsyncStorage:', error);
                setIsSuperAdmin(false);
            }
        };

        getUserRole();
    }, []);
    console.log("isSuperAdmin:", isSuperAdmin);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const markedDates = Object.keys(events).reduce((acc, date) => {
        acc[date] = { marked: true, dotColor: '#2753b2' };
        return acc;
    }, {});
    if (selectedDate) {
        if (!markedDates[selectedDate]) {
            markedDates[selectedDate] = {};
        }
        markedDates[selectedDate].selected = true;
        markedDates[selectedDate].selectedColor = '#2753b2';
    }

    useEffect(() => {
        LocaleConfig.locales['custom'] = {
            monthNames: languageTexts?.calendar?.monthNames || [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
            ],
            monthNamesShort: languageTexts?.calendar?.monthNamesShort || [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
            ],
            dayNames: languageTexts?.calendar?.dayNames || [
                'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
            ],
            dayNamesShort: languageTexts?.calendar?.dayNamesShort || [
                'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
            ],
            today: languageTexts?.calendar?.today || 'Today',
        };

        LocaleConfig.defaultLocale = 'custom';
    }, [languageTexts]);

    const fetchEvents = async () => {
        try {
            const response = await getEvents();
            if (response.status && response.data) {
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
                        registered: event.registered,
                        eventData: event,
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
            Toast.show(err.message, Toast.LONG);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const selectedEvents = events[selectedDate] || [];

    const formatDateRange = (start, end) => {
        const startMoment = moment(start);
        const endMoment = moment(end);

        if (startMoment.isSame(endMoment, 'day')) {
            return `${startMoment.format('MMM D, YYYY')}, ${startMoment.format('h:mm A')} - ${endMoment.format('h:mm A')}`;
        } else {
            return `${startMoment.format('MMM D')} - ${endMoment.format('MMM D, YYYY')}`;
        }
    };

    const formatEventDateTime = (start, end) => {
        const startMoment = moment(start);
        const endMoment = moment(end);

        if (startMoment.isSame(endMoment, 'day')) {
            return {
                date: startMoment.format('MMM D, YYYY'),
                time: `${startMoment.format('h:mm A')} - ${endMoment.format('h:mm A')}`
            };
        } else {
            return {
                date: `${startMoment.format('MMM D')} - ${endMoment.format('MMM D, YYYY')}`,
                time: `${startMoment.format('h:mm A')} - ${endMoment.format('h:mm A')}`
            };
        }
    };

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
                    isRegistered: false,
                    eventData: event.eventData,
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
                    isRegistered: true,
                    eventData: event.eventData,
                }
            });
        } catch (error) {
            console.error('Registered Event Error:', error);
            Toast.show('Failed to view registration. Please try again.', Toast.LONG);
        }
    };

    const handleDelete = (eventId) => {
        Alert.alert(
            languageTexts?.eventCalendar?.delete?.title || 'Delete Event',
            languageTexts?.eventCalendar?.delete?.message || 'Are you sure you want to delete this event?',
            [
                {
                    text: languageTexts?.common?.cancel || 'Cancel',
                    style: 'cancel',
                },
                {
                    text: languageTexts?.common?.delete || 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteEvent(eventId);
                            Toast.show(
                                languageTexts?.eventCalendar?.delete?.success || 'Event deleted successfully!',
                                Toast.LONG
                            );
                            fetchEvents(); // Refresh the event list
                        } catch (error) {
                            console.error('Delete Event Error:', error);
                            Toast.show(
                                error.message || (languageTexts?.eventCalendar?.delete?.error || 'Failed to delete event.'),
                                Toast.LONG
                            );
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
            <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate('Dashboard')}
                    >
                        <Icon name="arrow-back" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={styles.titleText}>
                        {languageTexts?.menu?.eventCalendar || 'Event Calendar'}
                    </Text>
                    {isSuperAdmin ? (
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => navigation.navigate('CreateEvent')}
                        >
                            <Image
                                source={require('../asserts/images/calendar1.png')}
                                style={{ width: 24, height: 24, tintColor: '#ffffff' }}
                            />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 60 }} />
                    )}
                </View>

                <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
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
                                    },
                                },
                            }}
                            style={styles.calendarStyle}
                        />
                    </View>
                    <View style={styles.eventsContainer}>
                        {selectedEvents.length > 0 ? (
                            selectedEvents.map((event) => (
                                <View key={event?.id} style={styles.eventCard}>
                                    <View style={styles.eventContent}>
                                        {isSuperAdmin && (
                                            <View style={styles.actionButtons}>
                                                <TouchableOpacity
                                                    onPress={() => navigation.navigate('CreateEvent', { eventData: event.eventData })}
                                                    style={styles.editButton}
                                                >
                                                    <Icon name="edit" size={22} color="#2753b2" />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => handleDelete(event.id)}
                                                    style={styles.deleteButton}
                                                >
                                                    <Icon name="delete" size={22} color="#ff4444" />
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                        <Text style={styles.eventTitle}>
                                            {languageTexts?.eventCalendar?.events?.[event.titleKey] || event.title}
                                        </Text>
                                        <View style={styles.eventDetailRow}>
                                            <Icon name="event" size={20} color="#2753b2" style={styles.icon} />
                                            <Text style={styles.eventDetailText}>
                                                {formatDateRange(event?.startDate, event?.endDate)}
                                            </Text>
                                        </View>
                                        <View style={styles.eventDetailRow}>
                                            <Icon name="location-on" size={20} color="#2753b2" style={styles.icon} />
                                            <Text style={styles.eventDetailText}>
                                                {languageTexts?.eventCalendar?.locations?.[event.locationKey] || event.location}
                                            </Text>
                                        </View>
                                        <View style={styles.eventDetailRow}>
                                            <Icon name="notes" size={20} color="#2753b2" style={styles.icon} />
                                            <View style={{ flex: 1 }}>
                                                <RenderHtml
                                                    contentWidth={300}
                                                    source={{ html: languageTexts?.eventCalendar?.descriptions?.[event.descriptionKey] || event.description || '' }}
                                                    baseStyle={{ color: '#666', fontSize: 14 }}
                                                    tagsStyles={{
                                                        b: { fontWeight: 'bold', color: '#666', fontSize: 14 },
                                                        strong: { fontWeight: 'bold', color: '#666', fontSize: 14 },
                                                        u: { textDecorationLine: 'underline' },
                                                        i: { fontStyle: 'italic' },
                                                        em: { fontStyle: 'italic' },
                                                        p: { marginBottom: 4 },
                                                    }}
                                                    enableExperimentalBRCollapsing={true}
                                                />
                                            </View>
                                        </View>
                                        <View style={styles.buttonContainer}>
                                            {event.registered === null ? (
                                                <TouchableOpacity
                                                    style={styles.registerButton}
                                                    onPress={() => handleRegister(event)}
                                                >
                                                    <Text style={styles.registerButtonText}>
                                                        {languageTexts?.eventCalendar?.register || 'Register'}
                                                    </Text>
                                                </TouchableOpacity>
                                            ) : (
                                                <TouchableOpacity
                                                    style={styles.registeredButton}
                                                    onPress={() => handleRegistered(event)}
                                                >
                                                    <Text style={styles.registeredButtonText}>
                                                        {languageTexts?.eventCalendar?.registered || 'Registered'}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.noEventsCard}>
                                <Icon name="event-busy" size={50} color="#666" />
                                <Text style={styles.noEventsText}>
                                    {languageTexts?.eventCalendar?.noEvents || 'No events scheduled for this date'}
                                </Text>
                            </View>
                        )}
                    </View>
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
        zIndex: 1,
    },
    createButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        zIndex: 1,
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
    calendarContainer: {
        marginTop: 20,
        marginHorizontal: 20,
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    calendarStyle: {
        borderRadius: 10,
    },
    eventsContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    eventCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        marginBottom: 15,
        padding: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        position: 'relative',
    },
    eventContent: {
        flex: 1,
    },
    actionButtons: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        zIndex: 1,
    },
    editButton: {
        backgroundColor: '#e6e9f0',
        padding: 6,
        borderRadius: 8,
        marginRight: 8,
    },
    deleteButton: {
        backgroundColor: '#ffe6e6',
        padding: 6,
        borderRadius: 8,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        paddingRight: 80, // Increased padding to accommodate both edit and delete buttons
    },
    eventDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        marginRight: 10,
    },
    eventDetailText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    registerButton: {
        backgroundColor: '#2753b2',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    registeredButton: {
        backgroundColor: '#28a745',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    registerButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    registeredButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    noEventsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        elevation: 2,
    },
    noEventsText: {
        fontSize: 16,
        color: '#666',
    },
});