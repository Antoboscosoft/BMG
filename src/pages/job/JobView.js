import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../language/commondir';
import { useForm, Controller } from 'react-hook-form';
import {
  getJobOpportunity,
  createJobOpportunity,
  editJobOpportunity,
  deleteJobOpportunity,
  updateJobRequestStatus,
  withdrawJobApplication,
  applyForJob,
  getMyJobRequests,
  getJobRequests,
  getCountries,
  getStates,
  getDistricts,
} from '../../api/auth';
import Toast from 'react-native-simple-toast';

const SearchableDropdown = ({
  label,
  placeholder,
  data,
  selectedValue,
  onSelect,
  error,
  disabled,
  loading,
  isMandatory,
  validateField,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    if (searchQuery) {
      const filtered = data.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchQuery, data]);

  const selectedItem = data.find((item) => item.id === Number(selectedValue));

  return (
    <View style={styles.inputContainer}>
      <View style={styles.labelContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        {isMandatory && <Text style={styles.mandatoryIndicator}>*</Text>}
      </View>
      {loading ? (
        <ActivityIndicator size="small" color="#2753b2" />
      ) : (
        <>
          <TouchableOpacity
            style={[
              styles.dropdownInput,
              error && styles.inputError,
              disabled && styles.disabledInput,
            ]}
            onPress={() => !disabled && setModalVisible(true)}
            disabled={disabled}
          >
            <Text style={selectedValue ? styles.dropdownText : styles.placeholderText}>
              {selectedItem ? selectedItem.name : placeholder}
            </Text>
            <Icon name="arrow-drop-down" size={16} color="#666" />
          </TouchableOpacity>
          {error && <Text style={styles.inputErrorText}>{error.message}</Text>}
        </>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModal}>
            <View style={styles.searchContainer}>
              <Icon name="search" size={18} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${label.toLowerCase()}...`}
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(false);
                  setSearchQuery('');
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredData}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    item.id === Number(selectedValue) && styles.selectedItem,
                  ]}
                  onPress={() => {
                    onSelect(item.id);
                    setModalVisible(false);
                    setSearchQuery('');
                    validateField && validateField(item.id);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownItemText}>{item.name}</Text>
                  {item.id === Number(selectedValue) && (
                    <Icon name="check" size={18} color="#2753b2" style={styles.tickIcon} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No results found</Text>}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

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

  // Address-related states
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const isMigrant = user?.data?.role?.name === 'Migrant';
  const isNonMigrant = !isMigrant;

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      address: '',
      no_of_vacancies: '0',
      country_id: '',
      state_id: '',
      district_id: '',
      active: true,
    },
  });

  const statusOptions = [
    { id: 'APPROVED', name: languageTexts?.jobView?.approveRequest || 'APPROVED' },
    { id: 'REJECTED', name: languageTexts?.jobView?.rejectRequest || 'REJECTED' },
  ];

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await getCountries();
        setCountries(response.data || []);
        const indiaId = response.data.find((country) => country.name === 'India')?.id || '';
        if (!isEditMode) {
          setValue('country_id', indiaId);
        }
      } catch (error) {
        Toast.show('Failed to load countries', Toast.SHORT);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      const countryId = control._formValues.country_id;
      if (countryId) {
        setLoadingStates(true);
        setValue('state_id', '');
        setValue('district_id', '');
        setDistricts([]);
        try {
          const response = await getStates(countryId);
          setStates(response.data || []);
        } catch (error) {
          Toast.show('Failed to load states', Toast.SHORT);
        } finally {
          setLoadingStates(false);
        }
      } else {
        setStates([]);
        setDistricts([]);
      }
    };
    fetchStates();
  }, [control._formValues.country_id]);

  useEffect(() => {
    const fetchDistricts = async () => {
      const stateId = control._formValues.state_id;
      if (stateId) {
        setLoadingDistricts(true);
        setValue('district_id', '');
        try {
          const response = await getDistricts(stateId);
          setDistricts(response.data || []);
        } catch (error) {
          Toast.show('Failed to load districts', Toast.SHORT);
        } finally {
          setLoadingDistricts(false);
        }
      } else {
        setDistricts([]);
      }
    };
    fetchDistricts();
  }, [control._formValues.state_id]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getJobOpportunity();
      setJobs(response.data || []);
    } catch (err) {
      setError(languageTexts?.jobView?.error?.fetchJobs || err.message || 'Failed to fetch job opportunities');
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
      console.error('Fetch Job Requests Error:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchJobRequests();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchJobRequests();
    });
    return unsubscribe;
  }, [navigation]);

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
          languageTexts?.jobView?.success?.updateTitle || 'Success',
          languageTexts?.jobView?.success?.update || 'Job opportunity updated successfully.',
          [{ text: languageTexts?.general?.ok || 'OK', onPress: () => fetchJobs() }],
        );
      } else {
        await createJobOpportunity(jobData);
        Alert.alert(
          languageTexts?.jobView?.success?.createTitle || 'Success',
          languageTexts?.jobView?.success?.create || 'Job opportunity created successfully.',
          [{ text: languageTexts?.general?.ok || 'OK', onPress: () => fetchJobs() }],
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
        country_id: countries.find((c) => c.name === 'India')?.id || '',
        state_id: '',
        district_id: '',
        active: true,
      });
    } catch (err) {
      Alert.alert(
        languageTexts?.jobView?.errorTitle || 'Error',
        err.message ||
          languageTexts?.jobView?.error?.createOrUpdate.replace(
            '{action}',
            isEditMode ? languageTexts?.jobView?.actions?.update || 'update' : languageTexts?.jobView?.actions?.create || 'create'
          ),
        [{ text: languageTexts?.general?.ok || 'OK' }],
      );
    }
  };

  const handleEdit = async (job) => {
    setIsEditMode(true);
    setCurrentJob(job);
    setValue('country_id', job.country_id?.toString() || '');
    setLoadingStates(true);
    try {
      const statesRes = await getStates(job.country_id);
      setStates(statesRes.data || []);
      setValue('state_id', job.state_id?.toString() || '');
      setLoadingDistricts(true);
      const districtsRes = await getDistricts(job.state_id);
      setDistricts(districtsRes.data || []);
      setValue('district_id', job.district_id?.toString() || '');
    } catch (error) {
      Toast.show('Failed to load address fields', Toast.SHORT);
    } finally {
      setLoadingStates(false);
      setLoadingDistricts(false);
    }
    setValue('title', job.title || '');
    setValue('description', job.description || '');
    setValue('address', job.address || '');
    setValue('no_of_vacancies', job.no_of_vacancies?.toString() || '0');
    setValue('active', job.active ?? true);
    setModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      await deleteJobOpportunity(selectedJobId);
      setDeleteModalVisible(false);
      setSelectedJobId(null);
      Alert.alert(
        languageTexts?.jobView?.success?.deleteTitle || 'Success',
        languageTexts?.jobView?.success?.delete || 'Job opportunity deleted successfully.',
        [{ text: languageTexts?.general?.ok || 'OK', onPress: () => fetchJobs() }],
      );
    } catch (err) {
      Alert.alert(
        languageTexts?.jobView?.errorTitle || 'Error',
        err.message || languageTexts?.jobView?.error?.delete || 'Failed to delete job opportunity. Please try again.',
        [{ text: languageTexts?.general?.ok || 'OK' }],
      );
    }
  };

  const handleApply = async (jobId) => {
    Alert.alert(
      languageTexts?.jobView?.alert?.applyTitle || 'Confirm',
      languageTexts?.jobView?.alert?.apply || 'Do you want to apply for this job?',
      [
        {
          text: languageTexts?.general?.cancel || 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: languageTexts?.general?.apply || 'Apply',
          onPress: async () => {
            try {
              await applyForJob(jobId);
              Alert.alert(
                languageTexts?.jobView?.success?.applyTitle || 'Success',
                languageTexts?.jobView?.success?.apply || 'Job application submitted successfully.',
                [{ text: languageTexts?.general?.ok || 'OK', onPress: () => fetchJobRequests() }],
              );
            } catch (err) {
              Alert.alert(
                languageTexts?.jobView?.errorTitle || 'Error',
                err.message || languageTexts?.jobView?.error?.apply || 'Failed to apply for job. Please try again.',
                [{ text: languageTexts?.general?.ok || 'OK' }],
              );
            }
          },
        },
      ],
    );
  };

  const handleWithdraw = async (requestId) => {
    Alert.alert(
      languageTexts?.jobView?.alert?.withdrawTitle || 'Confirm',
      languageTexts?.jobView?.alert?.withdraw || 'Do you want to withdraw your job application?',
      [
        {
          text: languageTexts?.general?.cancel || 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: languageTexts?.general?.withdraw || 'Withdraw',
          onPress: async () => {
            try {
              await withdrawJobApplication(requestId);
              Alert.alert(
                languageTexts?.jobView?.success?.withdrawTitle || 'Success',
                languageTexts?.jobView?.success?.withdraw || 'Job application withdrawn successfully.',
                [{ text: languageTexts?.general?.ok || 'OK', onPress: () => fetchJobRequests() }],
              );
            } catch (err) {
              Alert.alert(
                languageTexts?.jobView?.errorTitle || 'Error',
                err.message || languageTexts?.jobView?.error?.withdraw || 'Failed to withdraw job application. Please try again.',
                [{ text: languageTexts?.general?.ok || 'OK' }],
              );
            }
          },
        },
      ],
    );
  };

  const handleStatusChange = (request, status) => {
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
        languageTexts?.jobView?.success?.statusUpdateTitle || 'Success',
        languageTexts?.jobView?.success?.statusUpdate.replace('{status}', status.toLowerCase()) ||
          `Job request ${status.toLowerCase()} successfully.`,
        [{ text: languageTexts?.general?.ok || 'OK', onPress: () => fetchJobRequests() }],
      );
      setStatusModalVisible(false);
      setSelectedRequest(null);
      setSelectedStatus('');
      setRemark('');
    } catch (err) {
      Alert.alert(
        languageTexts?.jobView?.errorTitle || 'Error',
        err.message ||
          languageTexts?.jobView?.error?.statusUpdate.replace('{status}', status.toLowerCase()) ||
          `Failed to ${status.toLowerCase()} job request. Please try again.`,
        [{ text: languageTexts?.general?.ok || 'OK' }],
      );
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#2753b2', '#e6e9f0']} style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>{languageTexts?.jobView?.loading || 'Loading jobs...'}</Text>
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
                  country_id: countries.find((c) => c.name === 'India')?.id || '',
                  state_id: '',
                  district_id: '',
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
            <Text style={styles.noDataText}>
              {languageTexts?.jobView?.noJobs || 'No job opportunities found.'}
            </Text>
          </View>
        ) : (
          jobs.map((job) => {
            const userRequest = myJobRequests.find((req) => req.job_id === job.id);
            const jobRequestsForThisJob = jobRequests.filter((req) => req.job_id === job.id);

            return (
              <View key={job.id?.toString() || Math.random().toString()} style={styles.jobItem}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleWrapper}>
                    <Text style={styles.jobTitle}>
                      {job.title || languageTexts?.jobView?.placeholders?.jobTitle || 'Job Title Not Available'}
                    </Text>
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
                            <Text style={styles.actionButtonText}>
                              {languageTexts?.jobView?.withdraw || 'Withdraw'}
                            </Text>
                          </TouchableOpacity>
                        )
                      ) : (
                        <TouchableOpacity
                          style={styles.applyButton}
                          onPress={() => handleApply(job.id)}
                        >
                          <Icon name="send" size={20} color="#FFF" />
                          <Text style={styles.actionButtonText}>
                            {languageTexts?.jobView?.apply || 'Apply'}
                          </Text>
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
                          <Text style={styles.actionButtonText}>
                            {languageTexts?.jobView?.edit || 'Edit'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => {
                            setSelectedJobId(job.id);
                            setDeleteModalVisible(true);
                          }}
                        >
                          <Icon name="delete" size={20} color="#FFF" />
                          <Text style={styles.actionButtonText}>
                            {languageTexts?.jobView?.delete || 'Delete'}
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.infoRow}>
                    <Text style={styles.jobLabel}>{languageTexts?.jobView?.jobTitle || 'Job Title'}</Text>
                    <Text style={styles.jobValue}>
                      : {job.title || languageTexts?.jobView?.details?.notAvailable || 'Not Available'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.jobLabel}>{languageTexts?.jobView?.description || 'Description'}</Text>
                    <Text style={styles.jobValue}>
                      : {job.description || languageTexts?.jobView?.details?.description || 'No Description Available'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.jobLabel}>{languageTexts?.jobView?.vacancies || 'Vacancies'}</Text>
                    <Text style={styles.jobValue}>: {job.no_of_vacancies || 0}</Text>
                  </View>
                  {/* <View style={styles.infoRow}>
                    <Text style={styles.jobLabel}>{languageTexts?.jobView?.address || 'Current Address'}</Text>
                    <Text style={styles.jobValue}>
                      : {job.address || languageTexts?.jobView?.details?.notAvailable || 'Not Available'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.jobLabel}>{languageTexts?.jobView?.location || 'Location'}</Text>
                    <Text style={styles.jobValue}>
                      : {job.district?.name || languageTexts?.jobView?.details?.notAvailable || 'Not Available'},{' '}
                      {job.state?.name || 'Not Available'}, {job.country?.name || 'Not Available'}
                    </Text>
                  </View> */}
                  <View style={styles.infoRow}>
                    <Text style={styles.jobLabel}>{languageTexts?.jobView?.address || 'Address'}</Text>
                    <Text style={styles.jobValue}>
                      : {job.address || languageTexts?.jobView?.details?.notAvailable || 'Not Available'}
                      {job.district ? `, ${job.district.name}` : ''} 
                      {job.state ? `, ${job.state.name}` : ''} 
                      {job.country ? `, ${job.country.name}` : ''}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.jobLabel}>{languageTexts?.jobView?.postedOn || 'Posted On'}</Text>
                    <Text style={styles.jobValue}>
                      : {job.created_at
                        ? `${new Date(job.created_at).toLocaleDateString()} ${new Date(job.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}`
                        : languageTexts?.jobView?.details?.notAvailable || 'Not Available'}
                    </Text>
                  </View>
                  {isMigrant && userRequest && (
                    <View style={styles.infoRow}>
                      <Text style={styles.jobLabel}>{languageTexts?.jobView?.applicationStatus || 'Application Status'}</Text>
                      <Text> : </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              userRequest.status === 'APPROVED'
                                ? '#43A047'
                                : userRequest.status === 'REJECTED'
                                ? '#d32f2f'
                                : '#FFA000',
                          },
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>
                          {userRequest?.status === 'APPROVED' ? languageTexts?.jobView?.status?.approved : userRequest?.status === 'REJECTED' ? languageTexts?.jobView?.status?.rejected : languageTexts?.jobView?.status?.pending}
                        </Text>
                      </View>
                    </View>
                  )}
                  {isMigrant && userRequest && userRequest?.status === 'REJECTED' && (
                    <View style={styles.infoRow}>
                      <Text style={styles.jobLabel}>{languageTexts?.jobView?.remark || 'Remarks'}</Text>
                      <Text style={styles.jobValue}>
                        : {userRequest?.remarks || languageTexts?.jobView?.placeholders?.remark || 'No Remarks Provided'}
                      </Text>
                    </View>
                  )}
                  {isNonMigrant && jobRequestsForThisJob.length > 0 && (
                    <TouchableOpacity
                      style={styles.viewApplicantsButton}
                      onPress={() =>
                        navigation.navigate('ViewApplicants', {
                          applicants: jobRequestsForThisJob,
                          jobTitle: job.title,
                        })
                      }
                    >
                      <Text style={styles.viewApplicantsButtonText}>
                        {languageTexts?.jobView?.viewApplicants || 'View Applicants'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

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
                rules={{ required: languageTexts?.jobView?.error?.jobTitleRequired || 'Job title is required' }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{languageTexts?.jobView?.jobTitle || 'Job Title'}</Text>
                    <TextInput
                      style={[styles.input, error && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      placeholder={languageTexts?.jobView?.placeholders?.jobTitle || 'Enter job title'}
                      placeholderTextColor="#888"
                    />
                    {error && <Text style={styles.inputErrorText}>{error.message}</Text>}
                  </View>
                )}
              />
              <Controller
                control={control}
                name="description"
                rules={{ required: languageTexts?.jobView?.error?.descriptionRequired || 'Description is required' }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{languageTexts?.jobView?.description || 'Description'}</Text>
                    <TextInput
                      style={[styles.input, error && styles.inputError, styles.textArea]}
                      value={value}
                      onChangeText={onChange}
                      placeholder={languageTexts?.jobView?.placeholders?.description || 'Enter job description'}
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
                rules={{ required: languageTexts?.jobView?.error?.addressRequired || 'Address is required' }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{languageTexts?.jobView?.addressLine || 'Address Line 1'}</Text>
                    <TextInput
                      style={[styles.input, error && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      placeholder={languageTexts?.jobView?.placeholders?.addressc || 'Enter job address'}
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
                name="country_id"
                rules={{ required: 'Country is required' }}
                render={({ field: { onChange, value } }) => (
                  <SearchableDropdown
                    label={languageTexts?.jobView?.currentCountry || "Country"}
                    placeholder="Select Country"
                    data={countries}
                    selectedValue={value}
                    onSelect={(id) => {
                      onChange(id.toString());
                      setValue('state_id', '');
                      setValue('district_id', '');
                      setStates([]);
                      setDistricts([]);
                    }}
                    error={errors.country_id}
                    disabled={false}
                    loading={loadingCountries}
                    isMandatory={true}
                  />
                )}
              />
              <Controller
                control={control}
                name="state_id"
                rules={{ required: 'State is required' }}
                render={({ field: { onChange, value } }) => (
                  <SearchableDropdown
                    label={languageTexts?.jobView?.currentState || "State"}
                    placeholder={control._formValues.country_id ? languageTexts?.jobView?.placeholders?.selectState || 'Select State' : languageTexts?.jobView?.placeholders?.selectCountry || 'Select Country first'}
                    data={states}
                    selectedValue={value}
                    onSelect={(id) => {
                      onChange(id.toString());
                      setValue('district_id', '');
                      setDistricts([]);
                    }}
                    error={errors.state_id}
                    disabled={!control._formValues.country_id}
                    loading={loadingStates}
                    isMandatory={true}
                  />
                )}
              />
              <Controller
                control={control}
                name="district_id"
                rules={{ required: 'District is required' }}
                render={({ field: { onChange, value } }) => (
                  <SearchableDropdown
                    label={languageTexts?.jobView?.currentDistrict || "District"}
                    placeholder={control._formValues.state_id ? languageTexts?.jobView?.placeholders?.selectDistrict || 'Select District' : languageTexts?.jobView?.placeholders?.selectState || 'Select State first'}
                    data={districts}
                    selectedValue={value}
                    onSelect={(id) => onChange(id.toString())}
                    error={errors.district_id}
                    disabled={!control._formValues.state_id}
                    loading={loadingDistricts}
                    isMandatory={true}
                  />
                )}
              />
              <Controller
                control={control}
                name="no_of_vacancies"
                rules={{
                  required: languageTexts?.jobView?.error?.vacanciesRequired || 'Number of vacancies is required',
                  pattern: {
                    value: /^[0-9]+$/,
                    message: languageTexts?.jobView?.error?.vacanciesInvalid || 'Must be a valid number',
                  },
                }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>{languageTexts?.jobView?.vacancies || 'Number of Vacancies'}</Text>
                    <TextInput
                      style={[styles.input, error && styles.inputError]}
                      value={value}
                      onChangeText={(text) => {
                        const cleanText = text.replace(/[^\d]/g, '');
                        onChange(cleanText);
                      }}
                      placeholder={languageTexts?.jobView?.placeholders?.vacancies || 'Enter number of vacancies'}
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      maxLength={9}
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
                    country_id: countries.find((c) => c.name === 'India')?.id || '',
                    state_id: '',
                    district_id: '',
                    active: true,
                  });
                }}
              >
                <Text style={styles.modalButtonText}>{languageTexts?.general?.cancel || 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton1}
                onPress={handleSubmit(onSubmit)}
              >
                <Text style={styles.modalButtonText}>
                  {isEditMode ? languageTexts?.jobView?.update || 'Update' : languageTexts?.jobView?.create || 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                <Text style={styles.modalButtonText}>{languageTexts?.general?.cancel || 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonDelete}
                onPress={handleDelete}
              >
                <Text style={styles.modalButtonText}>{languageTexts?.jobView?.delete || 'Delete'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                ? languageTexts?.jobView?.approveRequest || 'Approve Job Request'
                : languageTexts?.jobView?.rejectRequest || 'Reject Job Request'}
            </Text>
            {selectedStatus === 'REJECTED' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{languageTexts?.jobView?.remark || 'Remark (Optional)'}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={remark}
                  onChangeText={setRemark}
                  placeholder={languageTexts?.jobView?.placeholders?.remark || 'Enter rejection remark'}
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
                      ? languageTexts?.jobView?.actions?.approve || 'Approve'
                      : languageTexts?.jobView?.actions?.reject || 'Reject'}
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
  viewApplicantsButton: {
    backgroundColor: '#2753b2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  viewApplicantsButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
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
    alignSelf: 'center',
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
    color: '#7b6767',
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
  inputContainer: {
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2753b2',
    marginBottom: 5,
  },
  mandatoryIndicator: {
    color: '#FF3B30',
    fontSize: 15,
    marginLeft: 4,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    justifyContent: 'space-between',
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginRight: 8,
  },
  dropdownText: {
    color: '#333',
    flex: 1,
    fontSize: 16,
  },
  placeholderText: {
    color: '#888',
    flex: 1,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  inputErrorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 5,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    // paddingLeft: 30, // Ensure placeholder doesn't overlap with icon
    paddingVertical: 0, // Prevent extra vertical padding
  },
  closeButton: {
    backgroundColor: '#2753b2',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedItem: {
    backgroundColor: '#E6F0FF',
  },
  modalItemText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  tickIcon: {
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 15,
    padding: 20,
    fontStyle: 'italic',
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
});

export default JobView;