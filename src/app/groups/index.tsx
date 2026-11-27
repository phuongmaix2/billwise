import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Button,
    FlatList,
    StyleSheet,
    Text,
    View,
    TextInput,
    Pressable,
    Alert,
} from "react-native";

import { apiRequest } from "../../services/api";
import { router, Stack, useFocusEffect } from "expo-router";

type GroupResponse = {
    id: number;
    name: string;
    description: string | null;
    baseCurrency: string;
    ownerId: number;
    ownerUsername: string;
    createdAt: string;
};

export default function GroupsScreen() {
    const [groups, setGroups] = useState<GroupResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [formError, setFormError] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const loadGroups = useCallback(async () => {
        setError("");
        setIsLoading(true);

        try {
            const data = await apiRequest<GroupResponse[]>(
                "/api/v1/groups"
            );

            setGroups(data);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Could not load groups."
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createGroup = async () => {
        const name = groupName.trim();

        if (!name) {
            setFormError("Enter a group name.");
            return;
        }

        setFormError("");
        setIsCreating(true);

        try {
            const createdGroup = await apiRequest<GroupResponse>(
                "/api/v1/groups",
                {
                    method: "POST",
                    body: JSON.stringify({
                        name,
                        description: description.trim(),
                        baseCurrency: "EUR",
                    }),
                }
            );

            setGroups((currentGroups) => [
                createdGroup,
                ...currentGroups,
            ]);

            setGroupName("");
            setDescription("");
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Could not create the group."
            );
        } finally {
            setIsCreating(false);
        }
    };

    const logout = async () => {
        setIsLoggingOut(true);

        try {
            await apiRequest<void>(
                "/api/v1/auth/logout",
                {
                    method: "POST",
                }
            );

            router.replace("/");
        } catch (error) {
            Alert.alert(
                "Logout failed",
                error instanceof Error
                    ? error.message
                    : "Could not log out."
            );
        } finally {
            setIsLoggingOut(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            void loadGroups();
        }, [loadGroups])
    );

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading groups...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error}</Text>
                <Button title="Try Again" onPress={loadGroups} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: "My Groups",
                    headerRight: () =>
                        isLoggingOut ? (
                            <ActivityIndicator
                                size="small"
                                color="#2563eb"
                            />
                        ) : (
                            <Button title="Log Out" onPress={logout} />
                        ),
                }}
            />
            <FlatList
                data={groups}
                contentContainerStyle={styles.list}
                keyExtractor={(item) => item.id.toString()}
                contentInsetAdjustmentBehavior="automatic"
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    <View style={styles.form}>
                        <Text style={styles.formTitle}>Create Group</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Group name"
                            value={groupName}
                            onChangeText={setGroupName}
                        />

                        <TextInput
                            style={[styles.input, styles.descriptionInput]}
                            placeholder="Description (optional)"
                            multiline
                            value={description}
                            onChangeText={setDescription}
                        />

                        {formError ? (
                            <Text style={styles.formError}>{formError}</Text>
                        ) : null}

                        {isCreating ? (
                            <ActivityIndicator color="#2563eb" />
                        ) : (
                            <Button title="Create Group" onPress={createGroup} />
                        )}
                    </View>
                }
                ListEmptyComponent={
                    <Text style={styles.empty}>You have no groups yet.</Text>
                }
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.card}
                        onPress={() =>
                            router.push({
                                pathname: "/groups/[id]",
                                params: {
                                    id: item.id.toString(),
                                    name: item.name,
                                    currency: item.baseCurrency,
                                },
                            })
                        }
                    >
                        <Text style={styles.groupName}>{item.name}</Text>

                        {item.description ? (
                            <Text style={styles.description}>
                                {item.description}
                            </Text>
                        ) : null}

                        <Text>Currency: {item.baseCurrency}</Text>
                        <Text>Owner: {item.ownerUsername}</Text>
                    </Pressable>
                )
                }
            />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#fff",
    },
    loadingText: {
        marginTop: 12,
    },
    error: {
        color: "red",
        textAlign: "center",
        marginBottom: 12,
    },
    empty: {
        textAlign: "center",
        color: "#666",
        marginTop: 30,
    },
    card: {
        padding: 16,
        backgroundColor: "#f2f2f2",
        borderRadius: 10,
        marginBottom: 12,
    },
    groupName: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 6,
    },
    description: {
        color: "#555",
        marginBottom: 6,
    },
    list: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
    },
    form: {
        padding: 16,
        backgroundColor: "#f2f2f2",
        borderRadius: 10,
        marginBottom: 20,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: "#fff",
    },
    descriptionInput: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    formError: {
        color: "red",
        marginBottom: 12,
    },
});