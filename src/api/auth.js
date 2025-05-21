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
        console.log("Making request to /user/me with token:", token);
        // const response = await axiosInstance.get('user/me', {
        //     headers: {
        //         Authorization: `Bearer ${token}`,
        //         'Content-Type': 'application/json',
        //     },
        // });
        const response = await axiosInstance.get('user/me');
        console.log("Get User Data Response:", response.data);
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