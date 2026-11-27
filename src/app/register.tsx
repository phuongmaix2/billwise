import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { router, Stack } from "expo-router";

import { apiRequest } from "../services/api";

type UserResponse = {
  id: number;
  username: string;
  email: string;
  role: string;
  preferredCurrency: string;
  enabled: boolean;
  createdAt: string;
};

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const register = async () => {
    if (
      !username.trim() ||
      !email.trim() ||
      !password ||
      !currency.trim()
    ) {
      setError("Complete all fields.");
      return;
    }

    setError("");
    setIsRegistering(true);

    try {
      await apiRequest<UserResponse>(
        "/api/v1/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            password,
            preferredCurrency: currency
              .trim()
              .toUpperCase(),
          }),
        }
      );

      Alert.alert(
        "Account created",
        "You can now log in.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not create account."
      );
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: "Create Account" }} />

      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.helper}>
        At least 12 characters with uppercase, lowercase,
        number and special character.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Preferred currency"
        autoCapitalize="characters"
        maxLength={3}
        value={currency}
        onChangeText={setCurrency}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isRegistering ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        <Button title="Create Account" onPress={register} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  helper: {
    color: "#666",
    marginBottom: 16,
  },
  error: {
    color: "red",
    marginBottom: 12,
  },
});