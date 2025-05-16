import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient'; // <-- make sure this is installed

function ServicesDirectory({ navigation }) {
    const services = [
        { id: '1', name: 'Healthcare Services', icon: 'hospital-box', description: 'Access medical care and health resources.' },
        { id: '2', name: 'Legal Aid', icon: 'gavel', description: 'Get assistance with immigration and legal issues.' },
        { id: '3', name: 'Job Opportunities', icon: 'briefcase', description: 'Find employment and career support.' },
        { id: '4', name: 'Language Support', icon: 'translate', description: 'Learn languages and get translation help.' },
        { id: '5', name: 'Community Support', icon: 'account-group', description: 'Connect with local migrant communities.' },
    ];

    const renderServiceItem = ({ item }) => (
        <TouchableOpacity style={styles.serviceCard}>
            <Icon name={item.icon} size={30} color="#333" style={styles.serviceIcon} />
            <View style={styles.serviceTextContainer}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.serviceDescription}>{item.description}</Text>
            </View>
        </TouchableOpacity>
    );

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
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>{'< Back'}</Text>
            </TouchableOpacity>

            {/* Header with Logo and Title */}
            <View style={styles.header}>
                <Image
                    source={require('../asserts/images/s1.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.headerText}>Services Directory</Text>
            </View>

            {/* List of Services */}
            <FlatList
                data={services}
                renderItem={renderServiceItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
            />
        </LinearGradient>
    );
}

export default ServicesDirectory;

const styles = StyleSheet.create({
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
