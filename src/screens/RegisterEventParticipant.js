import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RenderHtml from 'react-native-render-html';
import DateTimePicker from '@react-native-community/datetimepicker';
import CountryPicker from 'react-native-country-picker-modal';
import { useLanguage } from '../language/commondir';
import { sendOtp, registerEventParticipant, getGenderOptions, verifyEventOtp, registerEvent } from '../api/auth';

// Utility functions (keep the same)
const formatDateForApi = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

const formatDateForDisplay = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getDate()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
};

const formatEventDate = (startDatetime, endDatetime) => {
  const start = new Date(startDatetime);
  const end = new Date(endDatetime);
  const startFormatted = start.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
  const endFormatted = end.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
  return startFormatted === endFormatted ? startFormatted : `${startFormatted} - ${endFormatted}`;
};

const formatEventTime = (startDatetime, endDatetime) => {
  const start = new Date(startDatetime);
  const end = new Date(endDatetime);
  const options = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  const startFormatted = start.toLocaleTimeString([], options);
  const endFormatted = end.toLocaleTimeString([], options);
  return startFormatted === endFormatted ? startFormatted : `${startFormatted} - ${endFormatted}`;
};

function RegisterEventParticipant({ navigation, route }) {
  const { languageTexts } = useLanguage();
  const { eventData, fromCalendar = false } = route.params; // Add fromCalendar flag
  console.log("eventData > ", eventData);

  // Country code states
  const [countryCode, setCountryCode] = useState('IN');
  const [callingCode, setCallingCode] = useState('91');

  // Form state
  const [form, setForm] = useState({
    name: '',
    mobile_code: '+91',
    phone: '',
    dateOfBirth: '',
    gender: '',
    otp: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDOBPicker, setShowDOBPicker] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [genderOptions, setGenderOptions] = useState([]);
  const [loadingGenders, setLoadingGenders] = useState(false);

  // Check if user is logged in (you might want to use your actual auth state)
  const [isLoggedIn] = useState(fromCalendar); // Simplified - use your actual auth state

  // Initialize calling code from form.mobile_code if it exists
  useEffect(() => {
    if (form.mobile_code) {
      const codeWithoutPlus = form.mobile_code.replace('+', '');
      setCallingCode(codeWithoutPlus);
    }
  }, []);

  // Countdown timer for resend OTP (only for non-logged in users)
  useEffect(() => {
    let timer;
    if (!isLoggedIn && resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown, isLoggedIn]);

  // Add this helper function at the top of your component, after the utility functions
  const getTranslatedGenderOptions = (genderOptions, languageTexts) => {
    const genderTranslationMap = {
      'MALE': languageTexts?.eventRegister?.male || 'Male',
      'FEMALE': languageTexts?.eventRegister?.female || 'Female', 
      'OTHER': languageTexts?.eventRegister?.other || 'Other'
    };

    return genderOptions.map(option => ({
      ...option,
      label: genderTranslationMap[option.value] || option.label
    }));
  };

  // Fetch gender options on mount
  useEffect(() => {
    const fetchGenderOptions = async () => {
      setLoadingGenders(true);
      try {
        const response = await getGenderOptions();
        
        let options = [];
        if (Array.isArray(response)) {
          options = response;
          // setGenderOptions(response);
        } else if (response.data && Array.isArray(response.data)) {
          options = response.data;
          // setGenderOptions(response.data);
        } else if (response.genders && Array.isArray(response.genders)) {
          options = response.genders;
          // setGenderOptions(response.genders);
        } else {
          // setGenderOptions([
          //   { value: 'MALE', label: 'Male' },
          //   { value: 'FEMALE', label: 'Female' },
          //   { value: 'OTHER', label: 'Other' },
          // ]);
          // Fallback to default options if API response format is unexpected
        options = [
          { value: 'MALE', label: 'Male' },
          { value: 'FEMALE', label: 'Female' },
          { value: 'OTHER', label: 'Other' },
        ];
        }

        // Apply translations to the options
        const translatedOptions = getTranslatedGenderOptions(options, languageTexts);
        setGenderOptions(translatedOptions);
      } catch (error) {
        console.error('Failed to fetch gender options:', error);
        // setGenderOptions([
        //   { value: 'MALE', label: 'Male' },
        //   { value: 'FEMALE', label: 'Female' },
        //   { value: 'OTHER', label: 'Other' },
        // ]);
        // Fallback to default options if API fails, with translations
        const fallbackOptions = [
          { value: 'MALE', label: 'Male' },
          { value: 'FEMALE', label: 'Female' },
          { value: 'OTHER', label: 'Other' },
        ];
        const translatedFallbackOptions = getTranslatedGenderOptions(fallbackOptions, languageTexts);
        setGenderOptions(translatedFallbackOptions);
      } finally {
        setLoadingGenders(false);
      }
    };

    fetchGenderOptions();
  }, [languageTexts]);

  // Also add another useEffect to update gender options when language changes
  useEffect(() => {
    if (genderOptions.length > 0 && languageTexts) {
      const translatedOptions = getTranslatedGenderOptions(genderOptions, languageTexts);
      setGenderOptions(translatedOptions);
    }
  }, [languageTexts]); // This will update gender labels when language changes


  // Check if form is valid for enabling Send OTP button (non-logged in) or Register button (logged in)
  const isFormValid = () => {
    return (
      form.name.trim().length >= 2 &&
      /^\d{10}$/.test(form.phone.replace(/\D/g, '')) &&
      form.dateOfBirth &&
      new Date(form.dateOfBirth) <= new Date() &&
      form.gender
    );
  };

  // Check if OTP is valid for enabling Register button (non-logged in only)
  const isOtpValid = () => {
    return isLoggedIn ? true : (otpSent && /^\d{5}$/.test(form.otp));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateField = (field, value) => {
    let error = '';

    switch (field) {
      case 'name':
        if (!value || value.trim().length === 0) {
          error = languageTexts?.eventRegister?.nameRequired || 'Name is required';
        } else if (value.trim().length < 2) {
          error = languageTexts?.eventRegister?.nameMinLength || 'Name must be at least 2 characters';
        }
        break;

      case 'mobile_code':
        if (!value) {
          error = languageTexts?.eventRegister?.countryCodeRequired || 'Country code is required';
        }
        break;

      case 'phone':
        if (!value || value.trim().length === 0) {
          error = languageTexts?.eventRegister?.phoneRequired || 'Phone number is required';
        } else if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) {
          error = languageTexts?.eventRegister?.phoneInvalid || 'Please enter a valid 10-digit phone number';
        }
        break;

      case 'dateOfBirth':
        if (!value) {
          error = languageTexts?.eventRegister?.dobRequired || 'Date of birth is required';
        } else {
          const today = new Date();
          const dob = new Date(value);
          const age = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));
          if (age < 1 || age > 120) {
            error = languageTexts?.eventRegister?.dobInvalid || 'Please enter a valid date of birth';
          }
        }
        break;

      case 'gender':
        if (!value) {
          error = languageTexts?.eventRegister?.genderRequired || 'Gender is required';
        }
        break;

      case 'otp':
        if (!isLoggedIn && otpSent && (!value || !/^\d{5}$/.test(value))) {
          error = languageTexts?.eventRegister?.otpRequired || 'Please enter a valid 5-digit OTP';
        }
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));

    return error === '';
  };

  const validateForm = () => {
    const fields = ['name', 'mobile_code', 'phone', 'dateOfBirth', 'gender'];
    if (!isLoggedIn && otpSent) {
      fields.push('otp');
    }
    
    let isValid = true;

    fields.forEach((field) => {
      const fieldIsValid = validateField(field, form[field]);
      if (!fieldIsValid) {
        isValid = false;
      }
      setTouched((prev) => ({
        ...prev,
        [field]: true,
      }));
    });

    return isValid;
  };

  const handleSendOtp = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form before requesting an OTP.');
      return;
    }

    setIsSendingOtp(true);
    
    try {
      const userDataForOtp = {
        name: form.name.trim(),
        mobile_code: `+${callingCode}`,
        mobile_number: form.phone.replace(/\D/g, ''),
        date_of_birth: formatDateForApi(form.dateOfBirth),
        gender: form.gender
      };
      
      const response = await registerEvent(eventData.id, userDataForOtp);
      
      if (response.status === true || response.success === true) {
        setOtpSent(true);
        setResendCountdown(30);
        Alert.alert('Success', 'OTP has been sent to your phone number.');
      } else {
        const errorMessage = response.message || response.details || 'Failed to send OTP';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;

    setIsSendingOtp(true);
    try {
      const userDataForOtp = {
        name: form.name.trim(),
        mobile_code: `+${callingCode}`,
        mobile_number: form.phone.replace(/\D/g, ''),
        date_of_birth: formatDateForApi(form.dateOfBirth),
        gender: form.gender
      };
      
      const response = await registerEvent(eventData.id, userDataForOtp);

      if (response.status === true || response.success === true) {
        setResendCountdown(30);
        Alert.alert('Success', 'New OTP has been sent to your phone number.');
      } else {
        const errorMessage = response.message || response.details || 'Failed to send OTP';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Resend OTP Error:', error);
      Alert.alert('Error', error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async () => {
    // if (!validateForm()) {
    //   Alert.alert('Validation Error', 'Please correct the errors and try again.');
    //   return;
    // }

    const requiredFields = ['name', 'mobile_code', 'phone', 'dateOfBirth', 'gender'];
    if (!isLoggedIn) {
      requiredFields.push('otp'); // Add OTP field for non-logged in users
    }

    let hasErrors = false;

    // Mark all required fields as touched so errors show
    const newTouched = {};
    requiredFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(prev => ({ ...prev, ...newTouched }));

    // Validate each field individually
    requiredFields.forEach(field => {
      const isValid = validateField(field, form[field]);
      if (!isValid) {
        hasErrors = true;
      }
    });

    // For non-logged in users, also check if OTP was sent
    if (!isLoggedIn && !otpSent) {
      Alert.alert('OTP Required', 'Please request an OTP first before registering.');
      return;
    }

    // If there are validation errors, don't proceed
    if (hasErrors) {
      return; // Just return, don't show alert - field errors are already visible
    }
    setIsSubmitting(true);

    try {
      const participantData = {
        name: form.name.trim(),
        mobile_code: `+${callingCode}`,
        mobile_number: form.phone.replace(/\D/g, ''),
        date_of_birth: formatDateForApi(form.dateOfBirth),
        gender: form.gender,
      };
      
      let response;
      
      if (isLoggedIn) {
        // For logged in users: use registerEvent directly
        response = await registerEvent(eventData.id, participantData);
      } else {
        // For non-logged in users: use verifyEventOtp with OTP
        response = await verifyEventOtp(eventData.id, form.otp, participantData);
      }
      
      if (response.status === true || response.success === true) {
        Alert.alert(
          'Success',
          `Thank you ${form.name}! Your registration for "${eventData.title}" has been submitted successfully.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
          { cancelable: false }
        );
      } else {
        const errorMessage = response.message || response.details || 'Failed to register for event';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Registration Error:', error);
      Alert.alert('Error', error.message || 'Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDOBPicker(false);
    if (selectedDate) {
      handleChange('dateOfBirth', selectedDate.toISOString());
      validateField('dateOfBirth', selectedDate.toISOString());
    }
  };

  return (
    <LinearGradient colors={['#2753b2', '#e6e9f0']} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : -50}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.headerText}>{languageTexts?.eventRegister?.title || 'Event Registration'}</Text>
            {/* {isLoggedIn && (
              <Text style={styles.loggedInText}>You are logged in - No OTP required</Text>
            )} */}
          </View>

          <View style={styles.contentContainer}>
            {/* Event Details Section */}
            {/* <View style={styles.eventSection}>
              <Text style={styles.sectionTitle}>{languageTexts?.eventRegister?.eventDetails || 'Event Details'}</Text>
              <View style={styles.eventBox}>
                <Text style={styles.eventTitle}>{eventData.title}</Text>
                <View style={styles.eventDetailRow}>
                  <Icon name="calendar-today" size={18} color="#2753b2" style={styles.icon} />
                  <Text style={styles.eventDetail}>
                    {isLoggedIn ? 
                    formatEventDate(eventData.eventData.start_datetime, eventData.eventData.end_datetime) :
                    formatEventDate(eventData.start_datetime, eventData.end_datetime)}
                  </Text>
                </View>
                <View style={styles.eventDetailRow}>
                  <Icon name="access-time" size={18} color="#2753b2" style={styles.icon} />
                  <Text style={styles.eventDetail}>
                    {isLoggedIn ?
                    formatEventTime(eventData.eventData.start_datetime, eventData.eventData.end_datetime) :
                    formatEventTime(eventData.start_datetime, eventData.end_datetime)
                  }</Text>
                </View>
                <View style={styles.eventDetailRow}>
                  <Icon name="location-on" size={18} color="#2753b2" style={styles.icon} />
                  <Text style={styles.eventDetail}>
                    {isLoggedIn ? eventData.eventData.location : eventData.location}
                  </Text>
                </View>
              </View>
            </View> */}

            {/* Registration Form Section */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>{languageTexts?.eventRegister?.participantInfo || 'Participant Information'}</Text>

              {/* Name Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  {languageTexts?.eventRegister?.fullname || 'Full Name'} <Text style={styles.mandatoryIndicator}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, touched.name && errors.name && styles.errorInput]}
                  placeholder={languageTexts?.eventRegister?.fullnamePlaceholder || "Enter your full name"}
                  placeholderTextColor="#999"
                  value={form.name}
                  onChangeText={(value) => handleChange('name', value)}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, name: true }));
                    validateField('name', form.name);
                  }}
                  autoCapitalize="words"
                />
                {touched.name && errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              {/* Phone Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  {languageTexts?.eventRegister?.phoneNumber || 'Phone Number'} <Text style={styles.mandatoryIndicator}>*</Text>
                </Text>
                <View style={[styles.phoneRow, touched.phone && errors.phone && styles.errorInput]}>
                  <CountryPicker
                    countryCode={countryCode}
                    withCallingCode
                    withFlag
                    withFilter
                    withEmoji
                    onSelect={(country) => {
                      setCountryCode(country.cca2);
                      setCallingCode(country.callingCode[0]);
                      handleChange('mobile_code', `+${country.callingCode[0]}`);
                    }}
                    containerButtonStyle={styles.countryPicker}
                  />
                  <Text style={styles.callingCode}>+{callingCode}</Text>
                  <TextInput
                    style={[styles.mobileinput, { flex: 1 }]}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, phone: true }));
                      validateField('phone', form.phone);
                    }}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9]/g, '');
                      handleChange('phone', cleaned);
                    }}
                    value={form.phone}
                    keyboardType="phone-pad"
                    placeholder={languageTexts?.eventRegister?.phoneNumberPlaceholder || "Enter your phone number"}
                    placeholderTextColor="#999"
                    maxLength={15}
                  />
                </View>
                {touched.phone && errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>

              {/* Date of Birth Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  {languageTexts?.eventRegister?.dateOfBirth || 'Date of Birth'} <Text style={styles.mandatoryIndicator}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.input, styles.dateInput, touched.dateOfBirth && errors.dateOfBirth && styles.errorInput]}
                  onPress={() => setShowDOBPicker(true)}
                >
                  <Text
                    style={[styles.dateText, !form.dateOfBirth && styles.placeholderText]}
                  >
                    {form.dateOfBirth ? formatDateForDisplay(form.dateOfBirth) : languageTexts?.eventRegister?.dateOfBirthPlaceholder || 'Select date of birth'}
                  </Text>
                  <Icon name="calendar-today" size={20} color="#666" />
                </TouchableOpacity>
                {touched.dateOfBirth && errors.dateOfBirth && (
                  <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
                )}

                {showDOBPicker && (
                  <DateTimePicker
                    value={form.dateOfBirth ? new Date(form.dateOfBirth) : new Date('2000-01-01')}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              {/* Gender Radio Buttons */}
              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>{languageTexts?.eventRegister?.gender || 'Gender'}</Text>
                  <Text style={styles.mandatoryIndicator}>*</Text>
                </View>

                {loadingGenders ? (
                  <ActivityIndicator size="small" color="#2753b2" style={styles.loadingIndicator} />
                ) : (
                  <View style={styles.radioRowContainer}>
                    {genderOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={styles.radioItem}
                        onPress={() => {
                          handleChange('gender', option.value);
                          setTouched((prev) => ({ ...prev, gender: true }));
                          validateField('gender', option.value);
                        }}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.radioCircle,
                            form.gender === option.value && styles.radioSelected,
                          ]}
                        >
                          {form.gender === option.value && <View style={styles.radioDot} />}
                        </View>
                        <Text style={styles.radioText}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {touched.gender && errors.gender && (
                  <Text style={styles.errorText}>{errors.gender}</Text>
                )}
              </View>

              {/* OTP Section - Only show for non-logged in users */}
              {!isLoggedIn && (
                <>
                  {/* Send OTP Button */}
                  <TouchableOpacity
                    style={[styles.sendOtpButton, (!isFormValid() || isSendingOtp) && styles.disabledButton]}
                    onPress={handleSendOtp}
                    disabled={!isFormValid() || isSendingOtp}
                  >
                    {isSendingOtp ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Icon name="sms" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Send OTP</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Resend OTP Section */}
                  {otpSent && (
                    <View style={styles.resendContainer}>
                      {resendCountdown > 0 ? (
                        <Text style={styles.resendText}>
                          Resend OTP in {resendCountdown} seconds
                        </Text>
                      ) : (
                        <TouchableOpacity onPress={handleResendOtp}>
                          <Text style={styles.resendLink}>Resend OTP</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* OTP Field */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                      OTP <Text style={styles.mandatoryIndicator}>*</Text>
                    </Text>
                    <TextInput
                      style={[styles.input, touched.otp && errors.otp && styles.errorInput]}
                      placeholder="Enter 5-digit OTP"
                      placeholderTextColor="#999"
                      value={form.otp}
                      onChangeText={(value) => {
                        const cleaned = value.replace(/[^0-9]/g, '');
                        handleChange('otp', cleaned);
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, otp: true }));
                        validateField('otp', form.otp);
                      }}
                      keyboardType="number-pad"
                      maxLength={5}
                      editable={otpSent}
                    />
                    {touched.otp && errors.otp && (
                      <Text style={styles.errorText}>{errors.otp}</Text>
                    )}
                  </View>
                </>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, (!isOtpValid() || isSubmitting) && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={!isOtpValid() || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="person-add" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>
                      {isLoggedIn ? 'Register for Event' : 'Verify OTP & Register'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  loggedInText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 15,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 80,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  contentContainer: {
    marginTop: 5,
  },
  eventSection: {
    marginBottom: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },
  eventBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2753b2',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2753b2',
    marginBottom: 10,
    textAlign: 'center',
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  icon: {
    marginRight: 10,
    width: 20,
  },
  eventDetail: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mandatoryIndicator: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  countryPicker: {
    padding: 10,
    marginRight: -10, // extra added
  },
  callingCode: {
    fontSize: 16,
    color: '#333',
    // paddingHorizontal: 5, // extra removed
  },
  mobileinput: {
    padding: 10, // extra adjusted
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  errorInput: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  radioRowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 4,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 10,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2753b2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  radioSelected: {
    backgroundColor: '#2753b2',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  sendOtpButton: {
    backgroundColor: '#2753b2',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 10,
    marginBottom: 25,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  resendText: {
    color: '#666',
    fontSize: 14,
  },
  resendLink: {
    color: '#2753b2',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginVertical: 10,
  },
});

export default RegisterEventParticipant;