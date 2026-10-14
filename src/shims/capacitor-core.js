// The web build has no native shell: the engine's Capacitor imports resolve here (vite alias). Never native.
export const Capacitor = { isNativePlatform: () => false };
