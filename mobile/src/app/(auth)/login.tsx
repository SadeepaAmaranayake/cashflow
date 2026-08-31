import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";

import { useAuth } from "@/context/auth";
import { getApiErrorMessage } from "@/services/api";
import {
  loginFormSchema,
  type LoginFormValues,
} from "@/validation/auth";

export default function LoginScreen() {
  const { login } = useAuth();
  const theme = useTheme();
  const [apiError, setApiError] =
    useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: {
      isSubmitting,
    },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    mode: "onTouched",

    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(
    values: LoginFormValues,
  ): Promise<void> {
    try {
      setApiError(null);

      await login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    }
  }

  return (
      <View
        style={[
            styles.container,
            {
            backgroundColor: theme.background,
            },
        ]}
        >
      <Text
        style={[
            styles.title,
            {
            color: theme.text,
            },
        ]}
        >
        Welcome back
      </Text>

      <Controller
        control={control}
        name="email"
        render={({
          field: {
            onBlur,
            onChange,
            value,
          },
          fieldState,
        }) => (
          <View style={styles.field}>
            <Text style={{ color: theme.text }}>
                Email
            </Text>

            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="you@example.com"
              placeholderTextColor={theme.textSecondary}
                style={[
                styles.input,
                {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                },
                ]}
              value={value}
            />

            {fieldState.isTouched &&
            fieldState.error?.message ? (
              <Text style={styles.fieldError}>
                {fieldState.error.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({
          field: {
            onBlur,
            onChange,
            value,
          },
          fieldState,
        }) => (
          <View style={styles.field}>
            <Text style={{ color: theme.text }}>
                Password
            </Text>

            <TextInput
              autoComplete="current-password"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Your password"
              secureTextEntry
              placeholderTextColor={theme.textSecondary}
                style={[
                styles.input,
                {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                },
                ]}
              value={value}
            />

            {fieldState.isTouched &&
            fieldState.error?.message ? (
              <Text style={styles.fieldError}>
                {fieldState.error.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      {apiError ? (
        <Text style={styles.apiError}>
          {apiError}
        </Text>
      ) : null}

      <Button
        disabled={isSubmitting}
        onPress={handleSubmit(onSubmit)}
        title={
          isSubmitting
            ? "Signing in..."
            : "Sign in"
        }
      />

      <Link href="/register" style={styles.link}>
        Create an account
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  field: {
    gap: 6,
  },

  input: {
    borderColor: "#9ca3af",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },

  fieldError: {
    color: "#b91c1c",
  },

  apiError: {
    color: "#b91c1c",
  },

  link: {
    alignSelf: "center",
    color: "#2563eb",
  },
});