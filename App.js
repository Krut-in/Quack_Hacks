import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AuthScreen from "./screens/AuthScreen";
import ProfileScreen from "./screens/ProfileScreen";
import OrderHistory from "./screens/OrderHistory";
import OrdersFetch from "./screens/OrdersFetch";
import ReportScreen from "./screens/ReportScreen";
import Options from "./screens/Options";
import ImageInput from "./screens/ImageInput";
import ManualEntry from "./screens/ManualEntry";
import ManualResult from "./screens/ManualResult";
import SignUpScreen from "./screens/SignUpScreen.js";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="AuthScreen" component={AuthScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="OrderHistory" component={OrderHistory} />
        <Stack.Screen name="OrdersFetch" component={OrdersFetch} />
        <Stack.Screen name="ReportScreen" component={ReportScreen} />
        <Stack.Screen name="Options" component={Options} />
        <Stack.Screen name="ImageInput" component={ImageInput} />
        <Stack.Screen name="ManualEntry" component={ManualEntry} />
        <Stack.Screen name="ManualResult" component={ManualResult} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
