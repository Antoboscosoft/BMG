import axiosInstance from "./axiosInstance"

// Function to request OTP
export const getLoginOtp = async (mobile_code, mobile_no) => {
    console.log("getLoginOtp called with params:", mobile_code, mobile_no);

    try {
        const response = await axiosInstance.post(`user/get_login_otp?mobile_code=${mobile_code}&mobile_no=${mobile_no}`);
        console.log("Response data:", response.data);
        return response.data;
    } catch (error) {
        console.error("Get OTP Error:", error);
        throw error.response?.data || { message: "Failed to send OTP" };
    }
};

// Function to verify OTP
export const verifyOtp = async (mobile_code, mobile_no, otp) => {
    console.log("verifyOtp called with params:", mobile_code, mobile_no, otp, {
        mobile_code,
        mobile_no,
        otp,
    });
    try {
        const response = await axiosInstance.post("user/mobile_login", {
            mobile_code,
            mobile_number: mobile_no,
            otp,
        });
        console.log("Verify OTP Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Verify OTP Error:", error);
        throw error.response?.data || { message: "OTP verification failed" };
    }
};

// Function to get countries
export const getCountries = async () => {
    try {
        const response = await axiosInstance.get('user/country?skip=0&limit=25');
        return response.data;
    } catch (error) {
        console.error("Get Countries Error:", error);
        throw error.response?.data || { message: "Failed to fetch countries" };
    }
};

// Function to get states based on country ID
export const getStates = async (countryId) => {
    try {
        const response = await axiosInstance.get(`user/state?country_id=${countryId}`);
        return response.data;
    } catch (error) {
        console.error("Get States Error:", error);
        throw error.response?.data || { message: "Failed to fetch states" };
    }
};

// Function to get districts based on state ID
export const getDistricts = async (stateId) => {
    try {
        const response = await axiosInstance.get(`user/district?state_id=${stateId}`);
        return response.data;
    } catch (error) {
        console.error("Get Districts Error:", error);
        throw error.response?.data || { message: "Failed to fetch districts" };
    }
};

// auth.js
export const registerUser = async (userData) => {
    try {
        const response = await axiosInstance.post('user/register', userData);
        return response.data;
    } catch (error) {
        console.error("Registration Error:", error);
        throw error.response?.data || { message: "Registration failed" };
    }
};

// Updated Function to get user data using axiosInstance
export const getUserData = async (token) => {
    try {
        // console.log("Making request to /user/me with token:", token);
        const response = await axiosInstance.get('user/me');
        // console.log("Get User Data Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Get User Data Error:", error);
        if (error.response) {
            console.error("Error response data:", error.response.data);
            console.error("Error status:", error.response.status);
            console.error("Error headers:", error.response.headers);
        }
        throw error.response?.data || { message: "Failed to fetch user data" };
    }
};

// export const updateUserData = async (userId, data) => {
//     try {
//         const response = await axiosInstance.put(`user/update/${userId}`, data);
//         return response.data;
//     } catch (error) {
//         console.error("Update Error:", error);
//         throw error.response?.data || { message: "Update failed" };
//     }
// };


// Function to update user data
export const updateUserData = async (userId, userData) => {
    try {
        console.log("Updating user data for ID:", userId, "with data:", userData);

        // Prepare the user data as a JSON string (excluding the photo for now)
        const userPayload = {
            date_of_birth: userData.date_of_birth ? formatDate(userData.date_of_birth) : null,
            photo: null, // We'll handle the photo separately if needed
            age: userData.date_of_birth ? parseInt(calculateAge(userData.date_of_birth)) : 0,
            aadhaar_number: userData.aadhaar_number || null,
            native_address_line: userData.native_address_line || null,
            native_district_id: userData.native_district_id || null,
            native_state_id: userData.native_state_id || null,
            native_country_id: userData.native_country_id || null,
            current_address_line: userData.current_address_line,
            current_district_id: userData.current_district_id || null,
            current_state_id: userData.current_state_id || null,
            current_country_id: userData.current_country_id || null,
            skills: userData.skills || null,
            job_type: userData.job_type || null,
            language_pref: userData.language_pref || null,
            id: userData.id,
            name: userData.name,
            email: userData?.email !== '' ? userData?.email : null,
            mobile_number: userData.mobile_number,
            mobile_code: userData.mobile_code,
        };

        // Create FormData object for multipart/form-data
        const formData = new FormData();
        formData.append('user', JSON.stringify(userPayload));

        // // If there's a new photo (base64 string), append it to FormData
        // if (userData.photo && typeof userData.photo === 'string' && userData.photo.startsWith('data:image')) {
        //     formData.append('photo', {
        //         uri: userData.photo,
        //         type: 'image/jpeg',
        //         name: 'photo.jpg',
        //     });
        // } else if (userData.photo && !userData.photo.startsWith('data:image')) {
        //     // If photo is a base64 string without the data URI prefix
        //     formData.append('photo', {
        //         uri: `data:image/jpeg;base64,${userData.photo}`,
        //         type: 'image/jpeg',
        //         name: 'photo.jpg',
        //     });
        // }

        // Append the image under the 'profile' key if a new image is selected
        if (userData.photo && typeof userData.photo === 'string') {
            // Remove the data URI prefix if present (e.g., "data:image/jpeg;base64,")
            const base64String = userData.photo.startsWith('data:image')
                ? userData.photo.split(',')[1]
                : userData.photo;

            formData.append('profile', {
                uri: `data:image/jpeg;base64,${base64String}`,
                type: 'image/jpeg',
                name: 'profile.jpg',
            });
        }

        const response = await axiosInstance.put(`user/update/${userId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'accept': 'application/json',
            },
        });

        console.log("Update User Data Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Update User Data Error:", error);
        if (error.response) {
            console.error("Error response data:", error.response.data);
            console.error("Error status:", error.response.status);
            console.error("Error headers:", error.response.headers);
        }
        throw error.response?.data || { message: "Failed to update user data" };
    }
};

// Helper function to format date (same as in ProfileScreen)
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Helper function to calculate age (same as in ProfileScreen)
function calculateAge(dob) {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return `${age}`;
}

// Add this to your auth.js file
export const getServiceCategories = async () => {
    try {
        const response = await axiosInstance.get('category?skip=0&limit=0&type_=SERVICE');
        return response.data;
    } catch (error) {
        console.error("Get Service Categories Error:", error);
        throw error.response?.data || { message: "Failed to fetch service categories" };
    }
};


// Function to create a service request
export const createServiceRequest = async (serviceData) => {
    try {
        console.log("Creating service request with data:", serviceData);
        const response = await axiosInstance.post('service', serviceData);
        return response.data;
    } catch (error) {
        console.error("Create Service Request Error:", error);
        throw error.response?.data || { message: "Failed to create service request" };
    }
};

// Function to update a service request
export const updateServiceRequest = async (serviceId, data) => {
    try {
        console.log("Updating service request with ID:", serviceId, "and data:", data);
        const response = await axiosInstance.put(`service/${serviceId}`, data);
        return response.data;
    } catch (error) {
        console.error("Update Service Request Error:", error);
        throw error.response?.data || { message: "Failed to update service request" };
    }
};

// Function to delete a service request
export const deleteServiceRequest = async (serviceId) => {
    try {
        console.log("Deleting service request with ID:", serviceId);
        const response = await axiosInstance.delete(`service/${serviceId}`);
        return response.data;
    } catch (error) {
        console.error("Delete Service Request Error:", error);
        throw error.response?.data || { message: "Failed to delete service request" };
    }
};

// Add this to your auth.js file
export const getEvents = async () => {
    try {
        const response = await axiosInstance.get('event');
        return response.data;
    } catch (error) {
        console.error("Get Events Error:", error);
        throw error.response?.data || { message: "Failed to fetch events" };
    }
};

// Add this to your auth.js file
export const createEventRegistration = async (eventId, status) => {
    console.log("Creating event registration with eventId:", eventId, "and status:", status);
    try {
        // const response = await axiosInstance.post('event/rsvp/', {
        //     event_id: eventId,
        //     status: status
        // });
        const response = await axiosInstance.post(`event/rsvp/${eventId}?status=${status.toUpperCase()}`);
        // Convert status to uppercase to match your example
        // const formattedStatus = status.toUpperCase();
        // const response = await axiosInstance.post(`event/rsvp/${eventId}?status=${formattedStatus}`);
        console.log("Registration Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Event Registration Error:", error);
        if (error.response) {
            console.error("Error response data:", error.response.data);
            console.error("Error status:", error.response.status);
        }
        throw error.response?.data || { message: "Failed to register for event" };
    }
};


// auth.js
// export const createEventRegistration = async (eventId, status) => {
//     try {
//         const response = await axiosInstance.post(
//             `event/rsvp/${eventId}?status=${status.toUpperCase()}`
//         );
//         return response.data;
//     } catch (error) {
//         console.error("Event Registration Error:", error);
//         throw error.response?.data || { message: "Failed to register for event" };
//     }
// };

export const updateEventRegistration = async (eventId, status) => {
    try {
        const response = await axiosInstance.put(
            `event/rsvp/${eventId}?status=${status.toUpperCase()}`
        );
        return response.data;
    } catch (error) {
        console.error("Event Update Error:", error);
        throw error.response?.data || { message: "Failed to update registration" };
    }
};

export const deleteEventRegistration = async (eventId) => {
    try {
        const response = await axiosInstance.delete(
            `event/rsvp/${eventId}`
        );
        return response.data;
    } catch (error) {
        console.error("Event Delete Error:", error);
        throw error.response?.data || { message: "Failed to delete registration" };
    }
};
