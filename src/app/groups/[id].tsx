import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Button,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { apiRequest } from "../../services/api";

type ExpenseResponse = {
    id: number,
    groupId: number,
    creatorUsername: string,
    payerUsername: string,
    description: string,
    amount: number,
    currency: string,
    expenseDate: string,
    category: string,
    splitMethod: string,
    createdAt: string
};

export default function GroupDetailsScreen() {
    const { id, name } = useLocalSearchParams<{
        id: string;
        name?: string
    }>();

    const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const loadExpenses = useCallback(async () => {
        if (!id) {
            setError("Group is missing")
            setIsLoading(false);
            return;
        }
        setError("");
        setIsLoading(true);

        try {
            const data = await apiRequest<ExpenseResponse[]>(
                `/api/v1/groups/${id}/expenses`
            );
            setExpenses(data);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Could not load expenses."
            );
        } finally {
            setIsLoading(false);
        }
    }, [id]);
    useEffect(() => {

        void loadExpenses();
    }, [loadExpenses]);
    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading expenses...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error}</Text>
                <Button title="Try Again" onPress={loadExpenses} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{ title: name || "Group Details" }}
            />

            <FlatList
                data={expenses}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={styles.list}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                    <Text style={styles.empty}>
                        This group has no expenses yet.
                    </Text>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.expenseName}>
                            {item.description}
                        </Text>

                        <Text style={styles.amount}>
                            {item.amount.toFixed(2)} {item.currency}
                        </Text>

                        <Text>Paid by: {item.payerUsername}</Text>
                        <Text>Category: {item.category}</Text>
                        <Text>Date: {item.expenseDate}</Text>
                        <Text>Split: {item.splitMethod}</Text>
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
    list: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
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
    expenseName: {
        fontSize: 18,
        fontWeight: "bold",
    },
    amount: {
        fontSize: 17,
        color: "#2563eb",
        marginVertical: 6,
    },
});


