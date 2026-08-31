import type { PropsWithChildren } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  api,
  getAccessToken,
  removeAccessToken,
  saveAccessToken,
  setUnauthorizedHandler,
} from "@/services/api";

import type {
  AuthResponse,
  CurrentUserResponse,
  LoginInput,
  RegisterInput,
  User,
} from "@/types/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (
    input: RegisterInput,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const removeUnauthorizedHandler =
      setUnauthorizedHandler(() => {
        setToken(null);
        setUser(null);
      });

    async function restoreSession() {
      try {
        const storedToken =
          await getAccessToken();

        if (!storedToken) {
          return;
        }

        setToken(storedToken);

        const response =
          await api.get<CurrentUserResponse>(
            "/auth/me",
          );

        setUser(response.data.user);
      } catch {
        // A 401 is handled by the Axios interceptor:
        // it deletes the stored token and clears state.
        // A temporary network failure keeps the token in
        // SecureStore, but no authenticated user is set.
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    void restoreSession();

    return removeUnauthorizedHandler;
  }, []);

  async function login(
    input: LoginInput,
  ): Promise<void> {
    const response =
      await api.post<AuthResponse>(
        "/auth/login",
        input,
      );

    await saveAccessToken(
      response.data.token,
    );

    setToken(response.data.token);
    setUser(response.data.user);
  }

  async function register(
    input: RegisterInput,
  ): Promise<void> {
    const response =
      await api.post<AuthResponse>(
        "/auth/register",
        input,
      );

    await saveAccessToken(
      response.data.token,
    );

    setToken(response.data.token);
    setUser(response.data.user);
  }

  async function logout(): Promise<void> {
    await removeAccessToken();

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated:
          token !== null && user !== null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}