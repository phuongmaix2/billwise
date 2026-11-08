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
};


export default function GroupDetailsScreen({ route }: any) {
    const { group } = route.params;

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");

    const [members, setMembers] = useState<string[]>([]);
    const [memberName, setMemberName] = useState("");

    const [paidBy, setPaidBy] = useState("");
    const [settlements, setSettlements] = useState<
        { from: string; to: string; amount: number }[]
    >([]);

    const addExpense = () => {
        const value = Number(amount);

        if (!description.trim() || value <= 0 || !paidBy || members.length === 0) {
            return;
        }

        const newExpense = {
            id: Date.now().toString(),
            description: description,
            amount: value,
            paidBy: paidBy,
            splitAmount: value / members.length,
        };

        setExpenses([...expenses, newExpense]);
        setDescription("");
        setAmount("");
        setPaidBy("");
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

        if (!name) return;

        if (members.some((member) =>
            member.toLowerCase() === name.toLowerCase()
        )) return;

        setMembers([...members, name]);
        setMemberName("");
    };



    const calculateBalance = (member: string) => {
        let balance = 0;

        expenses.forEach((expense) => {
            balance -= expense.splitAmount;

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

                        <Button title="Add Expense" onPress={addExpense} />

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
                    </View>

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
