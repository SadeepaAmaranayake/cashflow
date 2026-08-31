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

  const [isLoading, setIsLoading] =
    useState(true);

 useEffect(() => {
  const removeUnauthorizedHandler =
    setUnauthorizedHandler(() => {
      setUser(null);
    });

  async function restoreSession() {
    try {
      const token = await getAccessToken();

      if (!token) {
        return;
      }

      const response =
        await api.get<CurrentUserResponse>(
          "/auth/me",
        );

      setUser(response.data.user);
    } catch {
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

    setUser(response.data.user);
  }

  async function logout(): Promise<void> {
    await removeAccessToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
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