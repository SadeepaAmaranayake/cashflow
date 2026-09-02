import { create, isAxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import type {
  TransactionCategory,
} from "@/constants/categories";

export type ISODateString = string;

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not configured",
  );
}

const ACCESS_TOKEN_KEY = "accessToken";

type UnauthorizedHandler = () => void;

let unauthorizedHandler:
  | UnauthorizedHandler
  | undefined;

export function setUnauthorizedHandler(
  handler: UnauthorizedHandler,
): () => void {
  unauthorizedHandler = handler;

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = undefined;
    }
  };
}

export const api = create({
  baseURL: apiUrl.replace(/\/+$/, ""),
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        await removeAccessToken();
        unauthorizedHandler?.();
      }

      if (!error.response) {
        const message =
          error.code === "ECONNABORTED"
            ? "The request timed out. Try again."
            : "Unable to reach the server. Check your connection and try again.";

        return Promise.reject(new Error(message));
      }
    }

    return Promise.reject(error);
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

export async function getAccessToken(): Promise<
  string | null
> {
  return SecureStore.getItemAsync(
    ACCESS_TOKEN_KEY,
  );
}

function hasMessage(
  value: unknown,
): value is { message: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  );
}

export function getApiErrorMessage(
  error: unknown,
): string {
  if (isAxiosError(error)) {
    if (hasMessage(error.response?.data)) {
      return error.response.data.message;
    }

    if (!error.response) {
      return "Unable to reach the server. Check your connection and try again.";
    }

    return `Request failed with status ${error.response.status}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}