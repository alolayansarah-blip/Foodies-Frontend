import Constants from "expo-constants";

// Prefer value from Expo config / env, but fall back to the known backend URL
const envApiBaseUrl =
  Constants.expoConfig?.extra?.apiBaseUrl || process.env.API_BASE_URL;

// Fallback URL for development if env is not configured
const DEFAULT_API_BASE_URL = "http://134.122.96.197:3000";

const API_BASE_URL = envApiBaseUrl || DEFAULT_API_BASE_URL;

if (!envApiBaseUrl) {
  console.warn(
    `API_BASE_URL not found in env / app config. Falling back to default: ${DEFAULT_API_BASE_URL}`
  );
}

// Ensure URL doesn't have trailing slash
const cleanUrl = API_BASE_URL.toString().replace(/\/$/, "");

console.log("API Base URL configured:", cleanUrl);

export const config = {
  API_BASE_URL: cleanUrl,
};
