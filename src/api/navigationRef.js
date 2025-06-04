import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function getCurrentRouteName() {
  if (navigationRef.isReady() && navigationRef.getCurrentRoute()) {
    return navigationRef.getCurrentRoute().name;
  }
  return null;
}