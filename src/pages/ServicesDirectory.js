import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient'; // <-- make sure this is installed
import { getServiceCategories } from '../api/auth'; // Import the new API function
import { useLanguage } from '../language/commondir';


// Icon mapping for different service types
// const serviceIcons = {
//     'Healthcare Services': 'hospital-box',
//     'Legal Aid': 'gavel',
//     'Job Opportunities': 'briefcase',
//     'Language Support': 'translate',
//     'Community Support': 'account-group',
//     // Add more mappings as needed based on your API response
//     'default': 'help-circle' // Default icon
// };

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const services = [
    //     { id: '1', name: 'Healthcare Services', icon: 'hospital-box', description: 'Access medical care and health resources.' },
    //     { id: '2', name: 'Legal Aid', icon: 'gavel', description: 'Get assistance with immigration and legal issues.' },
    //     { id: '3', name: 'Job Opportunities', icon: 'briefcase', description: 'Find employment and career support.' },
    //     { id: '4', name: 'Language Support', icon: 'translate', description: 'Learn languages and get translation help.' },
    //     { id: '5', name: 'Community Support', icon: 'account-group', description: 'Connect with local migrant communities.' },
    // ];

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const response = await getServiceCategories();
                console.log("response data from api  >>>> ", response);

                if (response && response.status && response.data) {
                    // Transform API data to match our UI structure
                    const formattedServices = response.data.map(service => ({
                        id: service?.id.toString(),
                        name: languageTexts?.servicesDirectory?.services?.[service.name.replace(/\s+/g, '')] || service?.name,
                        icon: serviceIcons[service.name] || serviceIcons['default'],
                        description: languageTexts?.servicesDirectory?.descriptions?.[service.name.replace(/\s+/g, '')] || languageTexts?.servicesDirectory?.descriptions?.default || 'Service description not available',
                        // description: serviceDescriptions[service.name] || serviceDescriptions['default'],
                        category_id: service?.id, // Keep the original ID for API calls
                        available: service?.available,
                        // services: service?.services, // Include the services object if available
                        services: service?.requested // Include the services object if available
                    }));
                    setServices(formattedServices);
                } else {
                    throw new Error(response?.details || languageTexts?.servicesDirectory?.error?.fetch || 'Failed to fetch services');
                }
            } catch (err) {
                console.error('Failed to fetch services:', err);
                setError(languageTexts?.servicesDirectory?.error?.fetch || 'Failed to load services. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [languageTexts]);



    // const renderServiceItem = ({ item }) => (
    //     <View style={styles.serviceCard}>
    //         <View style={styles.serviceContent}>
    //             <Icon name={item.icon} size={30} color={item.available ? "#333" : "#999"} style={styles.serviceIcon} />
    //             <View style={styles.serviceTextContainer}>
    //                 <Text style={[styles.serviceName, !item.available && styles.unavailableText]}>{item.name}</Text>
    //                 <Text style={[styles.serviceDescription, !item.available && styles.unavailableText]}>{item.description}</Text>
    //                 {!item.available && (
    //                     <Text style={styles.unavailableNotice}>Currently unavailable</Text>
    //                 )}
    //             </View>
    //         </View>
    //         {item.available ? (
    //             <TouchableOpacity
    //                 style={styles.applyButton}
    //                 onPress={() => handleApply(item)}
    //             >
    //                 <Text style={styles.applyButtonText}>Apply</Text>
    //             </TouchableOpacity>
    //         ) : (
    //             <View style={styles.disabledButton}>
    //                 <Text style={styles.disabledButtonText}>Not Available</Text>
    //             </View>
    //         )}
    //     </View>
    // );


    const renderServiceItem = ({ item }) => {
        console.log("item from renderServiceItem >>>> ", item);
        
        const isApplied = item?.services !== null;
        console.log("isApplied >>>> ", isApplied, item?.services !== null);
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
                            {/* {item.description} */}
                            {/* {serviceDescriptions[item.name] || serviceDescriptions['default']} */}

                        </Text>
                        {/* {isApplied && (
                            <Text style={styles.serviceDescription}>
                                {item?.services?.description}
                            </Text>
                        )} */}
                    </View>
                </View>{console.log("item?.services >>>> ", isApplied, services)}
                {item?.available ? (
                    <TouchableOpacity
                        style={[isApplied ? styles.appliedButton : styles.applyButton]}
                        onPress={() => handleApply(item, isApplied)}
                        activeOpacity={0.8}
                    >
                        <Text style={[isApplied ? styles.appliedButtonText : styles.applyButtonText]}>{isApplied ?  languageTexts?.servicesDirectory?.applied || 'Applied' : languageTexts?.servicesDirectory?.apply || 'Apply'}</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.disabledButton}>
                        {/* <Icon name="close-circle" size={20} color="#ff6b6b" style={styles.unavailableIcon} /> */}
                        <Text style={styles.disabledButtonText}>{languageTexts?.servicesDirectory?.unavailable || 'Unavailable'}</Text>
                    </View>
                )}
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
                        // Retry fetching
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

    // if (error) {
    //     return (
    //         <LinearGradient colors={['#2753b2', '#e6e9f0']} style={[styles.container, styles.errorContainer]}>
    //             <Icon name="alert-circle" size={50} color="#FFF" />
    //             <Text style={styles.errorText}>{error}</Text>
    //             <TouchableOpacity
    //                 style={styles.retryButton}
    //                 onPress={() => {
    //                     setError(null);
    //                     setLoading(true);
    //                     useEffect(() => {
    //                         fetchServices();
    //                     }, []);
    //                 }}
    //             >
    //                 <Text style={styles.retryButtonText}>Retry</Text>
    //             </TouchableOpacity>
    //         </LinearGradient>
    //     );
    // }

    if (services.length === 0) {
        return (
            <LinearGradient colors={['#2753b2', '#e6e9f0']} style={[styles.container, styles.emptyContainer]}>
                <Text style={styles.emptyText}>{languageTexts?.servicesDirectory?.empty || 'No services available at the moment.'}</Text>
            </LinearGradient>
        );
    }


    const handleApply = (service, isApplied) => {
        console.log("Service selected:", service, service.services?.description);

        // Data to pass to CreateService
        // const serviceData = {
        //     category_id: service.category_id,
        //     service_id: isApplied ? service?.services?.id : null,
        //     // description: service.description,
        //     description: isApplied ? service.services?.description : '',
        //     name: service.name,
        //     services: service.services, // Pass the entire services object if it exists
        //     isApplied: isApplied, // Flag to indicate if this is an existing application
        //     requested_user_id: 0, // Replace with actual user ID if available
        //     isApplied: isApplied,
        //     // requested_user_id: 0, // Replace with actual user ID if available
        // };

        // Data to pass to CreateService
        const serviceData = {
            category_id: service.id,
            category_name: service.name,
            description: isApplied ? service?.services?.description : '',
            service_id: isApplied ? service?.services?.id : null,
            isApplied: isApplied,
            requested_user_id: isApplied ? service?.services?.requested_user_id : null
        };
        navigation.navigate('CreateService', { serviceData });
    };




    return (
        <LinearGradient
            //   colors={['#F7F8FA', '#E5ECF6']}
            colors={['#2753b2', '#e6e9f0']} // Gradient from blue to light gray
            //   colors={['#5e3b15', '#b06a2c']}
            style={styles.container}
        >
            {/* Back Button */}
            {/* <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={24} color="#333" />
      </TouchableOpacity> */}
            <TouchableOpacity
                style={styles.backButton}
                // onPress={() => navigation.goBack()}
                onPress={() => navigation.navigate('Dashboard')}
            >
                <Text style={styles.backButtonText}>{languageTexts?.common?.back || '< Back'}</Text>
            </TouchableOpacity>

            {/* Header with Logo and Title */}
            <View style={styles.header}>
                <Image
                    source={require('../asserts/images/s1.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.headerText}>{languageTexts?.menu?.servicesDirectory || 'Services Directory'}</Text>
            </View>

            {/* List of Services */}
            <FlatList
                data={services}
                renderItem={renderServiceItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
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
        top: 20,
        left: 20,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
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
        justifyContent: 'space-between', // Space between content and button
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
    serviceContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Take up remaining space
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
        // marginBottom: -25,
        marginTop: 25,
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
        backgroundColor: '#2753b2',
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
    },

    appliedButton: {
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
    },

    // applyButton: {
    //     backgroundColor: '#2753b2',
    //     paddingVertical: 8,
    //     paddingHorizontal: 15,
    //     borderRadius: 5,
    // },
    // applyButtonText: {
    //     color: '#FFF',
    //     fontSize: 14,
    //     fontWeight: 'bold',
    // },
});


const styles1 = StyleSheet.create({
    container: {
        flex: 1,
    },
    //   single arrow button:
    //   backButton: {
    //     position: 'absolute',
    //     top: 15,
    //     left: 15,
    //     zIndex: 10,
    //     backgroundColor: '#fff',
    //     borderRadius: 20,
    //     padding: 6,
    //     elevation: 4,
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 1 },
    //     shadowOpacity: 0.2,
    //     shadowRadius: 2,
    //   },

    // arrow with box button with text::
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        zIndex: 1,
    },
    backButtonText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    header: {
        alignItems: 'center',
        // paddingTop: 60,
        paddingTop: 6,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#DDD',
    },
    logo: {
        width: 290,
        height: 200,
        // marginBottom: 10,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        // color: '#333',

    },
    listContainer: {
        padding: 15,
    },
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
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
    serviceDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
});
