import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{ title: "BillWise" }}
            />
            <Stack.Screen
                name="groups/index"
                options={{ title: "My Groups" }}
            />
            <Stack.Screen
                name="groups/[id]"
                options={{ title: "Group Details" }}
            />
            <Stack.Screen
                name="groups/add-expense"
                options={{ title: "Add Expense" }}
            />
        </Stack>
    );
}