// UserContext.js
import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [migrants, setMigrants] = useState([]);

    return (
        <UserContext.Provider value={{ userData, setUserData, migrants, setMigrants }}>
            {children}
        </UserContext.Provider>
    );
};