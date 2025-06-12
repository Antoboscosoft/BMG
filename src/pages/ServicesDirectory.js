import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BackIcon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { getJobOpportunity, getServiceCategories } from '../api/auth';
import { useLanguage } from '../language/commondir';

// Updated icon mapping based on API response names
const serviceIcons = {
    'Healthcare': 'hospital-box',
    'Legal': 'gavel',
    'Shelter': 'home',
    'Skill Training': 'school',
    'default': 'help-circle'
};

// Description mapping since API doesn't provide descriptions
const serviceDescriptions = {
    'Healthcare': 'Access medical care and health resources',
    'Legal': 'Get assistance with immigration and legal issues',
    'Shelter': 'Find temporary housing and shelter services',
    'Skill Training': 'Learn new skills for employment opportunities',
    'default': 'Service available for migrants'
};

function ServicesDirectory({ navigation }) {
    const { languageTexts } = useLanguage();
    const [services, setServices] = useState([]);
    const [jobOpportunity, setJobOpportunity] = useState(null); // State for job opportunity
    const [loading, setLoading] = useState(true);
    const [jobLoading, setJobLoading] = useState(true); // Separate loading state for job opportunity
    const [error, setError] = useState(null);
    const [jobError, setJobError] = useState(null); // Separate error state for job opportunity

    // Fetch service categories
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const response = await getServiceCategories();
                // console.log("response data from api >>>> ", response);

                if (response && response.status && response.data) {
                    const formattedServices = response.data.map(service => ({
                        id: service?.id.toString(),
                        name: languageTexts?.servicesDirectory?.services?.[service.name.replace(/\s+/g, '')] || service?.name,
                        icon: serviceIcons[service.name] || serviceIcons['default'],
                        description: languageTexts?.servicesDirectory?.descriptions?.[service.name.replace(/\s+/g, '')] || languageTexts?.servicesDirectory?.descriptions?.default || 'Service description not available',
                        category_id: service?.id,
                        available: service?.available,
                        services: service?.requested
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

    // Fetch job opportunities
    useEffect(() => {
        const getJobOpportunityFunc = async () => {
            try {
                setJobLoading(true);
                const response = await getJobOpportunity();
                console.log("response job oppo: -> ", response);
                setJobOpportunity(response.data); // Store job opportunity data
            } catch (err) {
                setJobError(languageTexts?.servicesDirectory?.error?.fetch || 'Failed to load job opportunities.');
            } finally {
                setJobLoading(false);
            }
        };
        getJobOpportunityFunc();
    }, [languageTexts]);

    const renderServiceItem = ({ item }) => {
        const isApplied = item?.services !== null;
        return (
            <View style={[
                styles.serviceCard,
                !item.available ? styles.unavailableCard : styles.availableCard
            ]}>
                <View style={styles.serviceContent}>
                    <Icon
                        name={item.icon}
                        size={30}
                        color={item.available ? "#333" : "#aaa"}
                        style={styles.serviceIcon}
                    />
                    <View style={styles.serviceTextContainer}>
                        <Text style={[
                            styles.serviceName,
                            !item.available && styles.unavailableText
                        ]}>
                            {item.name}
                        </Text>
                        <Text style={[
                            styles.serviceDescription,
                            !item.available && styles.unavailableText
                        ]}>
                            {item.description}
                        </Text>
                    </View>
                </View>
                {item?.available ? (
                    <TouchableOpacity
                        style={[isApplied ? styles.appliedButton : styles.applyButton]}
                        onPress={() => handleApply(item, isApplied)}
                        activeOpacity={0.8}
                    >
                        <BackIcon name="visibility" size={20} color="#FFF" />
                        <Text style={[isApplied ? styles.appliedButtonText : styles.applyButtonText]}>
                            { languageTexts?.servicesDirectory?.view || "View"}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.disabledButton}>
                        <Text style={styles.disabledButtonText}>{languageTexts?.servicesDirectory?.unavailable || 'Unavailable'}</Text>
                    </View>
                )}
            </View>
        );
    };

    // Render Job Opportunity Card
    const renderJobOpportunityCard = () => {
        if (jobLoading) {
            return (
                <View style={[styles.jobCard, styles.loadingContainer]}>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={styles.loadingText}>{languageTexts?.servicesDirectory?.loading || 'Loading job opportunities...'}</Text>
                </View>
            );
        }

        if (jobError) {
            return (
                <View style={[styles.jobCard, styles.errorContainer]}>
                    <Text style={styles.errorText}>{jobError}</Text>
                </View>
            );
        }

        if (!jobOpportunity || jobOpportunity.length === 0) {
            return (
                <View style={[styles.jobCard, styles.emptyContainer]}>
                    <Text style={styles.emptyText}>{languageTexts?.servicesDirectory?.emptyJob || 'No job opportunities available at the moment.'}</Text>
                </View>
            );
        }

        // Assuming jobOpportunity is an array; display the first job for simplicity
        const job = jobOpportunity[0];
        return (
            <View style={styles.jobCard}>
                <View style={styles.serviceContent}>
                    <Icon
                        name="briefcase" // Icon for job opportunity
                        size={30}
                        color="#333"
                        style={styles.serviceIcon}
                    />
                    <View style={styles.serviceTextContainer}>
                        <Text style={styles.jobTitle}>
                            {languageTexts?.servicesDirectory?.jobOpportunity || 'Job Opportunity'}
                        </Text>
                        {/* <Text style={styles.serviceDescription}>
                            {job?.title || 'Job Title Not Available'} - {job?.type || 'Type Not Available'}
                        </Text> */}
                        {/* <Text style={styles.serviceDescription}>
                            {job?.description || 'No description available.'}
                        </Text> */}
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => navigation.navigate('JobView', { jobData: job })}
                    activeOpacity={0.8}
                >
                    <BackIcon name="visibility" size={20} color="#FFF" />
                    <Text style={styles.applyButtonText}>
                        {languageTexts?.servicesDirectory?.view || 'View'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

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
            <LinearGradient colors={['#2753b2', '#e6e9f0']} style={[styles.container, styles.errorContainer]}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => {
                        setError(null);
                        setLoading(true);
                        useEffect(() => {
                            const fetchServices = async () => {
                                try {
                                    const response = await getServiceCategories();
                                    if (response && response.data) {
                                        const formattedServices = response.data.map(service => ({
                                            id: service.id.toString(),
                                            name: service.name,
                                            icon: serviceIcons[service.name] || serviceIcons['default'],
                                            description: service.description || 'Service description not available',
                                            category_id: service.id
                                        }));
                                        setServices(formattedServices);
                                    }
                                } catch (err) {
                                    setError('Failed to load services. Please try again.');
                                } finally {
                                    setLoading(false);
                                }
                            };
                            fetchServices();
                        }, []);
                    }}
                >
                    <Text style={styles.retryButtonText}>{languageTexts?.servicesDirectory?.retry || 'Retry'}</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    if (services.length === 0 && !jobOpportunity) {
        return (
            <LinearGradient colors={['#2753b2', '#e6e9f0']} style={[styles.container, styles.emptyContainer]}>
                <Text style={styles.emptyText}>{languageTexts?.servicesDirectory?.empty || 'No services or job opportunities available at the moment.'}</Text>
            </LinearGradient>
        );
    }

    const handleApply = (service, isApplied) => {
        const serviceData = {
            category_id: service.id,
            category_name: service.name,
            description: isApplied ? service?.services?.description : '',
            service_id: isApplied ? service?.services?.id : null,
            isApplied: isApplied,
            requested_user_id: isApplied ? service?.services?.requested_user_id : null
        };
        navigation.navigate('CategoryServices', { serviceData });
    };

    return (
        <LinearGradient
            colors={['#2753b2', '#e6e9f0']}
            style={styles.container}
        >
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Dashboard')}
            >
                <BackIcon name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.header}>
                <Image
                    source={require('../asserts/images/s1.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.headerText}>{languageTexts?.menu?.servicesDirectory || 'Services Directory'}</Text>
            </View>

            <FlatList
                data={services}
                renderItem={renderServiceItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListHeaderComponent={renderJobOpportunityCard} // Add the job opportunity card at the top
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="emoticon-sad" size={40} color="#666" />
                        <Text style={styles.emptyText}>{languageTexts?.servicesDirectory?.emptyList || 'No services available at this time'}</Text>
                    </View>
                }
            />
        </LinearGradient>
    );
}

export default ServicesDirectory;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#FFF',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#FFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#2753b2',
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
    backButton: {
        position: 'absolute',
        top: 35,
        left: 20,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 80,
        zIndex: 1,
    },
    backButtonText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    header: {
        alignItems: 'center',
        paddingTop: 6,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#DDD',
    },
    logo: {
        width: 290,
        height: 200,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    listContainer: {
        padding: 15,
    },
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    jobCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#FFD700', // Gold color to distinguish job card
    },
    serviceContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    serviceIcon: {
        marginRight: 15,
    },
    serviceTextContainer: {
        flex: 1,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    serviceDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    availableCard: {
        backgroundColor: '#f9f9f9',
        borderLeftWidth: 4,
        borderLeftColor: '#2753b2',
    },
    unavailableCard: {
        backgroundColor: '#f9f9f9',
        borderLeftWidth: 4,
        borderLeftColor: '#ff6b6b',
    },
    unavailableText: {
        color: '#aaa',
    },
    disabledButton: {
        backgroundColor: '#f5f5f5',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    disabledButtonText: {
        color: '#ff6b6b',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 5,
    },
    unavailableIcon: {
        marginRight: 3,
    },
    applyButton: {
        flexDirection: 'row',
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        shadowColor: '#2753b2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    applyButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    appliedButton: {
        flexDirection: 'row',
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    appliedButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 5,
    },
});