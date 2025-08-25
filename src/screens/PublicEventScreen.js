import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RenderHtml from 'react-native-render-html';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import moment from 'moment';
import { getPublicEvents } from '../api/auth';
import { useLanguage } from '../language/commondir';

const { width } = Dimensions.get('window');

function PublicEventScreen({ navigation, route }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { languageTexts } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [markedDates, setMarkedDates] = useState({});
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Get events from navigation params or fetch from API
  const eventsFromParams = route.params?.events;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    if (eventsFromParams) {
      // Use events passed from login screen
      processEvents(eventsFromParams);
      setLoading(false);
    } else {
      // Fallback: fetch events directly if not passed
      fetchPublicEvents();
    }
  }, [eventsFromParams]);

  useEffect(() => {
    // Configure calendar locale
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

  const processEvents = (eventsData) => {
    setEvents(eventsData);
    
    // Create marked dates for calendar
    const markedDatesObj = {};
    const today = moment().format('YYYY-MM-DD');
    
    eventsData.forEach(event => {
      const startDate = moment(event.start_datetime).format('YYYY-MM-DD');
      const endDate = moment(event.end_datetime).format('YYYY-MM-DD');
      
      // Mark all dates in the event range
      let currentDate = moment(startDate);
      const end = moment(endDate);
      
      while (currentDate.isSameOrBefore(end)) {
        const dateStr = currentDate.format('YYYY-MM-DD');
        
        if (!markedDatesObj[dateStr]) {
          markedDatesObj[dateStr] = {
            marked: true,
            dotColor: dateStr === today ? '#ffc107' : '#2753b2',
          };
        }
        
        currentDate.add(1, 'day');
      }
    });
    
    // Mark selected date
    if (selectedDate) {
      markedDatesObj[selectedDate] = {
        ...markedDatesObj[selectedDate],
        selected: true,
        selectedColor: '#2753b2'
        };
    }
    
    setMarkedDates(markedDatesObj);
    filterEventsByDate(eventsData, selectedDate);
  };

  const filterEventsByDate = (eventsData, date) => {
    const filtered = eventsData.filter(event => {
      const eventStart = moment(event.start_datetime).startOf('day');
      const eventEnd = moment(event.end_datetime).endOf('day');
      const selected = moment(date);
      
      return selected.isBetween(eventStart, eventEnd, null, '[]');
    });
    
    setFilteredEvents(filtered);
  };

  const fetchPublicEvents = async () => {
    try {
      setLoading(true);
      const response = await getPublicEvents();
      if (response.status && response.data) {
        processEvents(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch public events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPublicEvents();
  };

  // Handle date selection 1st method
  const handleDateSelect1 = (day) => {
    const newSelectedDate = day.dateString;
    setSelectedDate(newSelectedDate);
    
    // Update marked dates to show the new selection
    const updatedMarkedDates = { ...markedDates };
    
    // Remove previous selection from all dates
    Object.keys(updatedMarkedDates).forEach(date => {
      if (updatedMarkedDates[date].selected) {
        delete updatedMarkedDates[date].selected;
        delete updatedMarkedDates[date].selectedColor;
      }
    });
    
    // Add selection to the new date
    updatedMarkedDates[newSelectedDate] = {
      ...updatedMarkedDates[newSelectedDate],
      selected: true,
      selectedColor: '#2753b2'
    };
    
    setMarkedDates(updatedMarkedDates);
    filterEventsByDate(events, newSelectedDate);
    // setSelectedDate(day.dateString);
    // filterEventsByDate(events, day.dateString);
  };

  // Handle date selection 2nd method
  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    
    // Rebuild marked dates with the new selection
    const updatedMarkedDates = { ...markedDates };
    
    // Clear any existing selection
    Object.keys(updatedMarkedDates).forEach(date => {
      if (updatedMarkedDates[date].selected) {
        delete updatedMarkedDates[date].selected;
        delete updatedMarkedDates[date].selectedColor;
      }
    });
    
    // Set new selection
    updatedMarkedDates[day.dateString] = {
      ...updatedMarkedDates[day.dateString],
      selected: true,
      selectedColor: '#2753b2'
    };
    
    setMarkedDates(updatedMarkedDates);
    filterEventsByDate(events, day.dateString);
  };
  const handleEnrollNow = (event) => {
    navigation.navigate('RegisterEventParticipant', { 
      eventData: event 
    });
  };

  const formatDateRange = (start, end) => {
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

  const getEventBadge = (startDate) => {
    const today = moment();
    const eventDate = moment(startDate);
    
    if (eventDate.isSame(today, 'day')) {
      return { text: 'Today', style: styles.todayBadge };
    } else if (eventDate.isAfter(today)) {
      return { text: 'Upcoming', style: styles.upcomingBadge };
    }
    return { text: eventDate.format('MMM D'), style: styles.pastBadge };
  };

  const renderEventCard = (event) => {
    const dateInfo = formatDateRange(event.start_datetime, event.end_datetime);
    const badge = getEventBadge(event.start_datetime);

    return (
      <View key={event.id} style={styles.eventCard}>
        <View style={[styles.eventBadge, badge.style]}>
          <Text style={styles.badgeText}>{badge.text}</Text>
        </View>
        
        <Text style={styles.eventTitle}>{event.title}</Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <View style={styles.detailIcon}>
              <Icon name="event" size={16} color="#fff" />
            </View>
            <View style={styles.detailText}>
              <Text style={styles.detailTitle}>{dateInfo.date}</Text>
              <Text style={styles.detailSubtitle}>{dateInfo.time}</Text>
            </View>
          </View>
          
          <View style={styles.eventDetailRow}>
            <View style={styles.detailIcon}>
              <Icon name="location-on" size={16} color="#fff" />
            </View>
            <Text style={styles.detailText}>{event.location}</Text>
          </View>
        </View>
        
        {event.description && (
          <View style={styles.eventDescription}>
            <Text style={styles.descriptionTitle}>About this event</Text>
            <RenderHtml
              contentWidth={width - 80}
              source={{ html: event.description }}
              baseStyle={{ color: '#666', fontSize: 14, lineHeight: 20 }}
              tagsStyles={{
                b: { fontWeight: 'bold', color: '#666' },
                strong: { fontWeight: 'bold', color: '#666' },
                u: { textDecorationLine: 'underline' },
                i: { fontStyle: 'italic' },
                em: { fontStyle: 'italic' },
                ul: { paddingLeft: 10 },
                li: { marginBottom: 4 }
              }}
            />
          </View>
        )}
        
        <View style={styles.eventActions}>
          <TouchableOpacity 
            style={styles.enrollButton}
            onPress={() => handleEnrollNow(event)}
          >
            <Icon name="person-add" size={18} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.enrollButtonText}>Enroll Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderNoEvents = () => (
    <View style={styles.noEventsContainer}>
      <Icon name="event-busy" size={64} color="#666" />
      <Text style={styles.noEventsTitle}>No Events Found</Text>
      <Text style={styles.noEventsText}>
        {selectedDate === moment().format('YYYY-MM-DD') 
          ? "There are no events scheduled for today. Please check other dates."
          : `There are no events scheduled for ${moment(selectedDate).format('MMM D, YYYY')}.`
        }
      </Text>
    </View>
  );

  return (
    <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
      <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.titleText}>{languageTexts.publicEvent.title || 'Public Events'}</Text>
          <View style={{ width: 44 }} /> {/* Spacer for alignment */}
        </View>

        {/* Calendar Section - Always Visible */}
        <View style={styles.calendarSection}>
          {/* <Text style={styles.sectionTitle}>Select a Date</Text> */}
          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              onDayPress={handleDateSelect}
              markedDates={markedDates}
              theme={{
                calendarBackground: 'rgba(255, 255, 255, 0.95)',
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
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#2753b2',
                  },
                },
              }}
              style={styles.calendarStyle}
            />
          </View>
        </View>

        {/* Events List Section */}
        <View style={styles.eventsSection}>
          <View style={styles.dateHeader}>
            <Text style={styles.dateHeaderText}>
              Events on {moment(selectedDate).format('MMMM D, YYYY')}
            </Text>
            <Text style={styles.eventsCount}>
              ({filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''})
            </Text>
          </View>

          <ScrollView 
            contentContainerStyle={styles.eventsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#2753b2']}
              />
            }
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2753b2" />
                <Text style={styles.loadingText}>Loading events...</Text>
              </View>
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map(renderEventCard)
            ) : (
              renderNoEvents()
            )}
          </ScrollView>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

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
    paddingBottom: 15,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 80,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  calendarSection: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    marginLeft: 5,
  },
  calendarContainer: {
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
  eventsSection: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  dateHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2753b2',
  },
  eventsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  eventsList: {
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
    borderLeftWidth: 5,
    borderLeftColor: '#2753b2',
  },
  eventBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  todayBadge: {
    backgroundColor: '#ffc107',
  },
  upcomingBadge: {
    backgroundColor: '#28a745',
  },
  pastBadge: {
    backgroundColor: '#6c757d',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2753b2',
    marginBottom: 15,
    marginRight: 80,
    lineHeight: 24,
  },
  eventDetails: {
    marginBottom: 15,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    backgroundColor: '#2753b2',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailText: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  detailSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  eventDescription: {
    backgroundColor: 'rgba(39, 83, 178, 0.05)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#2753b2',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2753b2',
    marginBottom: 8,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(39, 83, 178, 0.1)',
  },
  enrollButton: {
    backgroundColor: '#2753b2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    marginTop: 20,
  },
  noEventsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2753b2',
    marginTop: 15,
    marginBottom: 10,
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#2753b2',
  },
});

export default PublicEventScreen;