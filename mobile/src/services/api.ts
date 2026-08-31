import {
  create,
  isAxiosError,
} from "axios";
import * as SecureStore from "expo-secure-store";

const apiUrl =
  process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not configured",
  );
}

const ACCESS_TOKEN_KEY = "accessToken";

type UnauthorizedHandler = () => void;

let unauthorizedHandler:
  | UnauthorizedHandler
  | null = null;

export function setUnauthorizedHandler(
  handler: UnauthorizedHandler,
): () => void {
  unauthorizedHandler = handler;

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null;
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

api.interceptors.response.use(
  (response) => response,

  async (error: unknown) => {
    if (!isAxiosError(error)) {
      return Promise.reject(error);
    }

    if (!error.response) {
      const message =
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT"
          ? "The request timed out. Check your connection and try again."
          : "Unable to reach the server. Check your connection and try again.";

      return Promise.reject(
        new Error(message),
      );
    }

    if (error.response.status === 401) {
      await removeAccessToken();
      unauthorizedHandler?.();
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

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(
    ACCESS_TOKEN_KEY,
  );
}

interface ErrorResponseBody {
  message?: unknown;
}

export function getApiErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    !isAxiosError(error)
  ) {
    return error.message;
  }

  if (isAxiosError<ErrorResponseBody>(error)) {
    const message =
      error.response?.data?.message;

    if (typeof message === "string") {
      return message;
    }

    if (error.response) {
      return "The request could not be completed.";
    }
  }

  return "An unexpected error occurred.";
}