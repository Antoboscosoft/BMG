import AsyncStorage from "@react-native-async-storage/async-storage";
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
        const response = await axiosInstance.get('user/country?skip=0&limit=0');
        return response.data;
    } catch (error) {
        console.error("Get Countries Error:", error);
        throw error.response?.data || { message: "Failed to fetch countries" };
    }
};

// Function to get states based on country ID
export const getStates = async (countryId) => {
    try {
        const response = await axiosInstance.get(`user/state?country_id=${countryId}&skip=0&limit=0`);
        return response.data;
    } catch (error) {
        console.error("Get States Error:", error);
        throw error.response?.data || { message: "Failed to fetch states" };
    }
};

// Function to get districts based on state ID
export const getDistricts = async (stateId) => {
    try {
        const response = await axiosInstance.get(`user/district?state_id=${stateId}&skip=0&limit=0`);
        return response.data;
    } catch (error) {
        console.error("Get Districts Error:", error);
        throw error.response?.data || { message: "Failed to fetch districts" };
    }
};

// Function to get job types
export const getJobTypes = async () => {
    try {
        const response = await axiosInstance.get('user/job_type?skip=0&limit=0');
        return response.data;
    } catch (error) {
        console.error("Get Job Types Error:", error);
        throw error.response?.data || { message: "Failed to fetch job types" };
    }
}

// Function to get skills
export const getSkillsByJobType = async (jobTypeId) => {
    try {
        const response = await axiosInstance.get(`user/skill?job_type_ids=${jobTypeId}&skip=0&limit=0`);
        return response.data;
    } catch (error) {
        console.error("Get SkillsBy Job Type Error:", error);
        throw error.response?.data || { message: "Failed to fetch skills for the selected job type" };
    }
};

// Function for staff login
// export const staffLoginprev = async (username, password) => {
//     console.log("staffLogin called with params:", { username, password });
//     try {
//         const response = await axiosInstance.post("user/login", {
//             username,
//             password,
//         });
//         console.log("Staff Login Response:", response.data);
//         return response.data;
//     } catch (error) {
//         console.error("Staff Login Error:", error);
//         throw error.response?.data || { message: "Staff login failed" };
//     }
// };


// Function for staff login
export const staffLogin = async (username, password) => {
    console.log("staffLogin called with params:", { username, password });
    if (!username || !password) {
        console.error("staffLogin: Missing username or password", { username, password });
        throw new Error("Username and password are required");
    }
    try {
        // const payload = { username, password };
        const fm = new FormData();
        fm.append("username", username);
        fm.append("password", password);
        // const payload = fm;
        // console.log("staffLogin: Sending payload:", payload);
        const response = await axiosInstance.post("user/login", fm, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'accept': 'application/json',
            },
        });
        console.log("Staff Login Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Staff Login Error:", error.response?.data || error.message);
        throw error.response?.data || { message: "Staff login failed" };
    }
};


// auth.js
export const registerUser = async (userData) => {
    console.log("registerUser called with userData:", userData);
    try {
        const response = await axiosInstance.post('user/register', userData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data;
    } catch (error) {
        console.error("Registration Error:", error);
        throw error.response?.data || { message: "Registration failed", code: error.code, isNetworkError: !error.response };
    }
};

// change password
export const changePassword0 = async (userData) => {
    console.log("changePassword called with userData:", userData);
    try {
        const response = await axiosInstance.put('user/change_password', userData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data;
    } catch (error) {
        console.error("Change Password Error:", error);
        throw error.response?.data || { message: "Change Password failed", code: error.code, isNetworkError: !error.response };
    }
};


export const changePassword = async (data) => {
    try {
        const response = await axiosInstance.put('user/change_password', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

// Updated Function to get user data using axiosInstance
export const getUserData = async (token) => {
    try {
        // console.log("Making request to /user/me with token:", token);
        const response = await axiosInstance.get('user/me');
        console.log("Get User Data Response:", response.data);
        return response.data;
    } catch (error) {
        // console.error("Get User Data Error:", error);
        if (error.response) {
            // console.error("Error response data:", error.response.data);
            // console.error("Error status:", error.response.status);
            // console.error("Error headers:", error.response.headers);
        }
        throw error.response?.data || { message: "Failed to fetch user data" };
    }
};

// Function to get list of migrant users
export const getMigrantsList = async () => {
    try {
        const token = await AsyncStorage.getItem("accessToken");
        console.log("Making request to /user with token:", token);
        const response = await axiosInstance.get("user");
        console.log("Get Migrants List Response:", response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error("Error response data:", error.response.data);
            console.error("Error status:", error.response.status);
            console.error("Error headers:", error.response.headers);
        }
        throw error.response?.data || { message: "Failed to fetch migrants list" };
    }
};

// Function to get a single user by ID
export const getUserById = async (userId) => {
    try {
        const token = await AsyncStorage.getItem("accessToken");
        console.log(`Making request to /user/${userId} with token:`, token);
        const response = await axiosInstance.get(`user/${userId}`);
        console.log("Get User By ID Response:", response.data);
        return response.data;
    } catch (error) {
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
            role_id: userData.role_id || null,
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
        console.log("userData.photo:", userData.newPhoto);
        
        // Append the image under the 'profile' key if a new image is selected
        if (userData.photo && typeof userData.photo === 'string') {
            console.log("Photo included in FormData:", userData.photo.substring(0, 50)); // Log first 50 chars of base64
            // Remove the data URI prefix if present (e.g., "data:image/jpeg;base64,")
            if(userData.newPhoto){
            const base64String = userData.newPhoto.startsWith('data:image')
                ? userData.newPhoto.split(',')[1]
                : userData.newPhoto;

            formData.append('profile', {
                uri: `data:image/jpeg;base64,${base64String}`,
                type: 'image/jpeg',
                name: 'profile.jpg',
            });
        }
        }
        console.log("FormData contents:", formData);
        console.log("Sending request to:", `user/update/${userId}`);
        const response = await axiosInstance.put(`user/update/${userId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'accept': 'application/json',
            },
        });

        console.log("Update User Data Response:", response.data);
        return response.data;
    } catch (error) {
        // console.error("Update User Data Error:", error);
        if (error.response) {
            // console.error("Error response data:", error.response.data);
            // console.error("Error status:", error.response.status);
            // console.error("Error headers:", error.response.headers);
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

export const getServiceMyRequest = async (categoryId) => {
    try {
        const response = await axiosInstance.get(`service_my_requests?category_id=${categoryId}&skip=0&limit=0`);
        return response.data;
    } catch (error) {
        console.error("Get Service My Request Error:", error);
        throw error.response?.data || { message: "Failed to fetch service my request" };
    }
}

export const getServiceRequest = async (categoryId) => {
    try {
        const response = await axiosInstance.get(`service_requests?skip=${skip}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error("Get Service My Request Error:", error);
        throw error.response?.data || { message: "Failed to fetch service my request" };
    }
}


// Function to get service requests based on user role
export const getServiceRequests = async (role, categoryId = null, skip = 0, limit = 0) => {
    console.log("Fetching service requests for role:", role);
    try {
        let endpoint;
        if (role === 'MIGRANT') {
            endpoint = `service_my_requests?${categoryId ? `&category_id=${categoryId}&skip=${skip}&limit=${limit}` : ''}`;

        } else if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'STAFF') {
            endpoint = `service_requests?skip=${skip}&limit=${limit}&category_id=${categoryId}`;

        } else {
            throw new Error('Invalid user role');
        }
        console.log(`Fetching service requests with endpoint: ${endpoint}`);
        const response = await axiosInstance.get(endpoint);
        return response.data;
    } catch (error) {
        console.error("Get Service Requests Error:", error);
        throw error.response?.data || { message: "Failed to fetch service requests" };
    }
};

// 
export const getHelpCategories = async () => {
    try {
        const response = await axiosInstance.get('category?skip=0&limit=0&type_=HELP');
        return response.data;
    } catch (error) {
        console.error("Get Service Categories Error:", error);
        throw error.response?.data || { message: "Failed to fetch service categories" };
    }
};

// getHelpRequestsByCategory
export const getHelpRequestsByCategory = async (categoryId, userId) => {
    try {
        const url = userId
        ? `helprequests?category_id=${categoryId}&user_id=${userId}&skip=0&limit=0`
            : `helprequests?category_id=${categoryId}&skip=0&limit=0`;
        // const response = await axiosInstance.get(`helprequests?category_id=${categoryId}&user_id=${userId}&skip=0&limit=0`);
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error("Get Help Service Categories Error:", error);
        throw error.response?.data || { message: "Failed to fetch service categories" };
    }
};

// createHelpRequest
export const createHelpRequest1 = async (helpData) => {
    try {
        console.log("Creating help request with data:", helpData);
        const response = await axiosInstance.post('helprequests', helpData);
        return response.data;
    } catch (error) {
        console.error("Create Help Request Error:", error);
        throw error.response?.data || { message: "Failed to create help request" };
    }
};

export const createHelpRequest = async (helpData) => {
    try {
        console.log("Creating help request with data:", helpData);
        console.log("Request URL:", 'helprequests');
        console.log("Request Method:", 'POST');
        const response = await axiosInstance.post('helprequests/', helpData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log("Response:", response.data);
        return response.data;
    } catch (error) {
        console.log("Error Response:", error);
        
        // console.error("Create Help Request Error:", error);
        // console.error("Error Response:", error.response?.data);
        // console.error("Error Status:", error.response?.status);
        // console.error("Error Headers:", error.response?.headers);
        throw error.response?.data || { message: "Failed to create help request" };
    }
};


// Fetch help request status options
export const getHelpRequestStatusOptions = async () => {
    try {
        const response = await axiosInstance.get('options?option_type=HELPREQUESTSTATUS');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch help request status options' };
    }
};

// Update help request status
export const updateHelpRequestStatus = async (requestId, status) => {
    try {
        const response = await axiosInstance.put(`helprequests/request/${requestId}?status=${status}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update help request status' };
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

// Function to update service status
export const updateServiceStatus = async (serviceId, status) => {
    try {
        console.log(`Updating service status for service ID ${serviceId} to ${status}`);
        const response = await axiosInstance.put(`service/${serviceId}/status?status=${status}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Update Service Status Error:", error);
        throw error.response?.data || { message: "Failed to update service status" };
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

// get job opportunity:
export const getJobOpportunity = async () => {
    try {
        const response = await axiosInstance.get('job');
        // console.log("Get Job Opportunity Response:", response.data);
        
        return response.data;
    } catch (error) {
        console.error("Get Job Opportunity Error:", error);
        throw error.response?.data || { message: "Failed to fetch job opportunity" };
    }
}

// create job opportunity:
export const createJobOpportunity = async (jobData) => {
    try {
        console.log("Creating job opportunity with data:", jobData);
        const response = await axiosInstance.post('job', jobData);
        return response.data;
    } catch (error) {
        console.error("Create Job Opportunity Error:", error);
        throw error.response?.data || { message: "Failed to create job opportunity" };
    }
}

// Edit a job opportunity
export const editJobOpportunity = async (jobId, jobData) => {
    try {
        console.log("Editing job opportunity with ID:", jobId, "and data:", jobData);
        const response = await axiosInstance.put(`job/${jobId}`, jobData);
        return response.data;
    } catch (error) {
        console.error("Edit Job Opportunity Error:", error);
        throw error.response?.data || { message: "Failed to edit job opportunity" };
    }
}

// Delete a job opportunity
export const deleteJobOpportunity = async (jobId) => {
    try {
        console.log("Deleting job opportunity with ID:", jobId);
        const response = await axiosInstance.delete(`job/${jobId}`);
        return response.data;
    } catch (error) {
        console.error("Delete Job Opportunity Error:", error);
        throw error.response?.data || { message: "Failed to delete job opportunity" };
    }
}


// Apply for a job (POST /job/request)
export const applyForJob = async (jobId) => {
    console.log("Applying for job with ID:", jobId);
    
    try {
        const response = await axiosInstance.post(`job/request?job_id=${jobId}`);
        console.log("response",response.data);
        
        return response.data;
    } catch (error) {
        console.error("Apply for Job Error:", error);
        throw error.response?.data || { message: "Failed to apply for job" };
    }
};

// Get all job requests (for non-migrants) (GET /job/requests)
export const getJobRequests = async (job_id) => {
    try {
        const response = await axiosInstance.get(`job/requests?skip=0&limit=0`);
        console.log("get job requests >>>> !! ",response.data);
        
        // const response = await axiosInstance.get(`job/requests?job_id=${job_id}skip=0&limit=0`);
        return response.data;
    } catch (error) {
        console.error("Get Job Requests Error:", error);
        throw error.response?.data || { message: "Failed to fetch job requests" };
    }
};

// Get user's own job requests (for migrants) (GET /job/my_requests)
export const getMyJobRequests = async (job_id) => {
    try {
        const response = await axiosInstance.get(`job/my_requests?skip=0&limit=0`);
        return response.data;
    } catch (error) {
        console.error("Get My Job Requests Error:", error);
        throw error.response?.data || { message: "Failed to fetch my job requests" };
    }
};

// Update job request status (PUT /job/request/{request_id})
export const updateJobRequestStatus = async (request_id, status, remark) => {
    console.log("api request_id",request_id, "status",status, "remark",remark);
    
    try {
        const response = await axiosInstance.put(`job/request/${request_id}?status=${status}&remarks=${remark}`);
        console.log("response",response.data);
        
        return response.data;
    } catch (error) {
        console.error("Update Job Request Status Error:", error);
        throw error.response?.data || { message: "Failed to update job request status" };
    }
};

// Withdraw a job application (DELETE /job/request/{request_id})
export const withdrawJobApplication = async (requestId) => {
    try {
        const response = await axiosInstance.delete(`job/request/${requestId}`);
        return response.data;
    } catch (error) {
        console.error("Withdraw Job Application Error:", error);
        throw error.response?.data || { message: "Failed to withdraw job application" };
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

// to call event get by id:
export const getEventById = async (eventId) => {
    console.log("Fetching event details for ID:", eventId);
    try {
        const response = await axiosInstance.get(`event/${eventId}`);
        return response.data;
    } catch (error) {
        console.error("Get Event By ID Error:", error);
        throw error.response?.data || { message: "Failed to fetch event details" };
    }
};

// create event
export const createEvent = async (formData) => {
    try {
        const response = await axiosInstance.post('event', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Create Event Error:", error);
        throw error.response?.data || { message: "Failed to create event" };
    }
};

// edit event
export const updateEvent = async (eventId, formData) => {
    console.log("Editing event with ID:", eventId, "and data:", formData);
    try {
        const response = await axiosInstance.put(`event/${eventId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Edit Event Error:", error);
        throw error.response?.data || { message: "Failed to edit event" };
    }
}

// delete event
export const deleteEvent = async (eventId) => {
    console.log("Deleting event with ID:", eventId);
    try {
        const response = await axiosInstance.delete(`event/${eventId}`);
        return response.data;
    } catch (error) {
        console.error("Delete Event Error:", error);
        throw error.response?.data || { message: "Failed to delete event" };
    }
}

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

// Extract data from identity proof image
export const extractIdentityData1 = async (image) => {
    try {
        // Create FormData object for multipart/form-data
        const formData = new FormData();

        // Append the image under the 'file' key
        if (image && image.path) {
            formData.append('file', {
                uri: image.path, // Use the image path directly as provided by ImagePicker
                type: image.mime || 'image/jpeg', // Fallback to jpeg if mime type is unavailable
                name: image.path.split('/').pop() || 'identity_proof.jpg',
            });
        } else {
            throw new Error('No valid image provided for identity proof extraction');
        }

        // Make the API call
        const response = await axiosInstance.post('user/extract_data', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'accept': 'application/json',
            },
        });

        console.log("Extract Identity Data Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Extract Identity Data Error:", error);
        if (error.response) {
            console.error("Error response data:", error.response.data);
            console.error("Error status:", error.response.status);
            console.error("Error headers:", error.response.headers);
        }
        throw new Error(error.response?.data?.message || 'Failed to extract identity data');
    }
};


// Extract data from identity proof image (without token)
export const extractIdentityData = async (image) => {
    try {
        // Create FormData object for multipart/form-data
        const formData = new FormData();

        // Log image details for debugging
        console.log("Image details:", {
            path: image.path,
            mime: image.mime,
            size: image.size,
            width: image.width,
            height: image.height,
        });

        // Append the image under the 'file' key
        if (image && image.path) {
            formData.append('file', {
                uri: image.path, // Use the image path directly as provided by ImagePicker
                type: image.mime || 'image/jpeg', // Fallback to jpeg if mime type is unavailable
                name: image.path.split('/').pop() || 'identity_proof.jpg',
            });
        } else {
            throw new Error('No valid image provided for identity proof extraction');
        }

        // Log FormData contents (for debugging, note: FormData logging might not show all details in React Native)
        console.log("FormData prepared for extractIdentityData:", formData);

        // Make the API call using axiosNoAuth (no token)
        const response = await axiosInstance.post('user/extract_data', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'accept': 'application/json',
                'Accept-Language': 'en', // Force English response
            },
        });

        console.log("Extract Identity Data Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Extract Identity Data Error:", error);
        if (error.response) {
            console.error("Error response data:", error.response.data);
            console.error("Error status:", error.response.status);
            console.error("Error headers:", error.response.headers);
        }
        throw new Error(error.response?.data?.message || 'Failed to extract identity data');
    }
};


// Function to get news
export const getNews = async () => {
  try {
    const response = await axiosInstance.get('news?skip=0&limit=0&active=true');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to get news by id
export const getNewsById = async (id) => {
  try {
    const response = await axiosInstance.get(`/news/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to create news
export const createNews1 = async (formData) => {
  try {
    const response = await axiosInstance.post('news', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


// Function to create news
export const createNews = async (formData) => {
  try {
    for (let pair of formData._parts) {
      console.log(`FormData key: ${pair[0]}, value: ${pair[1]}`);
    }
    const response = await axiosInstance.post('news', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Create News Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Create News Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error; // Throw original error for status access
  }
};

// Function to update news
export const updateNews = async (newsId, formData) => {
  try {
    const response = await axiosInstance.put(`news/${newsId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to delete news
export const deleteNews = async (newsId) => {
  try {
    const response = await axiosInstance.delete(`news/${newsId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete news attachment by ID
export const deleteNewsAttachment = async (attachmentId) => {
  try {
    const response = await axiosInstance.delete(`news/attachment/${attachmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// update fierbase token
export const updateFirebaseToken = async (token) => {   
  try {
    const response = await axiosInstance.put('user/update_user_mobile_token', { "token":token });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// notificaation APIs
export const getNotificationsAPI = async (skip=0, limit=25) => {
  try {
    const response = await axiosInstance.get(`/notification/all?skip=${skip}&limit=${limit}&draft=false`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// notificaation APIs
export const getMyNotificationsAPI = async (skip=0, limit=25, search="") => {
  try {
    const response = await axiosInstance.get(`/notification/my_notification?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get notification by id
export const getNotificationByIdAPI = async (id) => {
  try {
    const response = await axiosInstance.get(`/notification/view/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markAsRead = async (notification_id) =>{
  try {
    const response = await axiosInstance.put(`/notification/read/${notification_id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}