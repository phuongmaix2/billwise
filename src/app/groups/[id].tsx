import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Button,
    FlatList,
    StyleSheet,
    Text,
    View,
    TextInput,
} from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
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
    const [expenseDescription, setExpenseDescription] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [payerUsername, setPayerUsername] = useState("");
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
    const [category, setCategory] = useState<ExpenseCategory>("OTHER");
    const [expenseError, setExpenseError] = useState("");
    const [isCreatingExpense, setIsCreatingExpense] = useState(false);

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

            setPayerUsername((currentPayer) =>
                currentPayer || memberData[0]?.username || ""
            );

            setSelectedParticipants(
                memberData.map((member) => member.username)
            );

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

            setSelectedParticipants((currentParticipants) => [
                ...currentParticipants,
                newMember.username,
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

    const toggleParticipant = (username: string) => {
        setSelectedParticipants((currentParticipants) =>
            currentParticipants.includes(username)
                ? currentParticipants.filter(
                    (participant) => participant !== username
                )
                : [...currentParticipants, username]
        );
    };

    const createExpense = async () => {
        const description = expenseDescription.trim();
        const numericAmount = Number(
            expenseAmount.replace(",", ".")
        );

        if (!description) {
            setExpenseError("Enter an expense description.");
            return;
        }

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            setExpenseError("Enter a valid amount.");
            return;
        }

        if (!payerUsername) {
            setExpenseError("Select who paid.");
            return;
        }

        if (selectedParticipants.length === 0) {
            setExpenseError("Select at least one participant.");
            return;
        }

        if (!id) {
            setExpenseError("Group ID is missing.");
            return;
        }

        const today = new Date();
        const expenseDate = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, "0"),
            String(today.getDate()).padStart(2, "0"),
        ].join("-");

        setExpenseError("");
        setIsCreatingExpense(true);

        try {
            const newExpense = await apiRequest<ExpenseResponse>(
                `/api/v1/groups/${id}/expenses`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        payerUsernameOrEmail: payerUsername,
                        participantUsernamesOrEmails: selectedParticipants,
                        description,
                        amount: numericAmount,
                        currency: currency || "EUR",
                        expenseDate,
                        category,
                        splitMethod: "EQUAL",
                    }),
                }
            );

            setExpenses((currentExpenses) => [
                newExpense,
                ...currentExpenses,
            ]);

            setExpenseDescription("");
            setExpenseAmount("");
            setCategory("OTHER");
        } catch (error) {
            setExpenseError(
                error instanceof Error
                    ? error.message
                    : "Could not create expense."
            );
        } finally {
            setIsCreatingExpense(false);
        }
    };

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
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    <View>
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
                                <Text style={styles.memberError}>{memberError}</Text>
                            ) : null}

                            {isAddingMember ? (
                                <ActivityIndicator color="#2563eb" />
                            ) : (
                                <Button title="Add Member" onPress={addMember} />
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

                        <View style={styles.expenseForm}>
                            <Text style={styles.sectionTitle}>Add Expense</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Description"
                                value={expenseDescription}
                                onChangeText={setExpenseDescription}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder={`Amount (${currency || "EUR"})`}
                                keyboardType="decimal-pad"
                                value={expenseAmount}
                                onChangeText={setExpenseAmount}
                            />

                            <Text style={styles.label}>Paid by</Text>

                            {members.map((member) => (
                                <View key={member.userId} style={styles.optionButton}>
                                    <Button
                                        title={`${payerUsername === member.username ? "✓ " : ""}${member.username}`}
                                        onPress={() => setPayerUsername(member.username)}
                                    />
                                </View>
                            ))}

                            <Text style={styles.label}>Category</Text>

                            {categories.map((item) => (
                                <View key={item} style={styles.optionButton}>
                                    <Button
                                        title={`${category === item ? "✓ " : ""}${item}`}
                                        onPress={() => setCategory(item)}
                                    />
                                </View>
                            ))}

                            <Text style={styles.label}>Split between</Text>

                            {members.map((member) => (
                                <View key={member.userId} style={styles.optionButton}>
                                    <Button
                                        title={`${selectedParticipants.includes(member.username) ? "✓ " : ""}${member.username}`}
                                        onPress={() => toggleParticipant(member.username)}
                                    />
                                </View>
                            ))}

                            <Text style={styles.helper}>
                                {selectedParticipants.length} of {members.length} selected
                            </Text>

                            {expenseError ? (
                                <Text style={styles.memberError}>{expenseError}</Text>
                            ) : null}

                            {isCreatingExpense ? (
                                <ActivityIndicator color="#2563eb" />
                            ) : (
                                <Button title="Create Expense" onPress={createExpense} />
                            )}
                        </View>

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
    expenseForm: {
        padding: 14,
        backgroundColor: "#f2f2f2",
        borderRadius: 10,
        marginTop: 16,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 12,
        marginBottom: 8,
    },
    optionButton: {
        marginBottom: 6,
    },
    helper: {
        color: "#666",
        marginTop: 4,
        marginBottom: 12,
    },
});


