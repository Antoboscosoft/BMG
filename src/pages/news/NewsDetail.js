import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../language/commondir';
import HTML from 'react-native-render-html'; // You'll need to install this package


function NewsDetail({ navigation, route }) {
    const { languageTexts } = useLanguage();
    const { newsItem } = route.params;
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Show first attachment as main image */}
                {newsItem.attachments?.length > 0 ? (
                    <Image
                        source={{ uri: newsItem.attachments[0].file_url }}
                        style={styles.detailImage}
                    />
                ) : (
                    <Image
                        source={{ uri: 'https://via.placeholder.com/150' }}
                        style={styles.detailImage}
                    />
                )}
                {/* <Image 
          source={{ uri: newsItem.image_url || 'https://via.placeholder.com/150' }} 
          style={styles.detailImage}
        /> */}

                <View style={styles.contentContainer}>
                    <Text style={styles.detailTitle}>{newsItem.title}</Text>
                    <Text style={styles.detailDate}>
                        {new Date(newsItem.created_at).toLocaleDateString()}
                    </Text>

                    {/* <HTML
            source={{ html: newsItem.content }}
            contentWidth={Dimensions.get('window').width - 40}
            tagsStyles={{
              p: { color: '#333', fontSize: 16, lineHeight: 24 },
              h2: { color: '#944D00', fontSize: 20, fontWeight: 'bold' },
              // Add more tag styles as needed
            }}
          /> */}

                    {/* Use description as content */}
                    <HTML
                        source={{ html: newsItem.description || '<p>No content available</p>' }}
                        contentWidth={Dimensions.get('window').width - 40}
                        tagsStyles={{
                            p: { color: '#333', fontSize: 16, lineHeight: 24 },
                            h2: { color: '#944D00', fontSize: 20, fontWeight: 'bold' },
                        }}
                    />

                    {/* Show all attachments as gallery */}
                    {newsItem.attachments?.length > 1 && (
                        <>
                            <Text style={styles.galleryTitle}>
                                {languageTexts?.news?.gallery || 'Gallery'}
                            </Text>
                            <View style={styles.galleryGrid}>
                                {newsItem.attachments.slice(1).map((attachment, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.galleryGridItem}
                                        onPress={() => {
                                            setSelectedImage(attachment.file_url);
                                            setModalVisible(true);
                                        }}
                                    >
                                        <Image
                                            source={{ uri: attachment.file_url }}
                                            style={styles.galleryImage}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {/* Modal for image preview */}
                            {modalVisible && (
                                <View style={styles.modalOverlay}>
                                    <View style={styles.modalContent}>
                                        <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
                                            <Icon name="close" size={28} color="#FFF" />
                                        </TouchableOpacity>
                                        <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />
                                    </View>
                                </View>
                            )}
                        </>
                    )}

                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: 15,
        left: 15,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 20,
        padding: 8,
    },
    scrollContainer: {
        paddingBottom: 30,
    },
    detailImage: {
        width: '100%',
        height: 250,
    },
    contentContainer: {
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        marginTop: -20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: '100%',
    },
    detailTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    detailDate: {
        fontSize: 14,
        color: '#944D00',
        marginBottom: 20,
    },
    galleryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    galleryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    galleryGridItem: {
        width: '48%',
        margin: '1%',
        aspectRatio: 1,
        borderRadius: 8,
        overflow: 'hidden',
    },
    galleryImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    modalContent: {
        width: '90%',
        height: '50%',
        backgroundColor: '#222',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        // paddingBottom: 20,
        //  paddingVertical: 20,
        bottom: 20,
        // paddingHorizontal: 20,
    },
    modalImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    modalClose: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        padding: 4,
    },
});

export default NewsDetail;