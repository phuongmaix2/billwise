import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Button,
    FlatList,
    StyleSheet,
    Text,
    View,
    TextInput,
} from "react-native";
import { Stack, useLocalSearchParams, router, useFocusEffect } from "expo-router";
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
type BalanceResponse = {
    userId: number;
    username: string;
    balance: number;
};

type SpendingReportItem = {
    label: string;
    total: number;
};

type GroupTab = "EXPENSES" | "SUMMARY";

export default function GroupDetailsScreen() {
    const { id, name, currency } = useLocalSearchParams<{
        id: string;
        name?: string;
        currency?: string;
    }>();

    const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [members, setMembers] = useState<GroupMemberResponse[]>([]);
    const [memberIdentifier, setMemberIdentifier] = useState("");
    const [memberError, setMemberError] = useState("");
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [balances, setBalances] = useState<BalanceResponse[]>([]);
    const [spending, setSpending] = useState<SpendingReportItem[]>([]);
    const [activeTab, setActiveTab] =
        useState<GroupTab>("EXPENSES");

    const loadGroupData = useCallback(async () => {
        if (!id) {
            setError("Group ID is missing.");
            setIsLoading(false);
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const [
                expenseData,
                memberData,
                balanceData,
                spendingData,
            ] = await Promise.all([
                apiRequest<ExpenseResponse[]>(
                    `/api/v1/groups/${id}/expenses`
                ),
                apiRequest<GroupMemberResponse[]>(
                    `/api/v1/groups/${id}/members`
                ),
                apiRequest<BalanceResponse[]>(
                    `/api/v1/groups/${id}/balances`
                ),
                apiRequest<SpendingReportItem[]>(
                    `/api/v1/groups/${id}/reports/spending`
                ),
            ]);

            setExpenses(expenseData);
            setMembers(memberData);
            setBalances(balanceData);
            setSpending(spendingData);

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

    const addMember = async () => {
        const value = memberIdentifier.trim();

        if (!value) {
            setMemberError("Enter a username or email.");
            return;
        }

        if (!id) {
            setMemberError("Group ID is missing.");
            return;
        }

        setMemberError("");
        setIsAddingMember(true);

        try {
            const newMember = await apiRequest<GroupMemberResponse>(
                `/api/v1/groups/${id}/members`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        usernameOrEmail: value,
                    }),
                }
            );

            setMembers((currentMembers) => [
                ...currentMembers,
                newMember,
            ]);

            setMemberIdentifier("");
        } catch (error) {
            setMemberError(
                error instanceof Error
                    ? error.message
                    : "Could not add member."
            );
        } finally {
            setIsAddingMember(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            void loadGroupData();
        }, [loadGroupData])
    );

    const totalExpenses = expenses.reduce(
        (total, expense) => total + Number(expense.amount),
        0
    );

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
                data={activeTab === "EXPENSES" ? expenses : []}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={styles.list}
                keyExtractor={(item) => item.id.toString()}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    <View>
                        <View style={styles.tabs}>
                            <View style={styles.tabButton}>
                                <Button
                                    title="Expenses"
                                    color={
                                        activeTab === "EXPENSES"
                                            ? "#2563eb"
                                            : "#777"
                                    }
                                    onPress={() => setActiveTab("EXPENSES")}
                                />
                            </View>

                            <View style={styles.tabButton}>
                                <Button
                                    title="Summary"
                                    color={
                                        activeTab === "SUMMARY"
                                            ? "#2563eb"
                                            : "#777"
                                    }
                                    onPress={() => setActiveTab("SUMMARY")}
                                />
                            </View>
                        </View>

                        {activeTab === "EXPENSES" ? (
                            <>
                                <Text style={styles.sectionTitle}>Members</Text>

                                <View style={styles.memberForm}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Username or email"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        value={memberIdentifier}
                                        onChangeText={setMemberIdentifier}
                                    />

                                    {memberError ? (
                                        <Text style={styles.memberError}>
                                            {memberError}
                                        </Text>
                                    ) : null}

                                    {isAddingMember ? (
                                        <ActivityIndicator color="#2563eb" />
                                    ) : (
                                        <Button
                                            title="Add Member"
                                            onPress={addMember}
                                        />
                                    )}
                                </View>

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

                                <Button
                                    title="+ Add Expense"
                                    onPress={() =>
                                        router.push({
                                            pathname: "/groups/addExpense",
                                            params: {
                                                id,
                                                name: name || "",
                                                currency: currency || "EUR",
                                            },
                                        })
                                    }
                                />

                                <Text style={styles.sectionTitle}>Expenses</Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.sectionTitle}>
                                    Member Balances
                                </Text>

                                {balances.map((balance) => {
                                    const value = Number(balance.balance);

                                    return (
                                        <View
                                            key={balance.userId}
                                            style={styles.summaryCard}
                                        >
                                            <Text style={styles.summaryName}>
                                                {balance.username}
                                            </Text>

                                            <Text
                                                style={[
                                                    styles.balance,
                                                    value < 0
                                                        ? styles.negative
                                                        : styles.positive,
                                                ]}
                                            >
                                                {value > 0 ? "+" : ""}
                                                {value.toFixed(2)} {currency || "EUR"}
                                            </Text>
                                        </View>
                                    );
                                })}

                                <Text style={styles.sectionTitle}>
                                    Spending by Category
                                </Text>

                                {spending.length === 0 ? (
                                    <Text style={styles.empty}>
                                        No spending data yet.
                                    </Text>
                                ) : (
                                    spending.map((item) => (
                                        <View
                                            key={item.label}
                                            style={styles.summaryCard}
                                        >
                                            <Text style={styles.summaryName}>
                                                {item.label}
                                            </Text>

                                            <Text>
                                                {Number(item.total).toFixed(2)}{" "}
                                                {currency || "EUR"}
                                            </Text>
                                        </View>
                                    ))
                                )}

                                <View style={styles.totalCard}>
                                    <Text style={styles.totalText}>
                                        Total Expenses
                                    </Text>
                                    <Text style={styles.totalText}>
                                        {totalExpenses.toFixed(2)}{" "}
                                        {currency || "EUR"}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                }
                ListEmptyComponent={
                    activeTab === "EXPENSES" ? (
                        <Text style={styles.empty}>
                            This group has no expenses yet.
                        </Text>
                    ) : undefined
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
    memberForm: {
        padding: 14,
        backgroundColor: "#f2f2f2",
        borderRadius: 10,
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        backgroundColor: "#fff",
        marginBottom: 10,
    },
    memberError: {
        color: "red",
        marginBottom: 10,
    },
    tabs: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 16,
    },
    tabButton: {
        flex: 1,
    },
    summaryCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 14,
        backgroundColor: "#f2f2f2",
        borderRadius: 10,
        marginBottom: 10,
    },
    summaryName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    balance: {
        fontWeight: "bold",
    },
    positive: {
        color: "green",
    },
    negative: {
        color: "red",
    },
    totalCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "#dbeafe",
        borderRadius: 10,
        marginTop: 12,
    },
    totalText: {
        fontSize: 17,
        fontWeight: "bold",
    },
});


