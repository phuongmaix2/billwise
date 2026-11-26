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
        </Stack>
    );
}