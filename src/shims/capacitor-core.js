// The web build has no native shell: Sound Out's Capacitor imports resolve here (vite alias). Never native.
export const Capacitor = { isNativePlatform: () => false };
