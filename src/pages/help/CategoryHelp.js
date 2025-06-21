import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getHelpRequestsByCategory, getHelpRequestStatusOptions, updateHelpRequestStatus } from '../../api/auth';
import { useLanguage } from '../../language/commondir';

// Fallback status options if API fails
const fallbackStatusOptions = [
    { label: 'Open', value: 'OPEN' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Closed', value: 'CLOSED' },
];

function CategoryHelp({ route, navigation }) {
    const { category, userId, refresh } = route.params;
    const { languageTexts, user } = useLanguage();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [statusOptions, setStatusOptions] = useState([]);

    // Fetch help requests
    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const role = user?.data?.role?.name.toUpperCase();
            const idToPass = role === 'MIGRANT' ? userId : undefined;
            console.log("userId:", userId, "role:", role, "idToPass:", idToPass);

            const response = await getHelpRequestsByCategory(category?.id, idToPass);
            setRequests(response.data || []);
        } catch (err) {
            setError('Failed to load help requests. Please try again.');
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch status options on component mount
    useEffect(() => {
        const fetchStatusOptions = async () => {
            try {
                const options = await getHelpRequestStatusOptions();
                const formattedOptions = options.map(opt => ({
                    value: opt.value || opt,
                    label: opt.label || opt,
                }));
                setStatusOptions(formattedOptions);
            } catch (err) {
                console.error('Failed to load status options:', err);
                setStatusOptions(fallbackStatusOptions);
            }
        };

        fetchStatusOptions();
        fetchRequests();
    }, [category, userId, refresh]);

    const handleAddHelpRequest = () => {
        navigation.navigate('CreateHelp', { category, userId });
    };

    const openStatusModal = (item) => {
        if (user?.data?.role?.name.toUpperCase() !== 'ADMIN' && user?.data?.role?.name.toUpperCase() !== 'STAFF') {
            Alert.alert('Permission Denied', 'Only admins or staff can change the status.');
            return;
        }

        setSelectedRequest(item);
        setSelectedStatus(item.status);
        setStatusModalVisible(true);
    };

    const handleStatusSubmit = async () => {
        if (!selectedStatus) {
            Alert.alert('Error', 'Please select a status');
            return;
        }

        try {
            await updateHelpRequestStatus(selectedRequest.id, selectedStatus);
            setStatusModalVisible(false);
            fetchRequests();
            Alert.alert('Success', 'Help request status updated successfully.');
        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to update status');
        }
    };

    const renderRequestItem = ({ item }) => (
        <View style={styles.requestCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.requestTitle}>{languageTexts?.categoryHelp?.requestTitle || "Help Request Detail"}</Text>
                {(user.data.role.name === "Admin" || user.data.role.name === "Staff") && item.status !== 'CLOSED' && (
                    <TouchableOpacity style={styles.statusContainer} onPress={() => openStatusModal(item)}>
                        <Icon name="edit" size={18} color="#0db6a5" style={styles.editIcon} />
                        <Text style={styles.statusChangeLabel}>
                            {item.status === 'OPEN' || item.status === 'IN_PROGRESS' ? languageTexts?.helpRequest?.update || 'Update' : 'No Status'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.cardContent}>
                {(user.data.role.name === "Admin" || user.data.role.name === "Staff") && (
                    <View style={styles.infoRow}>
                        <Text style={styles.requestLabel}>{languageTexts?.categoryHelp?.requestedBy || "Requested By"}</Text>
                        <Text style={styles.requestValue}>: {item.user?.name || 'No User'}</Text>
                    </View>
                )}
                <View style={styles.infoRow}>
                    <Text style={styles.requestLabel}>{languageTexts?.categoryHelp?.requestedOn || "Requested On"}</Text>
                    <Text style={styles.requestValue}>
                        : {item.created_at
                            ? `${new Date(item.created_at).toLocaleDateString()} ${new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
                            : 'No Date'}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.requestLabel}>{languageTexts?.categoryHelp?.status || "Status"}</Text>
                    <Text style={styles.colon}>:</Text>
                    <View style={styles.statusBadgeContainer}>
                        <View
                            style={[
                                styles.statusBadge,
                                {
                                    backgroundColor:
                                        item.status === 'Resolved' || item.status === 'CLOSED'
                                            ? '#43A047' // Green
                                            : item.status === 'In Progress' || item.status === 'IN_PROGRESS'
                                                ? '#FFC107' // Yellow
                                                : '#35c5f9', // Blue (Pending/OPEN)
                                },
                            ]}
                        >
                            <Text style={styles.statusBadgeText}>
                                {item.status === 'OPEN' ? languageTexts?.helpRequest?.statuses?.pending || 'Pending'
                                    : item.status === 'CLOSED' ? languageTexts?.helpRequest?.statuses?.resolved || 'Resolved'
                                    : item.status === 'IN_PROGRESS' ? languageTexts?.helpRequest?.statuses?.inProgress || 'In Progress'
                                    : item.status || 'No Status'}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.requestLabel}>{languageTexts?.services?.description || "Description"}</Text>
                    <Text style={styles.requestValue}>: {item.description || 'No Description'}</Text>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <LinearGradient colors={['#2753b2', '#e6e9f0']} style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#FFF" />
                <Text style={styles.loadingText}>{languageTexts?.servicesDirectory?.loading || 'Loading services...'}</Text>
            </LinearGradient>
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
            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate('HelpRequest', { userId })}
                >
                    <Icon name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.header}>{category.name} {languageTexts?.categoryHelp?.helpRequests || "Help Requests"}</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddHelpRequest}
                >
                    <Icon name="add" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>
            <Text style={styles.categoryNameText}>{languageTexts?.categoryHelp?.category || "Category"}: {category.name}</Text>
            <FlatList
                data={requests}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderRequestItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>{languageTexts?.categoryHelp?.emptyText ||"No help requests found for this category."}</Text>}
            />
            <Modal visible={statusModalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{languageTexts?.categoryHelp?.changeStatus || "Change Status"}</Text>
                        {statusOptions.length ? (
                            statusOptions.map(opt => (
                                <TouchableOpacity
                                    key={opt.value}
                                    onPress={() => setSelectedStatus(opt.value)}
                                    style={styles.radioRow}
                                >
                                    <View style={styles.radioCircle}>
                                        {selectedStatus === opt.value && <View style={styles.radioDot} />}
                                    </View>
                                    <Text style={styles.radioLabel}>{opt.label}</Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.errorText}>{"No status options available"}</Text>
                        )}
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setStatusModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>{languageTexts?.services?.cancel || "Cancel"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={handleStatusSubmit}>
                                <Text style={styles.buttonText}>{languageTexts?.categoryHelp?.ok || "OK"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFF',
        fontSize: 16,
        marginTop: 10,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 20,
        paddingBottom: 10,
    },
    backButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 80,
        zIndex: 1,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        flex: 1,
    },
    addButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 80,
        zIndex: 1,
    },
    categoryNameText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
        textAlign: 'center',
        marginVertical: 10,
    },
    listContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    requestCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    requestTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2753b2',
        flex: 1,
        marginRight: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0F7FA',
        borderRadius: 12,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    editIcon: {
        marginRight: 6,
    },
    statusChangeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0db6a5',
    },
    cardContent: {
        flexDirection: 'column',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center', // Vertically center items in the row
        marginBottom: 8,
    },
    requestLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2753b2',
        width: 120,
        textAlign: 'left',
    },
    requestValue: {
        fontSize: 15,
        color: '#555',
        flex: 1,
        textAlign: 'left',
    },
    colon: {
        fontSize: 15,
        color: '#555',
        marginRight: 4, // Space between colon and status badge
    },
    statusBadgeContainer: {
        flex: 1, // Allow the badge container to take up remaining space
        justifyContent: 'center', // Center badge vertically within its container
    },
    statusBadge: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignSelf: 'flex-start', // Align badge to the start of its container
    },
    statusBadgeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyText: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        color: '#555',
        marginTop: 2,
        marginBottom: 12,
        elevation: 2,
        alignItems: 'center',
        alignSelf: 'center',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 16,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2753b2',
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        width: '100%',
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#2753b2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    radioDot: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#2753b2',
    },
    radioLabel: {
        fontSize: 16,
        color: '#333',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    modalButton: {
        backgroundColor: '#2753b2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CategoryHelp;