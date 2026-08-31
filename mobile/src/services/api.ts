import { create } from "axios";
import * as SecureStore from "expo-secure-store";

const apiUrl =
  process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not configured",
  );
}

const ACCESS_TOKEN_KEY = "accessToken";

export const api = create({
  baseURL: apiUrl.replace(/\/+$/, ""),
  timeout: 10_000,

  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token =
      await SecureStore.getItemAsync(
        ACCESS_TOKEN_KEY,
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
);

export async function saveAccessToken(
  token: string,
): Promise<void> {
  await SecureStore.setItemAsync(
    ACCESS_TOKEN_KEY,
    token,
  );
}

export async function removeAccessToken(): Promise<void> {
  await SecureStore.deleteItemAsync(
    ACCESS_TOKEN_KEY,
  );
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(
    ACCESS_TOKEN_KEY,
  );
}