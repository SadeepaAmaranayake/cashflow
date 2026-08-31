import { API_URL } from "@/config/api";

interface LoginInput {
  email: string;
  password: string;
}

export async function login(
  input: LoginInput,
) {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(input),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "Login failed",
    );
  }

  return data;
}