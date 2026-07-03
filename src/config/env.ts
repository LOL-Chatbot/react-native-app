declare const process: {
  env: {
    EXPO_PUBLIC_API_BASE_URL?: string;
  };
};

const defaultApiBaseUrl = "http://10.0.2.2:8080/api/v1";

export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || defaultApiBaseUrl
};
