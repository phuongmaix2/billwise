import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    StyleSheet,
} from "react-native";

type Expense = {
    id: string;
    description: string;
    amount: number;
};

export default function GroupDetailsScreen({ route }: any) {
    const { group } = route.params;

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");

    const addExpense = () => {
        const value = Number(amount);

        if (!description.trim() || !amount.trim() || !Number.isFinite(value) || value <= 0) {
            return;
        }

        const newExpense = {
            id: Date.now().toString(),
            description: description.trim(),
            amount: value,
        };

        setExpenses([...expenses, newExpense]);
        setDescription("");
        setAmount("");
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

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{group.name}</Text>
            <Text>{group.members} members</Text>

            <Text style={styles.subtitle}>Add Expense</Text>

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


            <FlatList
                data={expenses}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text>No expenses yet.</Text>}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View>
                            <Text>{item.description}</Text>
                            <Text>€{item.amount.toFixed(2)}</Text>
                        </View>

                        <Button
                            title="Delete"
                            color="red"
                            onPress={() => deleteExpense(item.id)}
                        />
                    </View>
                )}
            />


            <Text style={styles.total}>
                Total: €{total.toFixed(2)}
            </Text>
        </View>
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
