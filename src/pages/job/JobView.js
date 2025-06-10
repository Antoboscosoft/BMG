import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, FlatList } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../language/commondir';
import { useForm, Controller } from 'react-hook-form';
import { getJobOpportunity, createJobOpportunity, editJobOpportunity, deleteJobOpportunity, updateJobRequestStatus, withdrawJobApplication, applyForJob, getMyJobRequests, getJobRequests } from '../../api/auth';

function JobView({ navigation, route }) {
    const { languageTexts, user } = useLanguage();
    const initialJobData = route.params?.jobData || {};
    const [jobs, setJobs] = useState([initialJobData]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentJob, setCurrentJob] = useState(null);
    const [jobRequests, setJobRequests] = useState([]);
    const [myJobRequests, setMyJobRequests] = useState([]);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [remark, setRemark] = useState('');

    const isMigrant = user?.data?.role?.name === 'Migrant';
    const isNonMigrant = !isMigrant;

    const { control, handleSubmit, reset, setValue } = useForm({
        defaultValues: {
            title: '',
            description: '',
            address: '',
            no_of_vacancies: '0',
            country_id: '7',
            state_id: '23',
            district_id: '3',
            active: true,
        },
    });

    const statusOptions = [
        // { id: 'PENDING', name: 'PENDING' },
        { id: 'APPROVED', name: 'APPROVED' },
        { id: 'REJECTED', name: 'REJECTED' },
    ];

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getJobOpportunity();
            setJobs(response.data || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch job opportunities');
        } finally {
            setLoading(false);
        }
    };

    const fetchJobRequests = async () => {
        try {
            if (isNonMigrant) {
                const response = await getJobRequests();
                setJobRequests(response.data || []);
            } else if (isMigrant) {
                const response = await getMyJobRequests();
                setMyJobRequests(response.data || []);
            }
        } catch (err) {
            console.error("Fetch Job Requests Error:", err);
        }
    };

    useEffect(() => {
        fetchJobs();
        fetchJobRequests();
    }, []);

    const onSubmit = async (data) => {
        const jobData = {
            title: data.title,
            description: data.description,
            address: data.address,
            no_of_vacancies: parseInt(data.no_of_vacancies) || 0,
            country_id: parseInt(data.country_id),
            state_id: parseInt(data.state_id),
            district_id: parseInt(data.district_id),
            active: data.active,
        };

        try {
            if (isEditMode) {
                await editJobOpportunity(currentJob.id, jobData);
                Alert.alert(
                    'Success',
                    'Job opportunity updated successfully.',
                    [{ text: 'OK', onPress: () => fetchJobs() }],
                );
            } else {
                await createJobOpportunity(jobData);
                Alert.alert(
                    'Success',
                    'Job opportunity created successfully.',
                    [{ text: 'OK', onPress: () => fetchJobs() }],
                );
            }
            setModalVisible(false);
            setIsEditMode(false);
            setCurrentJob(null);
            reset({
                title: '',
                description: '',
                address: '',
                no_of_vacancies: '0',
                country_id: '7',
                state_id: '23',
                district_id: '3',
                active: true,
            });
        } catch (err) {
            Alert.alert(
                'Error',
                err.message || `Failed to ${isEditMode ? 'update' : 'create'} job opportunity. Please try again.`,
                [{ text: 'OK' }],
            );
        }
    };

    const handleEdit = (job) => {
        setIsEditMode(true);
        setCurrentJob(job);
        setValue('title', job.title || '');
        setValue('description', job.description || '');
        setValue('address', job.address || '');
        setValue('no_of_vacancies', job.no_of_vacancies?.toString() || '0');
        setValue('country_id', job.country_id?.toString() || '7');
        setValue('state_id', job.state_id?.toString() || '23');
        setValue('district_id', job.district_id?.toString() || '3');
        setValue('active', job.active ?? true);
        setModalVisible(true);
    };

    const handleDelete = async () => {
        try {
            await deleteJobOpportunity(selectedJobId);
            setDeleteModalVisible(false);
            setSelectedJobId(null);
            Alert.alert(
                'Success',
                'Job opportunity deleted successfully.',
                [{ text: 'OK', onPress: () => fetchJobs() }],
            );
        } catch (err) {
            Alert.alert(
                'Error',
                err.message || 'Failed to delete job opportunity. Please try again.',
                [{ text: 'OK' }],
            );
        }
    };

    const handleApply = async (jobId) => {
        try {
            await applyForJob(jobId);
            Alert.alert(
                'Success',
                'Job application submitted successfully.',
                [{ text: 'OK', onPress: () => fetchJobRequests() }],
            );
        } catch (err) {
            Alert.alert(
                'Error',
                err.message || 'Failed to apply for job. Please try again.',
                [{ text: 'OK' }],
            );
        }
    };

    const handleWithdraw = async (requestId) => {
        try {
            await withdrawJobApplication(requestId);
            Alert.alert(
                'Success',
                'Job application withdrawn successfully.',
                [{ text: 'OK', onPress: () => fetchJobRequests() }],
            );
        } catch (err) {
            Alert.alert(
                'Error',
                err.message || 'Failed to withdraw job application. Please try again.',
                [{ text: 'OK' }],
            );
        }
    };

    const handleStatusChange = (request, status) => {
        setSelectedRequest(request);
        setSelectedStatus(status);
        if (status === 'PENDING') {
            // No modal for PENDING, just update status directly
            handleUpdateRequestStatus(request.id, status);
        } else {
            setStatusModalVisible(true);
            setRemark(''); // Reset remark when modal opens
        }
    };

    const handleUpdateRequestStatus = async (requestId, status, remark = '') => {
        try {
            await updateJobRequestStatus(requestId, status, remark);
            Alert.alert(
                'Success',
                `Job request ${status.toLowerCase()} successfully.`,
                [{ text: 'OK', onPress: () => fetchJobRequests() }],
            );
            setStatusModalVisible(false);
            setSelectedRequest(null);
            setSelectedStatus('');
            setRemark('');
        } catch (err) {
            Alert.alert(
                'Error',
                err.message || `Failed to ${status.toLowerCase()} job request. Please try again.`,
                [{ text: 'OK' }],
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

        return (
            <View style={styles.dropdownContainer}>
                <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setDropdownVisible(true)}
                >
                    <Text style={styles.dropdownText}>
                        {selectedItem ? selectedItem.name : placeholder}
                    </Text>
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
                            <FlatList
                                data={data}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={() => handleSelect(item.id)}
                                    >
                                        <Text style={styles.dropdownItemText}>{item.name}</Text>
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
                                <Text style={styles.closeDropdownText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };

    if (loading) {
        return (
            <LinearGradient colors={['#2753b2', '#e6e9f0']} style={[styles.container, styles.centered]}>
                <Text style={styles.loadingText}>{languageTexts?.servicesDirectory?.loading || 'Loading jobs...'}</Text>
            </LinearGradient>
        );
    }

    if (error) {
        return (
            <LinearGradient colors={['#2753b2', '#e6e9f0']} style={[styles.container, styles.centered]}>
                <Text style={styles.errorText}>{error}</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate('ServicesDirectory')}
                    >
                        <Icon name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.titleText}>
                            {languageTexts?.jobView?.title || 'Job Opportunities'}
                        </Text>
                    </View>
                    {isNonMigrant && (
                        <TouchableOpacity
                            style={styles.createJobBtn}
                            onPress={() => {
                                setIsEditMode(false);
                                reset({
                                    title: '',
                                    description: '',
                                    address: '',
                                    no_of_vacancies: '0',
                                    country_id: '7',
                                    state_id: '23',
                                    district_id: '3',
                                    active: true,
                                });
                                setModalVisible(true);
                            }}
                        >
                            <Icon name="add" size={24} color="#FFF" />
                        </TouchableOpacity>
                    )}
                </View>

                {jobs.length === 0 ? (
                    <View style={styles.noDataContainer}>
                        <Text style={styles.noDataText}>No job opportunities found.</Text>
                    </View>
                ) : (
                    jobs.map((job) => {
                        const userRequest = myJobRequests.find(req => req.job_id === job.id);
                        const jobRequestsForThisJob = jobRequests.filter(req => req.job_id === job.id);

                        return (
                            <View key={job.id?.toString() || Math.random().toString()} style={styles.jobItem}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.titleWrapper}>
                                        <Text style={styles.jobTitle}>{job.title || 'Job Title Not Available'}</Text>
                                    </View>
                                    <View style={styles.actionButtons}>
                                        {isMigrant && (
                                            userRequest ? (
                                                userRequest.status !== 'APPROVED' && userRequest.status !== 'REJECTED' && (
                                                <TouchableOpacity
                                                    style={styles.withdrawButton}
                                                    onPress={() => handleWithdraw(userRequest.id)}
                                                >
                                                    <Icon name="cancel" size={20} color="#FFF" />
                                                    <Text style={styles.actionButtonText}>Withdraw</Text>
                                                </TouchableOpacity>
                                                )
                                            ) : (
                                                <TouchableOpacity
                                                    style={styles.applyButton}
                                                    onPress={() => handleApply(job.id)}
                                                >
                                                    <Icon name="check" size={20} color="#FFF" />
                                                    <Text style={styles.actionButtonText}>Apply</Text>
                                                </TouchableOpacity>
                                            )
                                        )}
                                        {isNonMigrant && (
                                            <>
                                                <TouchableOpacity
                                                    style={styles.editButton}
                                                    onPress={() => handleEdit(job)}
                                                >
                                                    <Icon name="edit" size={20} color="#FFF" />
                                                    <Text style={styles.actionButtonText}>Edit</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.deleteButton}
                                                    onPress={() => {
                                                        setSelectedJobId(job.id);
                                                        setDeleteModalVisible(true);
                                                    }}
                                                >
                                                    <Icon name="delete" size={20} color="#FFF" />
                                                    <Text style={styles.actionButtonText}>Delete</Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.cardContent}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.jobLabel}>Job Title</Text>
                                        <Text style={styles.jobValue}>
                                            : {job.title || 'Not Available'}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.jobLabel}>Type</Text>
                                        <Text style={styles.jobValue}>
                                            : {job.type || 'Not Available'}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.jobLabel}>Description</Text>
                                        <Text style={styles.jobValue}>
                                            : {job.description || 'No Description Available'}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.jobLabel}>Vacancies</Text>
                                        <Text style={styles.jobValue}>
                                            : {job.no_of_vacancies || 0}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.jobLabel}>Address</Text>
                                        <Text style={styles.jobValue}>
                                            : {job.address || 'Not Available'}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.jobLabel}>Location</Text>
                                        <Text style={styles.jobValue}>
                                            : {job.district?.name || 'Not Available'}, {job.state?.name || 'Not Available'}, {job.country?.name || 'Not Available'}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.jobLabel}>Posted On</Text>
                                        <Text style={styles.jobValue}>
                                            : {job.created_at
                                                ? `${new Date(job.created_at).toLocaleDateString()} ${new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
                                                : 'Not Available'}
                                        </Text>
                                    </View>
                                    {isMigrant && userRequest && (
                                        <View style={styles.infoRow}>
                                            <Text style={styles.jobLabel}>Application Status</Text>
                                            <View style={[styles.statusBadge, { backgroundColor: userRequest.status === 'APPROVED' ? '#43A047' : userRequest.status === 'REJECTED' ? '#d32f2f' : '#FFA000' }]}>
                                                <Text style={styles.statusBadgeText}>
                                                    : {userRequest.status || 'PENDING'}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                    {isNonMigrant && jobRequestsForThisJob.length > 0 && (
                                        <View style={styles.requestsContainer}>
                                            <Text style={styles.requestsTitle}>Applications</Text>
                                            {jobRequestsForThisJob.map((request) => (
                                                <View key={request.id} style={styles.requestItem}>
                                                    {console.log("request : ", request)}
                                                    <View style={styles.requestDetails}>
                                                        <Text style={styles.requestLabel}>Applicant: {request.requester?.name || 'Unknown'}</Text>
                                                        <Text style={styles.requestLabel}>
                                                            Applied On: {request.created_at
                                                                ? `${new Date(request.created_at).toLocaleDateString()} ${new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
                                                                : 'Not Available'}
                                                        </Text>
                                                        <View style={styles.requestStatus}>
                                                            <Text style={styles.requestLabel}>Status: </Text>
                                                            <SearchableDropdown
                                                                data={statusOptions}
                                                                selectedValue={request.status || 'PENDING'}
                                                                onSelect={(status) => handleStatusChange(request, status)}
                                                                placeholder="Select Status"
                                                            />
                                                        </View>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Modal for creating/editing a job */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {isEditMode
                                ? languageTexts?.jobView?.editJob || 'Edit Job Opportunity'
                                : languageTexts?.jobView?.createJob || 'Create Job Opportunity'}
                        </Text>
                        <ScrollView style={styles.modalForm}>
                            <Controller
                                control={control}
                                name="title"
                                rules={{ required: 'Job title is required' }}
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>Job Title</Text>
                                        <TextInput
                                            style={[styles.input, error && styles.inputError]}
                                            value={value}
                                            onChangeText={onChange}
                                            placeholder="Enter job title"
                                            placeholderTextColor="#888"
                                        />
                                        {error && <Text style={styles.inputErrorText}>{error.message}</Text>}
                                    </View>
                                )}
                            />
                            <Controller
                                control={control}
                                name="description"
                                rules={{ required: 'Description is required' }}
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>Description</Text>
                                        <TextInput
                                            style={[styles.input, error && styles.inputError, styles.textArea]}
                                            value={value}
                                            onChangeText={onChange}
                                            placeholder="Enter job description"
                                            placeholderTextColor="#888"
                                            multiline
                                            numberOfLines={4}
                                        />
                                        {error && <Text style={styles.inputErrorText}>{error.message}</Text>}
                                    </View>
                                )}
                            />
                            <Controller
                                control={control}
                                name="address"
                                rules={{ required: 'Address is required' }}
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>Address</Text>
                                        <TextInput
                                            style={[styles.input, error && styles.inputError, styles.textArea]}
                                            value={value}
                                            onChangeText={onChange}
                                            placeholder="Enter job address"
                                            placeholderTextColor="#888"
                                            multiline
                                            numberOfLines={3}
                                        />
                                        {error && <Text style={styles.inputErrorText}>{error.message}</Text>}
                                    </View>
                                )}
                            />
                            <Controller
                                control={control}
                                name="no_of_vacancies"
                                rules={{ required: 'Number of vacancies is required', pattern: { value: /^\d+$/, message: 'Must be a number' } }}
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>Number of Vacancies</Text>
                                        <TextInput
                                            style={[styles.input, error && styles.inputError]}
                                            value={value}
                                            onChangeText={onChange}
                                            placeholder="Enter number of vacancies"
                                            placeholderTextColor="#888"
                                            keyboardType="numeric"
                                        />
                                        {error && <Text style={styles.inputErrorText}>{error.message}</Text>}
                                    </View>
                                )}
                            />
                        </ScrollView>
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => {
                                    setModalVisible(false);
                                    setIsEditMode(false);
                                    setCurrentJob(null);
                                    reset({
                                        title: '',
                                        description: '',
                                        address: '',
                                        no_of_vacancies: '0',
                                        country_id: '7',
                                        state_id: '23',
                                        district_id: '3',
                                        active: true,
                                    });
                                }}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButton1}
                                onPress={handleSubmit(onSubmit)}
                            >
                                <Text style={styles.modalButtonText}>
                                    {isEditMode ? 'Update' : 'Create'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={deleteModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {languageTexts?.jobView?.deleteConfirmation || 'Are you sure you want to delete this job opportunity?'}
                        </Text>
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => {
                                    setDeleteModalVisible(false);
                                    setSelectedJobId(null);
                                }}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButtonDelete}
                                onPress={handleDelete}
                            >
                                <Text style={styles.modalButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Status Update Modal */}
            <Modal
                visible={statusModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setStatusModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {selectedStatus === 'APPROVED' ? 'Approve Job Request' : 'Reject Job Request'}
                        </Text>
                        {selectedStatus === 'REJECTED' && (
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Remark (Optional)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={remark}
                                    onChangeText={setRemark}
                                    placeholder="Enter rejection remark"
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
                                <Icon name="cancel" size={24} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButton1}
                                onPress={() => handleUpdateRequestStatus(selectedRequest.id, selectedStatus, remark)}
                            >
                                <Icon name="check" size={24} color="#FFF" />
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
    createJobBtn: {
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        padding: 8,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#FFF',
        marginTop: 10,
    },
    errorText: {
        fontSize: 16,
        color: '#d32f2f',
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
    jobItem: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginTop: 2,
        marginBottom: 12,
        elevation: 2,
        position: 'relative',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    titleWrapper: {
        flex: 1,
        minWidth: 0,
        marginRight: 8,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2753b2',
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    applyButton: {
        flexDirection: 'row',
        backgroundColor: '#43A047',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginRight: 8,
        alignItems: 'center',
    },
    withdrawButton: {
        flexDirection: 'row',
        backgroundColor: '#FFA000',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginRight: 8,
        alignItems: 'center',
    },
    editButton: {
        flexDirection: 'row',
        backgroundColor: '#0db6a5',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginRight: 8,
        alignItems: 'center',
    },
    deleteButton: {
        flexDirection: 'row',
        backgroundColor: '#d32f2f',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    cardContent: {
        flexDirection: 'column',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    jobLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2753b2',
        width: 120,
        textAlign: 'left',
    },
    jobValue: {
        fontSize: 15,
        color: '#555',
        flex: 1,
        textAlign: 'left',
    },
    statusBadge: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginLeft: 4,
    },
    statusBadgeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    requestsContainer: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 10,
    },
    requestsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2753b2',
        marginBottom: 8,
    },
    requestItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    requestDetails: {
        flex: 1,
    },
    requestLabel: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    requestStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropdownContainer: {
        flex: 1,
        marginLeft: 8,
    },
    dropdownButton: {
        flexDirection: 'row',
        backgroundColor: '#2753b2',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
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
    modalForm: {
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
    inputError: {
        borderColor: '#d32f2f',
    },
    inputErrorText: {
        color: '#d32f2f',
        fontSize: 12,
        marginTop: 5,
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
        paddingVertical: 10,
        alignItems: 'center',
    },
    modalButtonDelete: {
        flex: 1,
        marginHorizontal: 8,
        backgroundColor: '#d32f2f',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default JobView;