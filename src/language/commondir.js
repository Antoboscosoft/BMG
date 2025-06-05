import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData } from '../api/auth';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('EN'); // Default language is English
  const [languageTexts, setLanguageTexts] = useState({});
  const [user, setUser]= useState();
  
  // Map lowercase language_pref to uppercase language codes
  const languageCodeMap = {
    en: 'EN',
    hi: 'HI',
    ta: 'TA',
    bn: 'BN',
    ar: 'AR', // Add if Arabic is supported later
  };

  const loadLanguage = async () => {
    try {
      // Check if there's a saved language in AsyncStorage
      const userData = await getUserData();
      setUser(userData);
      console.log("userData.data.language_pref", userData);
      
      const prefLang = userData?.data?.language_pref?.toLowerCase();
      let langToLoad = await AsyncStorage.getItem('languageSelect');
      if (!langToLoad) {
        // If no saved language, try to get from user data
        langToLoad = languageCodeMap[prefLang] || 'EN'; // Map to uppercase or default to EN
        // langToLoad = userData?.data?.preferred_language || 'EN';
      }
      setLanguage(langToLoad);
      await updateLanguageTexts(langToLoad);
    } catch (error) {
      setUser({});
      // console.error('Failed to load language:', error);
      // Fallback to English
      setLanguage('EN');
      await updateLanguageTexts('EN');
    }
  };

  const updateLanguageTexts = async (langCode) => {
    try {
      let texts;
      switch (langCode) {
        case 'HI':
          texts = require('../language/hi.json');
          break;
        case 'TA':
          texts = require('../language/ta.json');
          break;
        case 'EN':
          texts = require('../language/en.json');
          break;
        case 'BN':
          texts = require('../language/bn.json');
          break;
        default:
          texts = require('../language/en.json');
      }
      setLanguageTexts(texts);
    } catch (error) {
      console.error('Failed to load language texts:', error);
      setLanguageTexts(require('../language/en.json')); // Fallback to English
    }
  };

  const changeLanguage = async (langCode) => {
    try {
      await AsyncStorage.setItem('languageSelect', langCode);
      setLanguage(langCode);
      await updateLanguageTexts(langCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  useEffect(() => {
    loadLanguage();
  }, []);

  return (
    <LanguageContext.Provider value={{ language, languageTexts, changeLanguage, setLanguage, user, setUser }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);