import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar } from 'react-native-calendars';

function EventCalendarPage({ navigation }) {
    const [selectedDate, setSelectedDate] = useState('2025-05-16'); // Default to today's date (May 16, 2025)
    const fadeAnim = useState(new Animated.Value(0))[0]; // Animation for fade-in effect

    useEffect(() => {
        // Start fade-in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    // Sample events data (inferred based on app context)
    const events = {
        '2025-05-16': [
            {
                id: '1',
                title: 'Legal Consultation',
                date: '2025-05-16',
                time: '10:00 AM',
                location: 'Community Center',
                description: 'Free legal advice session for migrant workers.',
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
            },
        ],
        '2025-05-20': [
            {
                id: '3',
                title: 'Health Checkup',
                date: '2025-05-20',
                time: '8:00 AM',
                location: 'Local Clinic',
                description: 'Free health checkup for migrant workers.',
            },
        ],
    };

    // Marked dates for the calendar
    const markedDates = Object.keys(events).reduce((acc, date) => {
        acc[date] = { marked: true, dotColor: '#2753b2' };
        if (date === selectedDate) {
            acc[date].selected = true;
            acc[date].selectedColor = '#2753b2';
        }
        return acc;
    }, {});

    // Get events for the selected date
    const selectedEvents = events[selectedDate] || [];

    return (
        <LinearGradient
            colors={['#2753b2', '#e6e9f0']} // Gradient from blue to light gray
            style={styles.container}
        >
            <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>{'< Back'}</Text>
                </TouchableOpacity>
                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.titleText}>Event Calendar</Text>
                    <Text style={styles.subtitleText}>
                        View upcoming events and activities.
                    </Text>
                    <View style={styles.calendarContainer}>
                        <Calendar
                            current={'2025-05-16'} // Today's date
                            onDayPress={(day) => setSelectedDate(day.dateString)}
                            markedDates={markedDates}
                            theme={{
                                calendarBackground: 'rgba(255, 255, 255, 0.9)',
                                textSectionTitleColor: '#333',
                                dayTextColor: '#333',
                                todayTextColor: '#2753b2',
                                selectedDayTextColor: '#FFF',
                                monthTextColor: '#FFF',
                                textMonthFontSize: 18,
                                textMonthFontWeight: 'bold',
                                arrowColor: '#2753b2',
                            }}
                            style={{
                                borderRadius: 8,
                                elevation: 2,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.2,
                                shadowRadius: 3,
                            }}
                        />
                    </View>
                    <View style={styles.eventList}>
                        {selectedEvents.length > 0 ? (
                            selectedEvents.map((event) => (
                                <TouchableOpacity
                                    key={event.id}
                                    style={styles.eventItem}
                                    onPress={() => {
                                        // Add logic to navigate to a detailed event page
                                        console.log(`Tapped on event: ${event.title}`);
                                    }}
                                >
                                    <Text style={styles.eventTitle}>{event.title}</Text>
                                    <Text style={styles.eventDetail}>Date: {event.date}</Text>
                                    <Text style={styles.eventDetail}>Time: {event.time}</Text>
                                    <Text style={styles.eventDetail}>Location: {event.location}</Text>
                                    <Text style={styles.eventDescription}>{event.description}</Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.noEventsText}>
                                No events scheduled for this date.
                            </Text>
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
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 80,
        paddingBottom: 40,
        alignItems: 'center',
    },
    titleText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 15,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subtitleText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#F0F0F0',
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 22,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    calendarContainer: {
        width: '100%',
        marginBottom: 20,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
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
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
});