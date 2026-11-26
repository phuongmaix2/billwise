import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function AddExpenseScreen() {
    const { id, name, currency } = useLocalSearchParams<{
        id: string;
        name?: string;
        currency?: string;
    }>();

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            contentInsetAdjustmentBehavior="automatic"
        >
            <Stack.Screen options={{ title: "Add Expense" }} />

            <Text>Group: {name}</Text>
            <Text>Group ID: {id}</Text>
            <Text>Currency: {currency || "EUR"}</Text>
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
});