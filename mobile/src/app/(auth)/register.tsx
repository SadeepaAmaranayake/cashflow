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

import { useAuth } from "@/context/auth";
import { getApiErrorMessage } from "@/services/api";
import {
  registerFormSchema,
  type RegisterFormValues,
} from "@/validation/auth";

export default function RegisterScreen() {
  const { register } = useAuth();

  const [apiError, setApiError] =
    useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: {
      isSubmitting,
    },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    mode: "onTouched",

    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(
    values: RegisterFormValues,
  ): Promise<void> {
    try {
      setApiError(null);

      await register({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
    } catch (error) {
      setApiError(getApiErrorMessage(error));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Create an account
      </Text>

      <Controller
        control={control}
        name="name"
        render={({
          field: {
            onBlur,
            onChange,
            value,
          },
          fieldState,
        }) => (
          <View style={styles.field}>
            <Text>Name</Text>

            <TextInput
              autoCapitalize="words"
              autoComplete="name"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Your name"
              style={styles.input}
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
            <Text>Email</Text>

            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="you@example.com"
              style={styles.input}
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
            <Text>Password</Text>

            <TextInput
              autoComplete="new-password"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="At least 8 characters"
              secureTextEntry
              style={styles.input}
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
            ? "Creating account..."
            : "Create account"
        }
      />

      <Link href="/login" style={styles.link}>
        Already have an account? Sign in
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