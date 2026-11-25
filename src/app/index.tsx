import { useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<UserResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const loggedInUser = await apiRequest<UserResponse>(
        "/api/v1/auth/login",
        {
          method: "POST",
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      setUser(loggedInUser);
      setPassword("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome, {user.username}!</Text>
        <Text style={styles.success}>Login successful.</Text>
        <Text>Currency: {user.preferredCurrency}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BillWise</Text>
      <Text style={styles.subtitle}>Log in to your account</Text>

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
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        <Button title="Log In" onPress={login} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  error: {
    color: "red",
    marginBottom: 12,
  },
  success: {
    color: "green",
    textAlign: "center",
    marginBottom: 12,
  },
});