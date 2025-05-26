import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Animated, 
    ScrollView, 
    TextInput, 
    Alert, 
    Modal,
    FlatList,
    SafeAreaView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import { useLanguage } from '../language/commondir';



const statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved', value: 'Resolved' },
];

// Sample data for the list
const sampleRequests = [
    { id: '1', category: 'Legal Assistance', description: 'Need help with visa documentation', status: 'Pending', createdAt: moment().subtract(2, 'hours').toDate()  },
    { id: '2', category: 'Job Support', description: 'Looking for IT job opportunities', status: 'In Progress', createdAt: moment().subtract(1, 'day').toDate()  },
    { id: '3', category: 'Health Services', description: 'Need information about local hospitals', status: 'Resolved', createdAt: moment().subtract(3, 'days').toDate() },
];

function HelpRequestPage({ navigation }) {
    const { languageTexts } = useLanguage();
    const [requests, setRequests] = useState(sampleRequests);
    const [modalVisible, setModalVisible] = useState(false);
    const [category, setCategory] = useState('Legal Assistance');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('Pending');
    const fadeAnim = useState(new Animated.Value(0))[0];

    const categories = [
        { label: languageTexts?.helpRequest?.categories?.legalAssistance || 'Legal Assistance', value: 'legalAssistance' },
        { label: languageTexts?.helpRequest?.categories?.jobSupport || 'Job Support', value: 'jobSupport' },
        { label: languageTexts?.helpRequest?.categories?.healthServices || 'Health Services', value: 'healthServices' },
        { label: languageTexts?.helpRequest?.categories?.languageSupport || 'Language Support', value: 'languageSupport' },
        { label: languageTexts?.helpRequest?.categories?.other || 'Other', value: 'other' },
    ];
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const handleSubmit = () => {
        if (!description.trim()) {
            Alert.alert(languageTexts?.helpRequest?.error?.title || 'Error', languageTexts?.helpRequest?.error?.description || 'Please provide a description of your issue.');
            return;
        }

        // Add new request to the list
        const newRequest = {
            id: Math.random().toString(36).substring(7),
            category,
            description,
            status
        };

        setRequests([...requests, newRequest]);
        setModalVisible(false);
        setDescription('');
        Alert.alert(languageTexts?.helpRequest?.success?.title || 'Success', languageTexts?.helpRequest?.success?.message || 'Your help request has been submitted successfully!');
    };

    const formatTime = (date) => {
        return moment(date).fromNow(); // Shows "2 hours ago", "1 day ago", etc.
    };

    // const renderItem = ({ item }) => (
    //     <View style={styles.requestItem}>
    //         <Text style={styles.requestCategory}>{item.category}</Text>
    //         <Text style={styles.requestTime}>{formatTime(item.createdAt)}</Text>
    //         <Text style={styles.requestDescription}>{item.description}</Text>
    //         <View style={[styles.statusBadge, { 
    //             backgroundColor: item.status === 'Resolved' ? '#4CAF50' : 
    //                             item.status === 'In Progress' ? '#FFC107' : '#F44336'
    //         }]}>
    //             <Text style={styles.statusText}>{item.status}</Text>
    //         </View>
    //         <View>
    //             <Text>{moment().format('MMMM Do YYYY')}</Text>
    //         </View>
    //     </View>
    // );

    const renderItem = ({ item }) => (
        <View style={styles.requestItem}>
            <View style={styles.requestHeader}>
                <Text style={styles.requestCategory}>{languageTexts?.helpRequest?.categories?.[item.category] || item.category}</Text>
                <Text style={styles.requestTime}>{formatTime(item.createdAt)}</Text>
            </View>
            <Text style={styles.requestDescription}>{languageTexts?.helpRequest?.descriptions?.[item.description] || item.description}</Text>
            <View style={[styles.statusBadge, { 
                backgroundColor: item.status === 'Resolved' ? '#4CAF50' : 
                                item.status === 'In Progress' ? '#FFC107' : '#F44336'
            }]}>
                <Text style={styles.statusText}>{languageTexts?.helpRequest?.statuses?.[item.status] || item.status}</Text>
            </View>
        </View>
    );

    return (
        <LinearGradient
            colors={['#2753b2', '#e6e9f0']}
            style={styles.container}
        >
            <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>{languageTexts?.common?.back || '< Back'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.titleText}>{languageTexts?.helpRequest?.title || 'Help Requests'}</Text>
                    <View style={{ width: 60 }} />
                </View>

                <SafeAreaView style={styles.listContainer}>
                    <FlatList
                        data={requests}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>{languageTexts?.helpRequest?.empty || 'No requests found'}</Text>
                        }
                    />
                </SafeAreaView>

                {/* Floating Action Button */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setModalVisible(true)}
                >
                    <Icon name="add" size={24} color="#fff" />
                </TouchableOpacity>

                {/* Modal for adding new request */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{languageTexts?.helpRequest?.modalTitle || 'New Help Request'}</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Icon name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalScroll}>
                                <Text style={styles.label}>{languageTexts?.helpRequest?.category || 'Category'}</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={category}
                                        style={styles.picker}
                                        onValueChange={(itemValue) => setCategory(itemValue)}
                                    >
                                        {categories.map((cat) => (
                                            <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
                                        ))}
                                    </Picker>
                                </View>

                                {/* <Text style={styles.label}>Status</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={status}
                                        style={styles.picker}
                                        onValueChange={(itemValue) => setStatus(itemValue)}
                                    >
                                        {statusOptions.map((status) => (
                                            <Picker.Item key={status.value} label={status.label} value={status.value} />
                                        ))}
                                    </Picker>
                                </View> */}

                                <Text style={styles.label}>{languageTexts?.helpRequest?.description || 'Description'}</Text>
                                <TextInput
                                    style={styles.multilineInput}
                                    placeholder={languageTexts?.helpRequest?.placeholder || "Describe your issue in detail..."}
                                    placeholderTextColor="#999"
                                    multiline
                                    numberOfLines={5}
                                    textAlignVertical="top"
                                    value={description}
                                    onChangeText={setDescription}
                                />
                            </ScrollView>

                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.buttonText}>{languageTexts?.helpRequest?.submit || 'Submit Request'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
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
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        zIndex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 30,
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
    listContainer: {
        flex: 1,
        marginTop: 20,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 80,
    },
    requestItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    requestCategory: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2753b2',
        marginBottom: 5,
    },
    requestTime: {
        fontSize: 12,
        color: '#666',
    },
    requestDescription: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 16,
        marginTop: 50,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#2753b2',
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        margin: 20,
        borderRadius: 10,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalScroll: {
        paddingHorizontal: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
        marginTop: 15,
    },
    pickerContainer: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        marginBottom: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    picker: {
        width: '100%',
        color: '#333',
    },
    multilineInput: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        color: '#333',
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 100,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    modalButton: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        backgroundColor: '#2753b2',
        borderRadius: 8,
        margin: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default HelpRequestPage;