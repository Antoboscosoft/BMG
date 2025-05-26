/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
// import { LanguageProvider } from './src/language/commondir';

const MainApp = () => {
    return (
        // <LanguageProvider>
            <App />
        // </LanguageProvider>
    );
};

AppRegistry.registerComponent(appName, () => MainApp);
