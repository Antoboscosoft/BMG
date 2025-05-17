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

        console.log('Created Event:', newEvent);

        // You can now add this event to your state, API, or global context

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
                    // onChange={(event, date) => {
                    //     setShowStartPicker(false);
                    //     if (date) setStartDateTime(date);
                    // }}
                    // onChange={(event, date) => {
                    //     if (event.type === 'set' && date) {
                    //         setStartDateTime(date);
                    //     }
                    //     setShowStartPicker(false); // Always hide after selection/dismiss
                    // }}
                    onChange={(event, date) => {
                        console.log('Picker Event:', event);
    console.log('Selected Date:', date);
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
                    // onChange={(event, date) => {
                    //     setShowEndPicker(false);
                    //     if (date) setEndDateTime(date);
                    // }}
                    // onChange={(event, date) => {
                    //     if (event.type === 'set' && date) {
                    //         setEndDateTime(date);
                    //     }
                    //     setShowEndPicker(false);
                    // }}
                    onChange={(event, date) => {
                        console.log('Picker Event:', event);
    console.log('Selected Date:', date);
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
