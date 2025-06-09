import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    FlatList,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
    SafeAreaView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../language/commondir';
import { getHelpCategories } from '../api/auth';

const statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved', value: 'Resolved' },
];

function HelpRequestPage({ navigation }) {
    const { languageTexts, user } = useLanguage(); // Assuming user.data.id is available for userId
    const [modalVisible, setModalVisible] = useState(false);
    const [category, setCategory] = useState('legalAssistance');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('Pending');
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const response = await getHelpCategories();
                console.log("response data from api >>>> ", response);

                if (response && response.status && response.data) {
                    const formattedServices = response.data.map(service => ({
                        id: service?.id.toString(),
                        name: languageTexts?.servicesDirectory?.services?.[service.name.replace(/\s+/g, '')] || service?.name,
                        description: languageTexts?.servicesDirectory?.descriptions?.[service.name.replace(/\s+/g, '')] || languageTexts?.servicesDirectory?.descriptions?.default || 'Service description not available',
                        category_id: service?.id,
                        available: service?.available,
                        service_request_count: service?.service_request_count,
                        type: service?.type,
                    }));
                    setServices(formattedServices);
                } else {
                    throw new Error(response?.details || languageTexts?.servicesDirectory?.error?.fetch || 'Failed to fetch services');
                }
            } catch (err) {
                setError(languageTexts?.servicesDirectory?.error?.fetch || 'Failed to load services. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [languageTexts]);

    const handleSubmit = () => {
        if (!description.trim()) {
            Alert.alert(languageTexts?.helpRequest?.error?.title || 'Error', languageTexts?.helpRequest?.error?.description || 'Please provide a description of your issue.');
            return;
        }

        setModalVisible(false);
        setDescription('');
        Alert.alert(languageTexts?.helpRequest?.success?.title || 'Success', languageTexts?.helpRequest?.success?.message || 'Your help request has been submitted successfully!');
    };

    const handleViewCategory = (category) => {
        console.log("category >>>> ", category);
        navigation.navigate('CategoryHelp', {
            category: { id: category.category_id, name: category.name, userId: user.data?.role?.id },
            userId: user?.data?.id, // Pass the logged-in user ID
        });
    };

    const renderCategoryItem = ({ item }) => (
        <View style={styles.serviceCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.serviceTitle}>{item.name}</Text>
                    <Text style={styles.serviceDescription}>{item.description}</Text>
                </View>
                <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleViewCategory(item)}
                >
                    <Icon name="visibility" size={20} color="#FFF" />
                    <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#944D00" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
            <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate('Dashboard')}
                    >
                        <Icon name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.titleText}>{languageTexts?.helpRequest?.title || 'Help Requests'}</Text>
                    <View style={{ width: 60 }} />
                </View>

                <SafeAreaView style={styles.listContainer}>
                    <FlatList
                        data={services}
                        renderItem={renderCategoryItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>{languageTexts?.helpRequest?.empty || 'No categories found'}</Text>
                        }
                    />
                </SafeAreaView>

                {/* <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setModalVisible(true)}
                >
                    <Icon name="add" size={24} color="#fff" />
                </TouchableOpacity> */}

                {/* <Modal
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

                            <View style={styles.modalScroll}>
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
                            </View>

                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.buttonText}>{languageTexts?.helpRequest?.submit || 'Submit Request'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal> */}
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 80,
        zIndex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    serviceCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
    },
    serviceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2753b2',
        marginBottom: 5,
    },
    serviceDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    viewButton: {
        flexDirection: 'row',
        backgroundColor: '#2753b2',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    viewButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 5,
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
        overflowCC: '#2753b2',
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
    errorText: {
        color: '#d32f2f',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default HelpRequestPage;