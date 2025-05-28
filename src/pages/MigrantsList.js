import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getMigrantsList } from "../api/auth";
import Toast from "react-native-toast-message";
import { useLanguage } from "../language/commondir";

const { width } = Dimensions.get("window");

function MigrantsList({ navigation }) {
    const { languageTexts } = useLanguage();
    const [migrants, setMigrants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMigrants = async () => {
            try {
                setLoading(true);
                const response = await getMigrantsList();
                setMigrants(response.data || []);
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
                setLoading(false);
            }
        };

        fetchMigrants();
    }, []);

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleCreateUser = () => {
        navigation.navigate("Register", { from: "MigrantsList" });
    };

    const handleViewUser = (user) => {
        navigation.navigate("Profile", { userData: user, from: "MigrantsList" });
    };

    const renderMigrantItem = ({ item }) => (
        <View style={styles.listItem}>
            <View style={styles.userIconContainer}>
                <Icon name="account" size={24} color="#FFF" />
            </View>
            {
                console.log("Rendering migrant item:", item)

            }
            <View style={styles.userInfo}>
                <View style={styles.userInfoRow}>
                    {/* <Icon name="person" size={20} color="#666" /> */}
                    <Text style={styles.userInfoText}>
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
            </View>
            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleViewUser(item)}
            >
                <Icon name="eye" size={20} color="#FFF" />
                 {/* <Text style={styles.actionButtonText}>{languageTexts?.migrantsList?.view || "View"}</Text> */}
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
                <View style={{ width: 60 }} />
            </View>
            {migrants.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        {languageTexts?.migrantsList?.empty || "No migrants found"}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={migrants}
                    renderItem={renderMigrantItem}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.listContainer}
                />
            )}
            <TouchableOpacity style={styles.fab} onPress={handleCreateUser}>
                <Icon name="plus" size={30} color="#FFF" />
            </TouchableOpacity>
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
    },
    listContainer: {
        paddingBottom: 20,
    },
    listItem: {
        flexDirection: "row",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        alignItems: "center",
    },
    userIconContainer: {
        // backgroundColor: "#c5894a",// prev color
        backgroundColor: "#b06a2c", //ok
        // backgroundColor: "#dd7d17", //current
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
    userInfoText: {
        color: "#FFF",
        fontSize: 14,
        marginLeft: 5,
    },
    
    userName: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },
    userEmail: {
        color: "#dad0c3",
        fontSize: 14,
    },
    userPhone: {
        color: "#d5d0cb",
        fontSize: 14,
    },
    actionButton: {
        padding: 10,
        backgroundColor: "#dd7d17",
        borderRadius: 20,
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
        color: "#FFF",
        fontSize: 18,
        fontWeight: "600",
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
});

export default MigrantsList;