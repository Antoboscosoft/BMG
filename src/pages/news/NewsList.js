import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLanguage } from '../../language/commondir';
import { getNews, deleteNews } from '../../api/auth';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';
import HTML from 'react-native-render-html'; // Import the library

const { width } = Dimensions.get('window'); // Get screen width for responsive HTML rendering

function NewsList({ navigation }) {
    const { languageTexts } = useLanguage();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const getUserRole = async () => {
            try {
                const role = await AsyncStorage.getItem('userRole');
                console.log('Retrieved userRole from AsyncStorage:', role);
                setIsAdmin(role === 'Super Admin' || role === 'Admin' || role === 'Staff');
            } catch (error) {
                console.error('Failed to retrieve user role from AsyncStorage:', error);
                setIsAdmin(false);
            }
        };
        getUserRole();
    }, []);

    const route = useRoute();
    const userData = route.params?.userData || null;
    const refreshData = route.params?.refresh;

    const fetchNews = async () => {
        try {
            const data = await getNews();
            setNews(data?.data || []);
        } catch (error) {
            console.error('Failed to fetch news:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, [refreshData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNews();
    };

    const handleEditNews = (newsItem) => {
        console.log('Editing news item:', newsItem);

        navigation.navigate('CreateNews', { newsItem, refreshNews: fetchNews });
    };

    const handleDeleteNews = async (newsId) => {
        Alert.alert(
            languageTexts?.news?.deleteTitle || 'Delete News',
            languageTexts?.news?.deleteMessage || 'Are you sure you want to delete this news?',
            [
                {
                    text: languageTexts?.general?.cancel || 'Cancel',
                    style: 'cancel',
                },
                {
                    text: languageTexts?.general?.delete || 'Delete',
                    onPress: async () => {
                        try {
                            await deleteNews(newsId);
                            Toast.show(languageTexts?.news?.deleted || 'News deleted successfully', Toast.LONG);
                            fetchNews(); // Refresh the list
                        } catch (error) {
                            Toast.show(languageTexts?.news?.error?.deleteFailed || 'Failed to delete news', Toast.LONG);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.newsItemContainer}>
            <TouchableOpacity
                style={styles.newsItem}
                onPress={() => navigation.navigate('NewsDetail', { newsItem: item })}
            >
                {item?.attachments?.length > 0 ? (
                    <Image
                        source={{ uri: item.attachments[0].file_url }}
                        style={styles.newsImage}
                    />
                ) : (
                    <View style={[styles.newsImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', flexDirection: 'row' }]}>
                        <Text style={{ color: '#888', fontSize: 16, textAlign: 'center', width: '100%' }}>
                            {languageTexts?.news?.noImage || 'No image available'}
                        </Text>
                    </View>
                )}
                <View style={styles.newsContent}>
                    <Text style={styles.newsTitle}>{item.title}</Text>
                    <Text style={styles.newsDate}>
                        {new Date(item?.created_at).toLocaleDateString()}
                    </Text>
                    {/* <Text style={styles.newsExcerpt} numberOfLines={2}>
                        {item?.excerpt || item?.content?.substring(0, 100)}...
                    </Text> */}
                    {/* <Text style={styles.newsExcerpt} numberOfLines={2}>
                        {console.log(item.description)
                        }
                        {item.description || 'No description available'}
                    </Text> */}
                    <View style={[styles.descriptionContainer, { maxHeight: 70, minHeight: 70, overflow: 'hidden' }]}>
                        {/* <HTML
                            source={{ html: item.description || '<p>No description available</p>' }}
                            contentWidth={width - 60} // Adjust for padding (15 + 15 on each side)
                            tagsStyles={{
                                h3: {
                                    fontSize: 18,
                                    fontWeight: '700',
                                    color: '#0033A0', // Match API color rgb(0, 51, 160)
                                    marginTop: 15,
                                    marginBottom: 5,
                                },
                                h4: {
                                    fontSize: 16,
                                    fontWeight: '700',
                                    color: '#0033A0',
                                    marginTop: 15,
                                    marginBottom: 5,
                                },
                                p: {
                                    fontSize: 14,
                                    color: '#555',
                                    lineHeight: 20,
                                    marginTop: 5,
                                    marginBottom: 5,
                                },
                            }}
                            // numberOfLines={3} // Limit to 2 lines as per original design
                            textSelectable={false} // Optional: Prevent text selection if not needed
                        /> */}
                        <HTML
                            source={{ html: item.description || '<p>No description available</p>' }}
                            contentWidth={width - 60}
                            maxLines={3}
                            textSelectable={false}
                        />
                    </View>
                </View>
            </TouchableOpacity>

            {isAdmin && (
                <View style={styles.newsActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditNews(item)}
                    >
                        <Icon name="pencil" size={20} color="#944D00" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteNews(item.id)}
                    >
                        <Icon name="delete" size={20} color="#d32f2f" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    if (loading) {
        return (
            <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
            </LinearGradient>
        );
    }

    const goBack = () => {
        // if (navigation.canGoBack()) {
        //     navigation.goBack();
        // } else {
        navigation.navigate('Dashboard', { userData });
        // }
    }

    return (
        <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => goBack()}
                >
                    <Icon name="arrow-left" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerText}>
                    {languageTexts?.news?.title || 'Latest News'}
                </Text>
                {isAdmin ? (
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => navigation.navigate('CreateNews', { refreshNews: fetchNews })}
                    >
                        <Icon name="plus" size={24} color="#FFF" />
                    </TouchableOpacity>
                ) :
                    <View style={{ width: 40 }} />
                }
            </View>

            <FlatList
                data={news}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#bf1717']}
                        tintColor="#db3030"
                    />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        {languageTexts?.news?.empty || 'No news available'}
                    </Text>
                }
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
        marginTop: 20,
    },
    backButton: {
        marginRight: 10,
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    createButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 10,
        borderRadius: 25,
    },
    listContainer: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    newsItemContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    newsItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 3,
    },
    newsImage: {
        width: '100%',
        height: 180,
    },
    newsContent: {
        padding: 15,
    },
    newsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    newsDate: {
        fontSize: 12,
        color: '#944D00',
        marginBottom: 8,
    },
    newsExcerpt: {
        fontSize: 14,
        color: '#555',
    },
    emptyText: {
        color: '#FFF',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
    newsActions: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 15,
        padding: 5,
    },
    actionButton: {
        marginHorizontal: 5,
        padding: 5,
    },
});

export default NewsList;