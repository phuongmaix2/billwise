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
type GroupMemberResponse = {
    userId: number;
    username: string;
    email: string;
    role: "OWNER" | "MEMBER";
    joinedAt: string;
};

export default function GroupDetailsScreen() {
    const { id, name } = useLocalSearchParams<{
        id: string;
        name?: string
    }>();

    const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [members, setMembers] = useState<GroupMemberResponse[]>([]);

    const loadGroupData = useCallback(async () => {
        if (!id) {
            setError("Group ID is missing.");
            setIsLoading(false);
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const [expenseData, memberData] = await Promise.all([
                apiRequest<ExpenseResponse[]>(
                    `/api/v1/groups/${id}/expenses`
                ),
                apiRequest<GroupMemberResponse[]>(
                    `/api/v1/groups/${id}/members`
                ),
            ]);

            setExpenses(expenseData);
            setMembers(memberData);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Could not load group data."
            );
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void loadGroupData();
    }, [loadGroupData]);

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading group...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error}</Text>
                <Button title="Try Again" onPress={loadGroupData} />
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
                ListHeaderComponent={
                    <View>
                        <Text style={styles.sectionTitle}>Members</Text>

                        {members.map((member) => (
                            <View key={member.userId} style={styles.member}>
                                <View>
                                    <Text style={styles.memberName}>
                                        {member.username}
                                    </Text>
                                    <Text style={styles.memberEmail}>
                                        {member.email}
                                    </Text>
                                </View>

                                <Text style={styles.role}>{member.role}</Text>
                            </View>
                        ))}

                        <Text style={styles.sectionTitle}>Expenses</Text>
                    </View>
                }
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 8,
        marginBottom: 12,
    },
    member: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 14,
        backgroundColor: "#eef4ff",
        borderRadius: 10,
        marginBottom: 10,
    },
    memberName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    role: {
        color: "#2563eb",
        fontWeight: "bold",
    },
    memberEmail: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
});


