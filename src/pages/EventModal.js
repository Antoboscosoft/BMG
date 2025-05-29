import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  Button,
  Modal,
  TouchableOpacity,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const EventModal = ({ visible, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSave = () => {
    const event = {
      title,
      description,
      all_day: allDay,
      start_datetime: startDateTime.toISOString(),
      end_datetime: endDateTime.toISOString(),
    };
    onClose(); // Close modal
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Create Event</Text>

        {/* Title */}
        <Text>Title*</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Event Title"
          style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        />

        {/* Description */}
        <Text>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Event Details"
          multiline
          style={{ borderWidth: 1, marginBottom: 10, padding: 8, height: 80 }}
        />

        {/* All Day */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Text>All Day?</Text>
          <Switch value={allDay} onValueChange={setAllDay} style={{ marginLeft: 10 }} />
        </View>

        {/* Start DateTime */}
        <Text>Start Time*</Text>
        <TouchableOpacity
          onPress={() => setShowStartPicker(true)}
          style={{
            borderWidth: 1,
            padding: 10,
            marginBottom: 10,
          }}
        >
          <Text>{formatTime(startDateTime)}</Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={startDateTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            is24Hour={false}
            onChange={(event, selectedTime) => {
              setShowStartPicker(false);
              if (selectedTime) {
                setStartDateTime(selectedTime);
              }
            }}
          />
        )}

        {/* End DateTime */}
        <Text>End Time</Text>
        <TouchableOpacity
          onPress={() => setShowEndPicker(true)}
          style={{
            borderWidth: 1,
            padding: 10,
            marginBottom: 10,
          }}
        >
          <Text>{formatTime(endDateTime)}</Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            value={endDateTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            is24Hour={false}
            onChange={(event, selectedTime) => {
              setShowEndPicker(false);
              if (selectedTime) {
                setEndDateTime(selectedTime);
              }
            }}
          />
        )}

        {/* Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button title="Cancel" onPress={onClose} />
          <Button title="Save" onPress={handleSave} disabled={!title.trim()} />
        </View>
      </View>
    </Modal>
  );
};

export default EventModal;
