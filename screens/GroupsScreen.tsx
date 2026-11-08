
import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { groups as initialGroups } from "../data/mockData";


export default function GroupsScreen({ navigation }: any) {
    const [groups, setGroups] = useState(initialGroups);
    const [groupName, setGroupName] = useState("");

    const addGroup = () => {
        if (groupName.trim() === "") return;

        const newGroup = {
            id: Date.now().toString(),
            name: groupName.trim(),
            members: 1,
        };

        setGroups([...groups, newGroup]);
        setGroupName("");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Groups</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter group name"
                value={groupName}
                onChangeText={setGroupName}
            />

            <Button title="Add Group" onPress={addGroup} />

            <FlatList
                style={styles.list}
                data={groups}
                keyExtractor={(item) => item.id}

                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() =>
                            navigation.navigate("GroupDetails", { group: item })
                        }
                    >
                        <Text style={styles.groupName}>{item.name}</Text>
                        <Text>{item.members} members</Text>
                    </TouchableOpacity>
                )}

            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    list: {
        marginTop: 20,
    },
    card: {
        padding: 20,
        backgroundColor: "#f2f2f2",
        borderRadius: 10,
        marginBottom: 12,
    },
    groupName: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
});
