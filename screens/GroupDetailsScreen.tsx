import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    ScrollView,
    StyleSheet,
} from "react-native";


type Expense = {
    id: string;
    description: string;
    amount: number;
    paidBy: string;
    splitAmount: number;
    participants: string[];
};


export default function GroupDetailsScreen({ route }: any) {
    const { group } = route.params;

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);

    const [members, setMembers] = useState<string[]>([]);
    const [memberName, setMemberName] = useState("");
    const [participants, setParticipants] = useState<string[]>(members);

    const [paidBy, setPaidBy] = useState("");
    const [settlements, setSettlements] = useState<
        { from: string; to: string; amount: number }[]
    >([]);


    const addExpense = () => {
        const value = Number(amount);

        if (
            !description.trim() ||
            !amount.trim() ||
            !Number.isFinite(value) ||
            value <= 0 ||
            !paidBy ||
            participants.length === 0
        ) {
            return;
        }

        if (editingId) {
            setExpenses(expenses.map((expense) =>
                expense.id === editingId
                    ? {
                        ...expense,
                        description: description.trim(),
                        amount: value,
                        paidBy: paidBy,
                        splitAmount: value / participants.length,
                        participants: [...participants],
                    }
                    : expense
            ));
        } else {
            const newExpense = {
                id: Date.now().toString(),
                description: description.trim(),
                amount: value,
                paidBy: paidBy,
                splitAmount: value / participants.length,
                participants: [...participants],
            };

            setExpenses([...expenses, newExpense]);
        }

        setDescription("");
        setAmount("");
        setPaidBy("");
        setEditingId(null);
        setParticipants([...members]);
    };



    const deleteExpense = (id: string) => {
        setExpenses((currentExpenses) =>
            currentExpenses.filter((expense) => expense.id !== id)
        );
    };


    const total = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );


    const addMember = () => {
        const name = memberName.trim();

        if (!name || members.includes(name)) return;

        setMembers([...members, name]);
        setParticipants([...participants, name]);
        setMemberName("");
    };


    const calculateBalance = (member: string) => {
        let balance = 0;

        expenses.forEach((expense) => {
            if (expense.participants.includes(member)) {
                balance -= expense.splitAmount;
            }

            if (expense.paidBy === member) {
                balance += expense.amount;
            }
        });

        settlements.forEach((settlement) => {
            if (settlement.from === member) {
                balance += settlement.amount;
            }

            if (settlement.to === member) {
                balance -= settlement.amount;
            }
        });

        return balance;
    };




    const calculateDebts = () => {
        const creditors = members
            .map((name) => ({ name, balance: calculateBalance(name) }))
            .filter((person) => person.balance > 0.001);

        const debtors = members
            .map((name) => ({ name, balance: -calculateBalance(name) }))
            .filter((person) => person.balance > 0.001);

        const debts = [];

        for (const debtor of debtors) {
            for (const creditor of creditors) {
                const amount = Math.min(debtor.balance, creditor.balance);

                if (amount > 0.001) {
                    debts.push({
                        from: debtor.name,
                        to: creditor.name,
                        amount: amount,
                    });

                    debtor.balance -= amount;
                    creditor.balance -= amount;
                }
            }
        }

        return debts;
    };

    const editExpense = (expense: Expense) => {
        setEditingId(expense.id);
        setDescription(expense.description);
        setAmount(expense.amount.toString());
        setPaidBy(expense.paidBy);
        setParticipants(expense.participants);
    };


    const cancelEdit = () => {
        setEditingId(null);
        setDescription("");
        setAmount("");
        setPaidBy("");
        setParticipants([...members]);
    };


    const toggleParticipant = (member: string) => {
        if (participants.includes(member)) {
            setParticipants(participants.filter((p) => p !== member));
        } else {
            setParticipants([...participants, member]);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{group.name}</Text>

            <Text>{members.length} members</Text>

            <Text style={styles.subtitle}>Group Members</Text>

            <TextInput
                style={styles.input}
                placeholder="Member name"
                value={memberName}
                onChangeText={setMemberName}
            />

            <Button title="Add Member" onPress={addMember} />

            {members.map((member) => (
                <Text key={member} style={styles.member}>
                    {member}
                </Text>
            ))}

            {
                members.length > 0 &&
                (
                    <View>
                        <Text style={styles.subtitle}>Add Expense</Text>
                        <Text style={{ marginBottom: 10 }}>Paid by:</Text>

                        {members.map((member) => (
                            <Button
                                key={member}
                                title={`${paidBy === member ? "✓ " : ""}${member}`}
                                onPress={() => setPaidBy(member)}
                            />

                        ))};

                        <TextInput
                            style={styles.input}
                            placeholder="Description"
                            value={description}
                            onChangeText={setDescription}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Amount (€)"
                            keyboardType="decimal-pad"
                            value={amount}
                            onChangeText={setAmount}
                        />


                        <Button
                            title={editingId ? "Save Changes" : "Add Expense"}
                            onPress={addExpense}
                        />

                        {editingId !== null && (
                                <Button
                                    title="Cancel Edit"
                                    color="gray"
                                    onPress={cancelEdit}
                                />
                        )}

                        <Text style={styles.subtitle}>Split Between</Text>

                        {members.map((member) => (
                            <Button
                                key={member}
                                title={`${participants.includes(member) ? "✓ " : ""}${member}`}
                                onPress={() => toggleParticipant(member)}
                            />
                        ))}


                        <Text>
                            {participants.length} of {members.length} members selected
                        </Text>

                        {amount.trim() !== "" &&
                            Number.isFinite(Number(amount)) &&
                            Number(amount) > 0 &&
                            participants.length > 0 && (
                                <Text>
                                    Each person pays: €
                                    {(Number(amount) / participants.length).toFixed(2)}
                                </Text>
                            )}


                        <Text style={styles.subtitle}>Expenses</Text>
                    </View>
                )
            }

            {expenses.map((item) => (
                <View key={item.id} style={styles.card}>
                    <View>
                        <Text>{item.description} - €{item.amount.toFixed(2)}</Text>
                        <Text>Paid by: {item.paidBy}</Text>
                        <Text>Each person: €{item.splitAmount.toFixed(2)}</Text>
                        <Text>Split between: {item.participants.join(", ")}</Text>
                    </View>

                    <Button
                        title="Edit"
                        onPress={() => editExpense(item)}
                    />

                    <Button
                        title="Delete"
                        color="red"
                        onPress={() => deleteExpense(item.id)}
                    />
                </View>
            ))}

            {
                members.length > 0 &&
                (
                    <View>

                        <Text style={styles.subtitle}>Member Balances</Text>

                        {members.map((member) => (
                            <View key={member} style={styles.member}>
                                <Text>{member}</Text>
                                <Text>
                                    Balance: €{calculateBalance(member).toFixed(2)}
                                </Text>
                            </View>
                        ))}

                        <Text style={styles.subtitle}>Who Owes Whom</Text>
                        {calculateDebts().map((debt, index) => (
                            <View key={index} style={styles.member}>
                                <Text>
                                    {debt.from} owes {debt.to} €{debt.amount.toFixed(2)}
                                </Text>

                                <Button
                                    title="Settle"
                                    onPress={() => {
                                        setSettlements([
                                            ...settlements,
                                            {
                                                from: debt.from,
                                                to: debt.to,
                                                amount: debt.amount,
                                            },
                                        ]);
                                    }}
                                />
                            </View>
                        ))}
                        <Text style={styles.subtitle}>Settlement History</Text>

                        {settlements.length === 0 && (
                            <Text>No settlements yet.</Text>
                        )}

                        {settlements.map((settlement, index) => (
                            <View key={index} style={styles.member}>
                                <Text>
                                    {settlement.from} paid {settlement.to} €{settlement.amount.toFixed(2)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 25,
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    member: {
        fontSize: 16,
        padding: 10,
        backgroundColor: "#f2f2f2",
        marginTop: 8,
        borderRadius: 8,
    },
    card: {
        padding: 15,
        backgroundColor: "#f2f2f2",
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    total: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 15,
        marginBottom: 15,
    },
});
