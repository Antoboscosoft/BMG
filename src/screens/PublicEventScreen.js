import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RenderHtml from 'react-native-render-html';
import { getPublicEvents } from '../api/auth'; // Add this API call
import moment from 'moment';
import { useLanguage } from '../language/commondir';

function PublicEventScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { languageTexts } = useLanguage();
  // Sample events data
  const sampleEvents = [
    {
      id: 1,
      title: "Job Skills Training Workshop",
      description: "<p>Learn essential job skills including <b>resume writing</b>, <i>interview preparation</i>, and workplace communication. This comprehensive workshop is designed to help migrants find better employment opportunities.</p><p>Topics covered:</p><ul><li>Resume building</li><li>Interview techniques</li><li>Professional communication</li><li>Workplace etiquette</li></ul>",
      location: "Don Bosco Community Center, Main Hall",
      start_datetime: "2025-08-30T09:00:00Z",
      end_datetime: "2025-08-30T17:00:00Z",
      all_day: false,
      event_attachments: []
    },
    {
      id: 2,
      title: "Health and Wellness Camp",
      description: "<p>Free <b>health check-ups</b> and <u>medical consultations</u> for the migrant community. Our medical team will provide:</p><p><strong>Services available:</strong></p><ul><li>General health screening</li><li>Blood pressure check</li><li>Basic eye examination</li><li>Health awareness sessions</li><li>Medicine distribution (if needed)</li></ul><p><em>Bring your health records if available.</em></p>",
      location: "Don Bosco Medical Center, Ground Floor",
      start_datetime: "2025-09-05T08:00:00Z",
      end_datetime: "2025-09-05T16:00:00Z",
      all_day: false,
      event_attachments: []
    }
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    fetchPublicEvents();
  }, []);

  const fetchPublicEvents = async () => {
    try {
      setLoading(true);
      // Replace with your actual API call
    //   const response = await getPublicEvents();
    //   if (response.status && response.data) {
    //     setEvents(response.data);
    //   }

    // Using sample data for demonstration
      setTimeout(() => {
        setEvents(sampleEvents);
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Failed to fetch public events:', error);
    } finally {
      setLoading(false);
    }
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
    return { text: eventDate.format('MMM D'), style: styles.upcomingBadge };
  };

  const handleEnrollNow = (event) => {
    navigation.navigate('RegisterEventParticipant', { 
      eventData: event 
    });
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
              contentWidth={300}
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
        
        {/* <View style={styles.eventActions}> */}
          {/* <TouchableOpacity style={styles.btnSecondary}>
            <Text style={styles.btnSecondaryText}>Learn More</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>Register</Text>
          </TouchableOpacity> */}
          {/* <TouchableOpacity 
            style={styles.btnPrimary}
            onPress={() => handleEnrollNow(event)}
          >
            <Icon name="person-add" size={18} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.btnPrimaryText}>Enroll Now</Text>
          </TouchableOpacity> */}
        {/* </View> */}
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
      <Text style={styles.noEventsTitle}>No Public Events</Text>
      <Text style={styles.noEventsText}>
        There are currently no public events scheduled. Please check back later for updates.
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
          <View style={{ width: 60 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.contentContainer} 
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2753b2" />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : events.length > 0 ? (
            events.map(renderEventCard)
          ) : (
            renderNoEvents()
          )}
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
}

const styles1 = StyleSheet.create({
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
    borderRadius: 80,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  contentContainer: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
  btnPrimary: {
    backgroundColor: '#2753b2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  btnSecondary: {
    backgroundColor: 'rgba(39, 83, 178, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#2753b2',
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    // textTransform: 'uppercase',
  },
  btnSecondaryText: {
    color: '#2753b2',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    marginTop: 40,
  },
  noEventsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2753b2',
    marginTop: 20,
    marginBottom: 10,
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#2753b2',
  },
});



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
    borderRadius: 80,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  contentContainer: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    padding: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    marginTop: 40,
  },
  noEventsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2753b2',
    marginTop: 20,
    marginBottom: 10,
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#2753b2',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoid: {
    width: '100%',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#2753b2',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  genderOption: {
    width: '48%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: 'rgba(39, 83, 178, 0.1)',
    borderColor: '#2753b2',
  },
  genderText: {
    fontSize: 16,
    color: '#666',
  },
  genderTextSelected: {
    color: '#2753b2',
    fontWeight: '600',
  },
  genderLoading: {
    marginVertical: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#2753b2',
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PublicEventScreen;