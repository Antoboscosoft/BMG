import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../../language/commondir';
import { launchImageLibrary } from 'react-native-image-picker';
import { createNews, updateNews, deleteNewsAttachment } from '../../api/auth';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

function CreateNews({ navigation, route }) {
    const { languageTexts } = useLanguage();
    const newsItem = route?.params?.newsItem || null;
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm({
        defaultValues: {
            title: '',
            description: '',
        },
        mode: 'onChange',
    });

    // Check user role
    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const role = await AsyncStorage.getItem('userRole');
                console.log('Retrieved userRole:', role);
                const isAuthorized = role === 'Admin' || role === 'Super Admin' || role === 'Staff';
                setIsAdmin(isAuthorized);
                if (!isAuthorized) {
                    Toast.show({
                        type: 'error',
                        text1: languageTexts?.news?.error?.accessDenied || 'Access Denied',
                        text2: languageTexts?.news?.error?.adminOnly || 'Only Admins can create news.',
                    });
                    navigation.goBack();
                }
            } catch (error) {
                console.error('Failed to check role:', error);
                Toast.show({
                    type: 'error',
                    text1: languageTexts?.news?.error?.title || 'Error',
                    text2: languageTexts?.news?.error?.checkRole || 'Failed to verify permissions.',
                });
                navigation.goBack();
            }
        };
        checkUserRole();
    }, []);
    console.log("newsItem.attachments:", newsItem?.attachments);

    useEffect(() => {
        if (newsItem) {
            setValue('title', newsItem.title || '');
            setValue('description', newsItem.description ? newsItem.description.replace(/<[^>]+>/g, '') : '');
            setImages(newsItem.attachments || []);
        }
    }, [newsItem, setValue]);

    // Pick images
    const handleImagePick = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                selectionLimit: 5,
            });
            if (!result.didCancel && !result.errorCode && result.assets?.length > 0) {
                setImages([...images, ...result.assets]);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Toast.show({
                type: 'error',
                text1: languageTexts?.news?.error?.title || 'Error',
                text2: languageTexts?.news?.error?.imagePick || 'Failed to pick image.',
            });
        }
    };

    // Remove image
    const removeImage = async (index) => {
        console.log('Removing image at index:', index);

        const image = images[index];
        if (image.id) {
            // Existing image, call API to delete
            try {
                const response = await deleteNewsAttachment(image.id);
                console.log('Image deleted:', response);

                Toast.show({
                    type: 'success',
                    text1: languageTexts?.news?.success?.title || 'Success',
                    text2: languageTexts?.news?.success?.imageDeleted || 'Image deleted successfully!',
                });
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: languageTexts?.news?.error?.title || 'Error',
                    text2: languageTexts?.news?.error?.imageDelete || 'Failed to delete image.',
                });
                return;
            }
        }
        setImages(images.filter((_, i) => i !== index));
    };

    // Submit form
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const formData = new FormData();
            const newsData = {
                title: data.title.trim(),
                description: data.description.trim(),
            };
            formData.append('news', JSON.stringify(newsData));
            images.forEach((image, index) => {
                if (!image.id) { // Only new images
                    const file = {
                        uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
                        name: image.fileName || `news_image_${Date.now()}_${index}.jpg`,
                        type: image.type || 'image/jpeg',
                    };
                    formData.append('files', file);
                }
            });
            if (newsItem) {
                // Edit mode
                await updateNews(newsItem.id, formData);
                Toast.show({
                    type: 'success',
                    text1: languageTexts?.news?.success?.title || 'Success',
                    text2: languageTexts?.news?.success?.updateMessage || 'News updated successfully!',
                    visibilityTime: 2000,
                });
            } else {
                // Create mode
                await createNews(formData);
                Toast.show({
                    type: 'success',
                    text1: languageTexts?.news?.success?.title || 'Success',
                    text2: languageTexts?.news?.success?.message || 'News created successfully!',
                });
            }
            reset();
            setImages([]);
            navigation.navigate('NewsList', { refresh: true });
        } catch (error) {
            console.error('Create/Update News Error:', error);
            const errorMessage = error.message || languageTexts?.news?.error?.submit || 'Failed to submit news.';
            Toast.show({
                type: 'error',
                text1: languageTexts?.news?.error?.title || 'Error',
                text2: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return null; // Render nothing until role is checked
    }

    const goBack = () => {
        // navigation.goBack();
        navigation.navigate('NewsList', { refresh: true });
    };

    return (
        <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => goBack()}
                    >
                        <Icon name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.titleText}>
                            {newsItem
                                ? languageTexts?.news?.form?.editTitle || 'Edit News'
                                : languageTexts?.news?.form?.createTitle || 'Create New News'}
                        </Text>
                    </View>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.formContainer}>
                    <Text style={styles.label}>
                        {languageTexts?.news?.form?.title || 'Title'} <Text style={[{ color: 'red' }]}>*</Text>
                    </Text>
                    <Controller
                        control={control}
                        name="title"
                        rules={{
                            required: languageTexts?.errors?.titleRequired || 'Title is required',
                            minLength: {
                                value: 3,
                                message: languageTexts?.errors?.titleMinLength || 'Title must be at least 3 characters',
                            },
                            maxLength: {
                                value: 100,
                                message: languageTexts?.errors?.titleMaxLength || 'Title cannot exceed 100 characters',
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors.title && styles.inputError]}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                placeholder={languageTexts?.news?.form?.titlePlaceholder || 'Enter news title'}
                                placeholderTextColor="#999"
                            />
                        )}
                    />
                    {errors.title && (
                        <Text style={styles.errorText}>{errors.title.message}</Text>
                    )}

                    <Text style={styles.label}>
                        {languageTexts?.news?.form?.description || 'Description'} <Text style={[{ color: 'red' }]}>*</Text>
                    </Text>
                    <Controller
                        control={control}
                        name="description"
                        rules={{
                            required: languageTexts?.errors?.descriptionRequired || 'Description is required',
                            minLength: {
                                value: 10,
                                message: languageTexts?.errors?.descriptionMinLength || 'Description must be at least 10 characters',
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.contentInput,
                                    errors.description && styles.inputError
                                ]}
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                placeholder={languageTexts?.news?.form?.descriptionPlaceholder || 'Enter news description'}
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={8}
                            />
                        )}
                    />
                    {errors.description && (
                        <Text style={styles.errorText}>{errors.description.message}</Text>
                    )}

                    <Text style={styles.label}>
                        {languageTexts?.news?.form?.images || 'Images (Optional, Up to 5)'}
                    </Text>
                    <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
                        <Text style={styles.imageButtonText}>
                            {images.length > 0
                                ? languageTexts?.news?.form?.addMoreImages || 'Add More Images'
                                : languageTexts?.news?.form?.selectImages || 'Select Images'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.imagePreviewContainer}>
                        {images.map((image, index) => (
                            <View key={index} style={styles.imagePreviewWrapper}>
                                <Image source={{ uri: image.file_url || image.uri }} style={styles.previewImage} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => removeImage(index)}
                                >
                                    <Icon name="close" size={20} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>
                                {newsItem ? (languageTexts?.news?.form?.update || 'Update News') : (languageTexts?.news?.form?.submit || 'Publish News')}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        paddingBottom: 30,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        // paddingTop: 30,
        paddingTop: 40, // Adjusted for status bar padding
        paddingBottom: 10, // Reduced bottom padding
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        marginRight: 10,
    },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    backButton: {
        // position: 'absolute',
        // top: 15,
        // left: 15,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        padding: 8,
    },
    placeholder: {
        width: 40, // Matches the back button width for symmetry
        height: 40,
    },
    formContainer: {
        marginTop: 20,
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        marginHorizontal: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#FFF',
    },
    inputError: {
        borderColor: '#d32f2f',
    },
    contentInput: {
        height: 200,
        textAlignVertical: 'top',
    },
    imageButton: {
        backgroundColor: '#79cf47',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    imageButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    imagePreviewContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    imagePreviewWrapper: {
        width: 100,
        height: 100,
        marginRight: 10,
        marginBottom: 10,
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#d32f2f',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#1081c7',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {    
        color: '#d32f2f',
        fontSize: 14,
        marginTop: 5,
        marginBottom: 10,
    },
});

export default CreateNews;