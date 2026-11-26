import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Button,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { apiRequest } from "../../services/api";

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

    useEffect(() => {
        void loadGroups();
    }, [loadGroups]);

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
            <FlatList
                data={groups}
                contentContainerStyle={styles.list}
                keyExtractor={(item) => item.id.toString()}
                contentInsetAdjustmentBehavior="automatic"
                ListEmptyComponent={
                    <Text style={styles.empty}>You have no groups yet.</Text>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.groupName}>{item.name}</Text>

                        {item.description ? (
                            <Text style={styles.description}>
                                {item.description}
                            </Text>
                        ) : null}

                        <Text>Currency: {item.baseCurrency}</Text>
                        <Text>Owner: {item.ownerUsername}</Text>
                    </View>
                )}
            />
        </View>
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
});