import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import GroupsScreen from "./screens/GroupsScreen";
import GroupDetailsScreen from "./screens/GroupDetailsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Groups"
          component={GroupsScreen}
          options={{ title: "BillWise" }}
        />

        <Stack.Screen
          name="GroupDetails"
          component={GroupDetailsScreen}
          options={{ title: "Group Details" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
