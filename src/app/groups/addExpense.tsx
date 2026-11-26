import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    router,
    Stack,
    useLocalSearchParams,
} from "expo-router";

import { apiRequest } from "../../services/api";

type GroupMemberResponse = {
    userId: number;
    username: string;
    email: string;
    role: "OWNER" | "MEMBER";
    joinedAt: string;
};

type ExpenseResponse = {
    id: number;
    groupId: number;
    creatorUsername: string;
    payerUsername: string;
    description: string;
    amount: number;
    currency: string;
    expenseDate: string;
    category: string;
    splitMethod: string;
    createdAt: string;
};

type ExpenseCategory =
    | "FOOD"
    | "TRANSPORT"
    | "HOUSING"
    | "SHOPPING"
    | "ENTERTAINMENT"
    | "OTHER";

const categories: ExpenseCategory[] = [
    "FOOD",
    "TRANSPORT",
    "HOUSING",
    "SHOPPING",
    "ENTERTAINMENT",
    "OTHER",
];

export default function AddExpenseScreen() {
    const { id, name, currency } = useLocalSearchParams<{
        id: string;
        name?: string;
        currency?: string;
    }>();

    const [members, setMembers] = useState<GroupMemberResponse[]>([]);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [payerUsername, setPayerUsername] = useState("");
    const [participants, setParticipants] = useState<string[]>([]);
    const [category, setCategory] =
        useState<ExpenseCategory>("OTHER");
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState("");

    const loadMembers = useCallback(async () => {
        if (!id) {
            setError("Group ID is missing.");
            setIsLoading(false);
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const data = await apiRequest<GroupMemberResponse[]>(
                `/api/v1/groups/${id}/members`
            );

            setMembers(data);
            setPayerUsername(data[0]?.username || "");
            setParticipants(
                data.map((member) => member.username)
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Could not load members."
            );
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void loadMembers();
    }, [loadMembers]);

    const toggleParticipant = (username: string) => {
        setParticipants((currentParticipants) =>
            currentParticipants.includes(username)
                ? currentParticipants.filter(
                    (participant) => participant !== username
                )
                : [...currentParticipants, username]
        );
    };

    const createExpense = async () => {
        const trimmedDescription = description.trim();
        const numericAmount = Number(amount.replace(",", "."));

        if (!trimmedDescription) {
            setError("Enter an expense description.");
            return;
        }

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            setError("Enter a valid amount.");
            return;
        }

        if (!payerUsername) {
            setError("Select who paid.");
            return;
        }

        if (participants.length === 0) {
            setError("Select at least one participant.");
            return;
        }

        if (!id) {
            setError("Group ID is missing.");
            return;
        }

        const today = new Date();

        const expenseDate = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0"),
        ].join("-");

        setError("");
        setIsCreating(true);

        try {
            await apiRequest<ExpenseResponse>(
                `/api/v1/groups/${id}/expenses`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        payerUsernameOrEmail: payerUsername,
                        participantUsernamesOrEmails: participants,
                        description: trimmedDescription,
                        amount: numericAmount,
                        currency: currency || "EUR",
                        expenseDate,
                        category,
                        splitMethod: "EQUAL",
                    }),
                }
            );

            router.back();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Could not create expense."
            );
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <Stack.Screen options={{ title: "Add Expense" }} />
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading members...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            contentInsetAdjustmentBehavior="automatic"
            keyboardShouldPersistTaps="handled"
        >
            <Stack.Screen options={{ title: "Add Expense" }} />

            <Text style={styles.groupName}>{name}</Text>
            <Text style={styles.currency}>
                Currency: {currency || "EUR"}
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
            />

            <TextInput
                style={styles.input}
                placeholder={`Amount (${currency || "EUR"})`}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
            />

            <Text style={styles.label}>Paid by</Text>

            {members.map((member) => (
                <View key={member.userId} style={styles.option}>
                    <Button
                        title={`${payerUsername === member.username ? "✓ " : ""}${member.username}`}
                        onPress={() => setPayerUsername(member.username)}
                    />
                </View>
            ))}

            <Text style={styles.label}>Category</Text>

            {categories.map((item) => (
                <View key={item} style={styles.option}>
                    <Button
                        title={`${category === item ? "✓ " : ""}${item}`}
                        onPress={() => setCategory(item)}
                    />
                </View>
            ))}

            <Text style={styles.label}>Split between</Text>

            {members.map((member) => (
                <View key={member.userId} style={styles.option}>
                    <Button
                        title={`${participants.includes(member.username) ? "✓ " : ""}${member.username}`}
                        onPress={() => toggleParticipant(member.username)}
                    />
                </View>
            ))}

            <Text style={styles.helper}>
                {participants.length} of {members.length} selected
            </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {isCreating ? (
                <ActivityIndicator size="large" color="#2563eb" />
            ) : (
                <Button title="Create Expense" onPress={createExpense} />
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
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    loadingText: {
        marginTop: 12,
    },
    groupName: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 4,
    },
    currency: {
        color: "#666",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: "#fff",
    },
    label: {
        fontSize: 17,
        fontWeight: "bold",
        marginTop: 12,
        marginBottom: 8,
    },
    option: {
        marginBottom: 6,
    },
    helper: {
        color: "#666",
        marginTop: 4,
        marginBottom: 12,
    },
    error: {
        color: "red",
        marginBottom: 12,
    },
});