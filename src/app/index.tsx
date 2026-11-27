import { useState, useEffect } from "react";
import {
    ActivityIndicator,
    Button,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { apiRequest } from "../services/api";
import { router } from "expo-router";

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
    const [isCheckingSession, setIsCheckingSession] =
        useState(true);
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
            await apiRequest<UserResponse>(
                "/api/v1/auth/login",
                {
                    method: "POST",
                    body: JSON.stringify({
                        username: username.trim(),
                        password,
                    }),
                }
            );
            setPassword("");
            router.replace("/groups");
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

    useEffect(() => {
        const checkSession = async () => {
            try {
                await apiRequest<UserResponse>("/api/v1/auth/me");
                router.replace("/groups");
            } catch {
                // No active session, show the login form.
            } finally {
                setIsCheckingSession(false);
            }
        };

        void checkSession();
    }, []);

    if (isCheckingSession) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.checkingText}>
                    Checking your session...
                </Text>
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

            <View style={styles.registerButton}>
                <Button
                    title="Create Account"
                    onPress={() => router.push("/register")}
                />
            </View>
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
    checkingText: {
        textAlign: "center",
        color: "#666",
        marginTop: 12,
    },
    registerButton: {
        marginTop: 12,
    },
});