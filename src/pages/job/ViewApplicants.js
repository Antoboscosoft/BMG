import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, FlatList } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../language/commondir';
import { updateJobRequestStatus } from '../../api/auth';

function ViewApplicants({ navigation, route }) {
    const { languageTexts } = useLanguage();
    const { applicants, jobTitle } = route.params;
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [remark, setRemark] = useState('');

    const statusOptions = [
        { 
            id: 'APPROVED', 
            displayName: languageTexts?.viewApplicants?.approved || 'Approved',
            modalName: languageTexts?.viewApplicants?.approveRequest || 'Approve Job Request'
        },
        { 
            id: 'REJECTED', 
            displayName: languageTexts?.viewApplicants?.rejected || 'Rejected',
            modalName: languageTexts?.viewApplicants?.rejectRequest || 'Reject Job Request'
        },
    ];

    const handleStatusChange = (request, status) => {
        console.log('request:', request, 'status:', status);
        setSelectedRequest(request);
        setSelectedStatus(status);
        if (status === 'PENDING') {
            handleUpdateRequestStatus(request.id, status);
        } else {
            setStatusModalVisible(true);
            setRemark('');
        }
    };

    const handleUpdateRequestStatus = async (requestId, status, remark = '') => {
        try {
            await updateJobRequestStatus(requestId, status, remark);
            Alert.alert(
                languageTexts?.viewApplicants?.success?.statusUpdateTitle || 'Success',
                languageTexts?.viewApplicants?.success?.statusUpdate?.replace('{status}', status.toLowerCase()) || `Job request ${status.toLowerCase()} successfully.`,
                [{ text: languageTexts?.general?.ok || 'OK', onPress: () => navigation.goBack() }],
            );
            setStatusModalVisible(false);
            setSelectedRequest(null);
            setSelectedStatus('');
            setRemark('');
        } catch (err) {
            Alert.alert(
                languageTexts?.viewApplicants?.errorTitle || 'Error',
                err.message || languageTexts?.viewApplicants?.error?.statusUpdate?.replace('{status}', status.toLowerCase()) || `Failed to ${status.toLowerCase()} job request. Please try again.`,
                [{ text: languageTexts?.general?.ok || 'OK' }],
            );
        }
    };

    const SearchableDropdown = ({ data, selectedValue, onSelect, placeholder }) => {
        const [dropdownVisible, setDropdownVisible] = useState(false);

        const handleSelect = (value) => {
            onSelect(value);
            setDropdownVisible(false);
        };

        const selectedItem = data.find(item => item.id === selectedValue);

        // Determine background color based on selectedValue
        const getStatusBackgroundColor = (status) => {
            switch (status) {
                case 'APPROVED':
                    return '#43A047'; // Green for APPROVED
                case 'REJECTED':
                    return '#d32f2f'; // Red for REJECTED
                default:
                    return '#FFA000'; // Yellow for PENDING
            }
        };

        // Determine the dropdown button background color
        const dropdownBackgroundColor = selectedItem
            ? getStatusBackgroundColor(selectedValue)
            : '#898989'; // Light gray for placeholder state

        return (
            <View style={styles.dropdownContainer}>
                <TouchableOpacity
                    style={[
                        styles.dropdownButton,
                        { backgroundColor: dropdownBackgroundColor }
                    ]}
                    onPress={() => setDropdownVisible(true)}
                >
                    {selectedItem ? (
                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: getStatusBackgroundColor(selectedValue) }
                            ]}
                        >
                            <Text style={styles.statusBadgeText}>
                                {selectedItem.displayName}
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.dropdownText}>
                            {placeholder || languageTexts?.viewApplicants?.selectStatus || 'Select Status'}
                        </Text>
                    )}
                    <Icon name="arrow-drop-down" size={20} color="#FFF" />
                </TouchableOpacity>
                <Modal
                    visible={dropdownVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setDropdownVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.dropdownModal}>
                            <Text style={styles.dropdownModalTitle}>
                                {languageTexts?.viewApplicants?.selectStatusTitle || 'Select Status for the Job Request'}
                            </Text>
                            <FlatList
                                data={data}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={() => handleSelect(item.id)}
                                    >
                                        <Text style={styles.dropdownItemText}>{item.modalName}</Text>
                                        {item.id === selectedValue && (
                                            <Icon name="check" size={20} color="#2753b2" />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity
                                style={styles.closeDropdownButton}
                                onPress={() => setDropdownVisible(false)}
                            >
                                <Text style={styles.closeDropdownText}>
                                    {languageTexts?.viewApplicants?.closeDropdown || 'Close'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };

    return (
        <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.titleText}>
                            {languageTexts?.viewApplicants?.title?.replace('{jobTitle}', jobTitle) || `Applicants for ${jobTitle}`}
                        </Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {applicants.length === 0 ? (
                    <View style={styles.noDataContainer}>
                        <Text style={styles.noDataText}>
                            {languageTexts?.viewApplicants?.noApplicants || 'No applicants found for this job.'}
                        </Text>
                    </View>
                ) : (
                    applicants.map((request) => (
                        <View key={request.id} style={styles.applicantItem}>
                            <View style={styles.applicantDetails}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.applicantLabel}>
                                        {languageTexts?.viewApplicants?.applicant || 'Applicant'}
                                    </Text>
                                    <Text style={styles.applicantValue}>
                                        : {request.requester?.name || languageTexts?.viewApplicants?.details?.unknown || 'Unknown'}
                                    </Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.applicantLabel}>
                                        {languageTexts?.viewApplicants?.appliedOn || 'Applied On'}
                                    </Text>
                                    <Text style={styles.applicantValue}>
                                        : {request.created_at
                                            ? `${new Date(request.created_at).toLocaleDateString()} ${new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
                                            : languageTexts?.viewApplicants?.details?.notAvailable || 'Not Available'}
                                    </Text>
                                </View>
                                <View style={styles.applicantStatus}>
                                    <Text style={styles.applicantLabel}>
                                        {languageTexts?.viewApplicants?.status || 'Status'}:{' '}
                                    </Text>
                                    <SearchableDropdown
                                        data={statusOptions}
                                        selectedValue={request.status || 'PENDING'}
                                        onSelect={(status) => handleStatusChange(request, status)}
                                        placeholder={languageTexts?.viewApplicants?.selectStatus || 'Select Status'}
                                    />
                                </View>
                                {request.status === 'REJECTED' && request.remark && (
                                    <View style={styles.infoRow}>
                                        <Text style={styles.applicantLabel}>
                                            {languageTexts?.viewApplicants?.remark || 'Remarks'}
                                        </Text>
                                        <Text style={styles.applicantValue}>
                                            : {request.remark || languageTexts?.viewApplicants?.placeholders?.remark || 'No Remarks Provided'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            <Modal
                visible={statusModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setStatusModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {selectedStatus === 'APPROVED'
                                ? languageTexts?.viewApplicants?.approveRequest || 'Approve Job Request'
                                : languageTexts?.viewApplicants?.rejectRequest || 'Reject Job Request'}
                        </Text>
                        {selectedStatus === 'REJECTED' && (
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>
                                    {languageTexts?.viewApplicants?.remark || 'Remark (Optional)'}
                                </Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={remark}
                                    onChangeText={setRemark}
                                    placeholder={languageTexts?.viewApplicants?.placeholders?.remark || 'Enter rejection remark'}
                                    placeholderTextColor="#888"
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        )}
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => {
                                    setStatusModalVisible(false);
                                    setSelectedRequest(null);
                                    setSelectedStatus('');
                                    setRemark('');
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={[styles.modalButtonText, { color: '#FFF', marginRight: 5 }]}>
                                        {languageTexts?.general?.cancel || 'Cancel'}
                                    </Text>
                                    <Icon name="cancel" size={24} color="#FFF" />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButton1}
                                onPress={() => handleUpdateRequestStatus(selectedRequest.id, selectedStatus, remark)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={[styles.modalButtonText, { color: '#FFF', marginRight: 5 }]}>
                                        {selectedStatus === 'APPROVED'
                                            ? languageTexts?.viewApplicants?.actions?.approve || 'Approve'
                                            : languageTexts?.viewApplicants?.actions?.reject || 'Reject'}
                                    </Text>
                                    <Icon name="check" size={24} color="#FFF" />
                                </View>
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
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 20,
        paddingBottom: 10,
    },
    backButton: {
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        padding: 8,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    titleText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
    },
    noDataContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginTop: 2,
        marginBottom: 12,
        elevation: 2,
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },
    applicantItem: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginTop: 2,
        marginBottom: 12,
        elevation: 2,
    },
    applicantDetails: {
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    applicantLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2753b2',
        width: 120,
        textAlign: 'left',
    },
    applicantValue: {
        fontSize: 15,
        color: '#555',
        flex: 1,
        textAlign: 'left',
    },
    applicantStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    dropdownContainer: {
        flex: 1,
        marginLeft: 8,
    },
    dropdownButton: {
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
    statusBadge: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    statusBadgeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownModal: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxHeight: '50%',
    },
    dropdownModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#11399f',
        marginBottom: 15,
        textAlign: 'center',
    },
    dropdownItem: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
    },
    closeDropdownButton: {
        marginTop: 10,
        backgroundColor: '#2753b2',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeDropdownText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 15,
    },
    inputContainer: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2753b2',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        fontSize: 15,
        color: '#333',
        backgroundColor: '#f9f9f9',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        marginHorizontal: 8,
        backgroundColor: '#6a6865',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    modalButton1: {
        flex: 1,
        marginHorizontal: 8,
        backgroundColor: '#2753b2',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ViewApplicants;