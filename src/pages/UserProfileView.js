import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getUserById } from "../api/auth";
import Toast from "react-native-toast-message";
import { useLanguage } from "../language/commondir";

function ProfileView({ navigation, route }) {
    const { languageTexts } = useLanguage();
    const { userId, from = "MigrantsList" } = route.params;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const response = await getUserById(userId);
                setUser(response.data || {});
            } catch (error) {
                // console.error("Failed to fetch user:", error);
                const errorMessage = error.message || "Failed to load user data";
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

        fetchUser();
    }, [userId]);

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleEditPress = () => {
        navigation.navigate("ProfileEdit", { userId, from });
        // navigation.navigate("ProfileEdit", { userId: user.id, from: "Profile" });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <LinearGradient
                    colors={["#5e3b15", "#b06a2c"]}
                    style={styles.loadingBackground}
                >
                    <ActivityIndicator size="large" color="#FFF" />
                    <Text style={styles.loadingText}>
                        {languageTexts?.profile?.loading || "Loading user data..."}
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
                        {languageTexts?.profile?.title || "User Profile"}
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
                    {languageTexts?.profile?.title || "User Profile"}
                </Text>
                <View style={{ width: 60 }} />
            </View>
            <View style={styles.profileContainer}>
                <View style={styles.infoBox}>
                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.value}>{user.name || "N/A"}</Text>
                </View>
                <View style={styles.infoBox}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{user.email || "N/A"}</Text>
                </View>
                <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
                    <Text style={styles.editButtonText}>
                        {languageTexts?.profile?.edit || "Edit Profile"}
                    </Text>
                </TouchableOpacity>
            </View>
            <Toast />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
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
    profileContainer: {
        flex: 1,
        alignItems: "center",
    },
    infoBox: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        width: "100%",
    },
    label: {
        color: "#D3B58F",
        fontSize: 16,
        fontWeight: "600",
    },
    value: {
        color: "#FFF",
        fontSize: 16,
        marginTop: 5,
    },
    editButton: {
        backgroundColor: "#D4A373",
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: "center",
        width: "100%",
        marginTop: 20,
    },
    editButtonText: {
        color: "#3D2A1A",
        fontSize: 18,
        fontWeight: "bold",
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
});

export default ProfileView;