import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useForm, Controller } from "react-hook-form";
import { getUserById, updateUser } from "../api/auth";
import Toast from "react-native-toast-message";
import { useLanguage } from "../language/commondir";

function ProfileEdit({ navigation, route }) {
  const { languageTexts } = useLanguage();
  const { userId, from = "Profile" } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserById(userId);
        reset({
          name: response.data.name || "",
          email: response.data.email || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setError(error.message || "Failed to load user data");
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message || "Failed to load user data",
        });
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await updateUser(userId, data);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile updated successfully",
      });
      // Navigate based on source
      navigation.navigate(from === "MigrantsList" ? "MigrantsList" : "Profile");
    } catch (error) {
      console.error("Update Error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
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
            {languageTexts?.profile?.editTitle || "Edit Profile"}
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Icon name="arrow-left" size={26} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {languageTexts?.profile?.editTitle || "Edit Profile"}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputBox}>
            <Controller
              control={control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <>
                  <TextInput
                    placeholder="Name"
                    placeholderTextColor="#D3B58F"
                    style={[styles.input, error && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                  />
                  {error && <Text style={styles.errorText}>{error.message}</Text>}
                </>
              )}
            />
          </View>

          <View style={styles.inputBox}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <>
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#D3B58F"
                    keyboardType="email-address"
                    style={[styles.input, error && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                  />
                  {error && <Text style={styles.errorText}>{error.message}</Text>}
                </>
              )}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, !isValid && styles.disabledButton]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#3D2A1A" />
            ) : (
              <Text style={styles.buttonText}>
                {languageTexts?.profile?.save || "Save Changes"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 50,
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
  formContainer: {
    alignItems: "center",
  },
  inputBox: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    width: "100%",
  },
  input: {
    color: "#FFF",
    fontSize: 16,
    height: 50,
  },
  inputError: {
    borderColor: "#FF6B6B",
    borderWidth: 1,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    backgroundColor: "#D4A373",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#A9A9A9",
  },
  buttonText: {
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

export default ProfileEdit;