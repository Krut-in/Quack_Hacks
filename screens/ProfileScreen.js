import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("");

  const savePreferences = async () => {
    const userPreferences = { age, gender, height, weight, activityLevel };
    await AsyncStorage.setItem("userPreferences", JSON.stringify(userPreferences));
    console.log("Preferences saved!");
  };

  return (
    <View>
      <Text>Age</Text>
      <TextInput value={age} onChangeText={setAge} keyboardType="numeric" />
      <Text>Gender</Text>
      <TextInput value={gender} onChangeText={setGender} />
      <Text>Height (cm)</Text>
      <TextInput value={height} onChangeText={setHeight} keyboardType="numeric" />
      <Text>Weight (kg)</Text>
      <TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" />
      <Text>Activity Level</Text>
      <TextInput value={activityLevel} onChangeText={setActivityLevel} />
      <Button title="Save Preferences" onPress={savePreferences} />
    </View>
  );
};

export default ProfileScreen;
