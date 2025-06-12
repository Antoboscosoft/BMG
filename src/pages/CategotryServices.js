import React, { use, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { getServiceMyRequest, getServiceRequests, updateServiceStatus } from '../api/auth';
import LinearGradient from 'react-native-linear-gradient';
import { useLanguage } from '../language/commondir';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useForm } from 'react-hook-form';

function CategoryServices({ navigation, route }) {
    const serviceData = route.params?.serviceData || {};
    console.log("serviceData:", serviceData);
    const categoryId = serviceData.category_id;
    const [categoryName, setCategoryName] = useState(serviceData.category_name || 'Unknown Category');
    console.log("categoryId:", categoryId);
    const { languageTexts, user } = useLanguage();

    const [loginUser, setLoginUser] = useState([]);
    console.log("loginUser:", loginUser);

    console.log("user:", user.data.role.name, user.data.role.name == "ADMIN" || user.data.role.name == "STAFF");

    useEffect(() => {
        // const staffAdmin = user.data.role.name == "ADMIN" || user.data.role.name == "STAFF";
        setLoginUser(user?.data?.role.name);
    }, [])

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    console.log("services:", services);

    const { control, handleSubmit } = useForm({
        defaultValues: {
            category_id: categoryId,
            category_name: categoryName,
        },
    });

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log("loginUser: api :", loginUser);

                // const data = await getServiceMyRequest(categoryId);
                const data = await getServiceRequests(user?.data?.role.name.toUpperCase(), categoryId, 0, 0);

                // loginUser

                console.log("data: ------------- ", data);
                setServices(data?.data || []);
                if (!serviceData.category_name && data?.data?.length > 0) {
                    setCategoryName(data.data[0].category.name || 'Unknown Category');
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch services');
            } finally {
                setLoading(false);
            }
        };
        if (categoryId) fetchServices();
    }, [categoryId, serviceData.category_name]);

    const handleCreateService = () => {
        navigation.navigate('CreateService', {
            serviceData: {
                category_id: categoryId,
                category_name: categoryName,
                isApplied: false,
                description: '',
            },
        });
    };

    const handleStatusPress = async (item) => {
        if (item.status === 'RESOLVED') return;

        Alert.alert(
            languageTexts?.services?.serviceStatus || 'Service Status',
            languageTexts?.services?.confirmResolve || 'Are you sure you want to resolve this service request?',
            [
                { text: languageTexts?.services?.cancel || 'Cancel', style: 'cancel' },
                {
                    text: languageTexts?.services?.resolve || 'Resolve',
                    style: 'default',
                    onPress: async () => {
                        try {
                            await updateServiceStatus(item?.id, 'RESOLVED');
                            const data = await getServiceRequests(user?.data?.role.name.toUpperCase(), categoryId, 0, 0);
                            setServices(data?.data || []);
                            Alert.alert(
                                languageTexts?.services?.successTitle || 'Success',
                                languageTexts?.services?.successMessage || 'Service status updated to Resolved.',
                                [{ text: languageTexts?.services?.ok || 'OK' }],
                            );
                        } catch (err) {
                            Alert.alert(
                                languageTexts?.services?.errorTitle || 'Error',
                                err.message || languageTexts?.services?.errorMessage || 'Failed to update service status. Please try again.',
                                [{ text: languageTexts?.services?.ok || 'OK' }],
                            );
                        }
                    },
                },
            ],
        );
    };

    if (loading) {
        return (
            // <View style={styles.centered}>
            //     <ActivityIndicator size="large" color="#944D00" />
            // </View>
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
                            {languageTexts?.services?.title || 'Services for Category'}
                            {/* {categoryId} */}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.createServiceBtn} onPress={handleCreateService}>
                        <Icon name="add" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.categoryNameText}>{languageTexts?.services?.category || "Category"} : {categoryName}</Text>
                {services.length === 0 ? (
                    <View style={styles.noDataContainer}>
                        <Text style={styles.noDataText}>{languageTexts?.services?.noData || "No service requests found."}</Text>
                    </View>
                ) : (
                    services.map((item) => (
                        <View key={item.id?.toString() || Math.random().toString()} style={styles.serviceItem}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.serviceTitle}>{languageTexts?.services?.serviceRequestDetail || "Service Request Detail"}</Text>
                                {user.data.role.name === "Admin" || user.data.role.name === "Staff" && item.status !== 'RESOLVED' &&
                                    <TouchableOpacity
                                        style={[
                                            styles.statusButton,
                                            {
                                                backgroundColor:
                                                    item.status === 'RESOLVED'
                                                        ? '#B0BEC5'
                                                        : '#0db6a5',
                                            },
                                        ]}
                                        onPress={() => handleStatusPress(item)}
                                        disabled={user.data.role.name !== 'ADMIN' && item.status === 'RESOLVED'}
                                    >
                                        <Icon name="edit" size={20} color="#FFF" />
                                        <Text style={styles.statusButtonText}>
                                            {languageTexts?.services?.resolved || "Resolved"}
                                            {/* {item.status === 'RESOLVED' ? 'Resolved' : 'Resolve'} */}
                                        </Text>
                                    </TouchableOpacity>}
                            </View>
                            <View style={styles.cardContent}>
                                {user.data.role.name === "Admin" || user.data.role.name === "Staff" &&
                                    <View style={styles.infoRow}>
                                        <Text style={styles.serviceLabel}>{languageTexts?.services?.requestedBy || "Requested By"} </Text>
                                        <Text style={styles.serviceValue}>: {item.user?.name || 'No User'}</Text>
                                    </View>}
                                <View style={styles.infoRow}>
                                    <Text style={styles.serviceLabel}>{languageTexts?.services?.requestedOn || "Requested On"} </Text>
                                    {/* <Text style={styles.serviceValue}>
                                        : {item.created_at ? new Date(item.created_at).toLocaleString() : 'No Date'}
                                    </Text> */}
                                    <Text style={styles.serviceValue}>
                                        : {item.created_at
                                            ? `${new Date(item.created_at).toLocaleDateString()} ${new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`
                                            : 'No Date'}
                                    </Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.serviceLabel}>{languageTexts?.services?.status || "Status"} </Text>
                                    <Text > :</Text>
                                    <View
                                        style={[styles.statusBadge,
                                        {
                                            borderRadius: 12,
                                            paddingHorizontal: 12,
                                            paddingVertical: 4,
                                            alignSelf: 'flex-start',
                                            marginLeft: 4,
                                            backgroundColor:
                                                item.status === 'RESOLVED'
                                                    ? '#43A047' // green
                                                    : item.status === 'OPEN'
                                                        ? '#FFA000' // orange
                                                        : '#888',   // fallback color
                                        },
                                        ]}
                                    >
                                        <Text style={[styles.statusBadgeText, { color: '#FFF', fontWeight: 'bold', fontSize: 14 }]}>
                                            {item.status === 'RESOLVED' ? languageTexts?.services?.resolved || 'Resolved' : item.status === 'OPEN' ? languageTexts?.services?.open || "Open" : 'Open' || 'No Status'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.serviceLabel}>{languageTexts?.services?.description || "Description"} </Text>
                                    <Text style={styles.serviceValue}>
                                        : {item.description || 'No Description'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
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
    createServiceBtn: {
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        padding: 8,
    },
    categoryNameText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
        textAlign: 'center',
        marginVertical: 10,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    serviceItem: {
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
        alignItems: 'center',
        marginBottom: 8,
    },
    serviceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2753b2',
        flex: 1,               // Allow title to take available space
        marginRight: 8,
    },
    statusButton: {
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        elevation: 1,
        alignItems: 'center',  // Center icon and text vertically
        justifyContent: 'center', // Center horizontally
        minWidth: 100,
    },
    statusButtonText: {
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
    serviceLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2753b2',
        width: 120, // Fixed width to align colons
        textAlign: 'left', // Ensure the label text aligns to the left
    },
    serviceValue: {
        fontSize: 15,
        color: '#555',
        flex: 1,
        textAlign: 'left', // Ensure text starts from the left
    },
    statusBadge: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        backgroundColor: '#43A047', // Adjusted based on your logic for RESOLVED
    },
    statusBadgeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    serviceDesc: {
        fontSize: 15,
        color: '#555',
        flex: 1,
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 16,
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
});

const styles1 = StyleSheet.create({
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
    createServiceBtn: {
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        padding: 8,
    },
    categoryNameText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
        textAlign: 'center',
        marginVertical: 10,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    serviceItem: {
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
        marginBottom: 8,
    },
    serviceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2753b2',
        flex: 1,
        marginRight: 8,
        flexShrink: 1,       // Allows text to truncate
        numberOfLines: 1,    // Optional: limit to 1 line
        ellipsizeMode: 'tail',
    },
    statusButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        elevation: 1,
    },
    statusButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    cardContent: {
        flexDirection: 'column',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    serviceLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2753b2',
        // width: 100,
    },
    serviceValue: {
        fontSize: 15,
        color: '#555',
        flex: 1,
        textAlign: 'left',
        marginLeft: 10,
    },
    statusBadge: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        marginLeft: 10,
    },
    statusBadgeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    serviceDesc: {
        fontSize: 15,
        color: '#555',
        flex: 1,
    },
    errorText: {
        color: '#d32f2f',
        fontSize: 16,
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
});

export default CategoryServices;