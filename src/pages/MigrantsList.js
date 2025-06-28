import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    TextInput,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getMigrantsList } from "../api/auth";
import Toast from "react-native-toast-message";
import { useLanguage } from "../language/commondir";

const { width, height } = Dimensions.get("window");

function MigrantsList({ navigation, route }) {
    const { languageTexts } = useLanguage();
    const [migrants, setMigrants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [isFocused, setIsFocused] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
    const [selectedImage, setSelectedImage] = useState(null); // State for selected image
    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);
    const limit = 25;

    // search:
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false); // New state for search loading

    // search input show:::
    const [showSearchInput, setShowSearchInput] = useState(false);


    const toggleSearch = () => {
        setShowSearchInput(!showSearchInput);
        if (!showSearchInput) {
            setSearchQuery('');
            setSearchResults([]);
            setIsSearching(false);
        }
    };


    const fetchMigrants = async (initialLoad = false) => {
        try {
            if (initialLoad) {
                // setSkip(0);
                // setMigrants([]);
                // setHasMore(true);
                setLoading(true);
            } else {
                // if (!hasMore) return; // No more data to load
                // setLoadingMore(true);
                setLoading(false);
            }
            // setLoading(true);
            const response = await getMigrantsList(skip, limit);
            // console.log("Response data:", response.data);

            if (response.data && response.data.length < limit) {
                setHasMore(false); // No more data to load
            } else {
                setMigrants((prevMigrants) => [
                    ...prevMigrants,
                    ...response.data,
                ]);
                setSkip((prevSkip) => prevSkip + limit); // Update skip for next load
            }
            // setMigrants(response.data || []);
        } catch (error) {
            console.error("Failed to fetch migrants:", error);
            const errorMessage = error.message || "Failed to load migrants list";
            setError(errorMessage);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: errorMessage,
            });
        } finally {
            if (initialLoad) {
                setLoading(false);
            } else {
                setLoadingMore(false);
            }
            // setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            setMigrants([]); // Clear migrants when focused
            setSkip(0); // Reset skip when focused
            setHasMore(true); // Reset hasMore when focused
            fetchMigrants(true);
        }
    }, [isFocused]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && !isSearching) {
            setLoadingMore(true);
            fetchMigrants();
        }
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="gray" />
            </View>
        );
    };

    // search:
    // Add this function to handle search
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length > 0) {
            setIsSearching(true);
            setSearchLoading(true); // Set search loading state
            try {
                const response = await getMigrantsList(0, limit, query); // Modify your API to accept search param
                setSearchResults(response.data || []);
            } catch (error) {
                console.error("Search failed:", error);
                Toast.show({
                    type: "error",
                    text1: "Search Error",
                    text2: "Failed to perform search",
                });
                setSearchResults([]);
            } finally {
                setSearchLoading(false); // Reset search loading state
            }
        } else {
            setIsSearching(false);
            setSearchResults([]);
            setSearchLoading(false); // Reset search loading state
        }
    };



    // debounce to check:
    // const [searchTimeout, setSearchTimeout] = useState(null);

    // const handleSearch = (query) => {
    //     setSearchQuery(query);
    //     if (searchTimeout) {
    //         clearTimeout(searchTimeout);
    //     }
    //     setSearchTimeout(setTimeout(() => {
    //         if (query.length > 0) {
    //             performSearch(query);
    //         } else {
    //             setIsSearching(false);
    //             setSearchResults([]);
    //         }
    //     }, 500)); // 500ms delay
    // };

    // const performSearch = async (query) => {
    //     setIsSearching(true);
    //     try {
    //         const response = await getMigrantsList(0, limit, query);
    //         setSearchResults(response.data || []);
    //     } catch (error) {
    //         console.error("Search failed:", error);
    //         Toast.show({
    //             type: "error",
    //             text1: "Search Error",
    //             text2: "Failed to perform search",
    //         });
    //     }
    // };




    // Modify your FlatList data source
    const displayData = isSearching ? searchResults : migrants;

    useEffect(() => {
        const handleFocus = () => setIsFocused(true);
        const handleBlur = () => setIsFocused(false);

        navigation.addListener("focus", handleFocus);
        navigation.addListener("blur", handleBlur);

        return () => {
            navigation.removeListener("focus", handleFocus);
            navigation.removeListener("blur", handleBlur);
        };
    }, [navigation]);

    const handleBackPress = () => {
        if (route?.name === 'MigrantsList') {
            navigation.navigate("Dashboard");
        } else {
            navigation.goBack();
        }
    };

    const handleCreateUser = () => {
        navigation.navigate("Register", { from: "MigrantsList" });
    };

    const handleViewUser = (user) => {
        navigation.navigate("Profile", { userData: user, from: "MigrantsList" });
    };

    const openImageModal = (imageUri) => {
        setSelectedImage(imageUri);
        setModalVisible(true);
    };

    const closeImageModal = () => {
        setModalVisible(false);
        setSelectedImage(null);
    };

    const renderMigrantItem = ({ item }) => (
        // console.log("Rendering migrant item:", item),

        <View style={styles.listItem}>
            <TouchableOpacity
                style={styles.userIconContainer}
                onPress={() => item.photo && openImageModal(item.photo)}
                disabled={!item.photo} // Disable press if no photo
            >
                {item.photo ? (
                    <Image source={{ uri: item.photo }} style={styles.userIcon} />
                ) : (
                    <Icon name="account" size={75} color="#FFF" />
                )}
            </TouchableOpacity>
            <View style={styles.userInfo}>
                <View style={styles.userInfoRow}>
                    <Text style={styles.userInfoName}>
                        {item.name || "Unknown User"}
                    </Text>
                </View>
                <View style={styles.userInfoRow}>
                    <Icon name="email" size={20} color="#ffffff" />
                    <Text style={styles.userInfoText}>
                        {item.email || "No email"}
                    </Text>
                </View>
                <View style={styles.userInfoRow}>
                    <Icon name="phone" size={20} color="#ffffff" />
                    <Text style={styles.userInfoText}>
                        {item.mobile_number || "No phone"}
                    </Text>


                </View>
                {/* <View style={styles.userInfoRow}>
                    <Icon name="calendar" size={20} color="#ffffff" />
                    <Text style={styles.userInfoText}>
                        {`Created on: ${new Date(item.created_on).toLocaleDateString()}` ||  "No date"}
                        {`${new Date(item.created_on).toLocaleDateString()}` || "No date"}
                    </Text>
                </View> */}
                {/* {item.creator && <View style={styles.userInfoRow}>
                    <Icon name="account-circle" size={20} color="#ffffff" />
                    <Text style={styles.userInfoText}>
                        {`By: ${item.creator?.name || "No creator"}`}
                        {`${item.creator?.name || "No creator"}`}
                    </Text>
                </View>} */}
            </View>
            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleViewUser(item)}
            >
                <Icon name="eye" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <LinearGradient
                    colors={["#5e3b15", "#b06a2c"]}
                    style={styles.loadingBackground}
                >
                    <ActivityIndicator size="large" color="#FFF" />
                    <Text style={styles.loadingText}>
                        {languageTexts?.migrantsList?.loading || "Loading migrants..."}
                    </Text>
                </LinearGradient>
            </View>
        );
    }

    if (error) {
        return (
            <LinearGradient colors={["#C97B3C", "#7A401D"]} style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                        <Icon name="arrow-left" size={26} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>
                        {languageTexts?.migrantsList?.title || "Migrants List"}
                    </Text>
                    <View style={{ width: 60 }} />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={["#C97B3C", "#7A401D"]} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                    <Icon name="arrow-left" size={26} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>
                    {languageTexts?.migrantsList?.title || "Migrants List"}
                </Text>
                {/* {showSearchInput ? (
                    <View style={styles.searchInputContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search migrants..."
                            placeholderTextColor="#FFECD2"
                            value={searchQuery}
                            onChangeText={handleSearch}
                            autoFocus={true}
                        />
                        <TouchableOpacity onPress={toggleSearch}>
                            <Icon name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity onPress={toggleSearch}>
                        <Icon name="magnify" size={26} color="#FFF" />
                    </TouchableOpacity>
                )} */}
                <View style={{ width: 60 }} />
            </View>

            {/* Add Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color="#FFF" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={languageTexts?.migrantsList?.searchMigrants || "Search migrants..."}
                    placeholderTextColor="#FFECD2"
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearch('')}>
                        <Icon name="close" size={20} color="#FFF" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Close search when tapping outside */}
            {showSearchInput && (
                <TouchableOpacity
                    style={styles.searchOverlay}
                    activeOpacity={1}
                    onPress={toggleSearch}
                />
            )}

            {searchLoading && (
                <View style={styles.searchLoadingContainer}>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={styles.searchLoadingText}>
                        {languageTexts?.migrantsList?.searching || "Searching..."}
                    </Text>
                </View>
            )}


            {!searchLoading && displayData.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        {isSearching
                            ? languageTexts?.migrantsList?.Nomatchingmigrantsfound || "No matching migrants found" : languageTexts?.migrantsList?.empty || "No migrants found"}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={displayData}
                    renderItem={renderMigrantItem}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.listContainer}
                    onEndReached={!isSearching ? handleLoadMore : null}
                    onEndReachedThreshold={0.5}
                    listFooterComponent={!isSearching ? renderFooter : null}
                />
            )}
            <TouchableOpacity style={styles.fab} onPress={handleCreateUser}>
                <Icon name="plus" size={30} color="#FFF" />
            </TouchableOpacity>

            {/* Modal for Image View */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeImageModal}
            >
                <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={closeImageModal} // Close modal when clicking outside
                >
                    <View style={styles.modalContent}>
                        {selectedImage && (
                            <Image
                                source={{ uri: selectedImage }}
                                style={styles.modalImage}
                                resizeMode="contain"
                            />
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={closeImageModal}
                        >
                            <Icon name="close" size={30} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Toast />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 25,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        marginTop: 15,
    },
    backButton: {
        padding: 10,
        backgroundColor: "#944D00",
        borderRadius: 25,
    },
    title: {
        color: "#FFECD2",
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,
        marginLeft: 10,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 25,
        paddingHorizontal: 8,
        marginBottom: 15,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: "#FFF",
        fontSize: 16,
    },
    // searchInput: {
    //     flex: 1,
    //     color: '#FFF',
    //     fontSize: 16,
    // },
 searchLoadingContainer: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    searchLoadingText: {
        color: '#FFF',
        marginLeft: 10,
    },
    // design search:
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    searchInput: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
        paddingVertical: 8,
    },
    searchOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        zIndex: 1,
    },
    listContainer: {
        paddingBottom: 50,
    },
    listItem: {
        flexDirection: "row",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 10,
        padding: 5,
        marginBottom: 10,
        alignItems: "center",
    },
    userIconContainer: {
        borderRadius: 20,
        padding: 10,
        marginRight: 15,
    },
    userInfo: {
        flex: 1,
    },
    userInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    userInfoName: {
        color: "#FFF",
        fontSize: 18,
    },
    userInfoText: {
        color: "#FFF",
        fontSize: 14,
        marginLeft: 5,
    },
    actionButton: {
        padding: 10,
        backgroundColor: "#dd7d17",
        borderRadius: 20,
        marginLeft: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        elevation: 3,
    },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 20,
        backgroundColor: "#D4A373",
        borderRadius: 30,
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    loadingBackground: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.9,
        borderRadius: 10,
    },
    loadingText: {
        marginTop: 20,
        alignItems: "center",
        color: "#FFF",
        fontSize: 18,
        fontWeight: "600",
    },
    loadingMoreContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        color: "#FF6B6B",
        fontSize: 16,
        textAlign: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        color: "#FFF",
        fontSize: 16,
        textAlign: "center",
    },
    userIcon: {
        width: 75,
        height: 75,
        borderRadius: 40,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        position: "relative",
        width: width * 0.9,
        height: height * 0.6,
        justifyContent: "center",
        alignItems: "center",
    },
    modalImage: {
        width: "100%",
        height: "100%",
    },
    closeButton: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 20,
        padding: 5,
    },
});

export default MigrantsList;