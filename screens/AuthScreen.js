import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";

const SignInScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      {/* Speech Bubble and Duck */}
      <View style={styles.speechBubble}>
        <Text style={styles.speechText}>
          Welcome to the world of making healthy choices. {"\n"}Let’s get started...
        </Text>
      </View>
      <Image source={require("../assets/duck_img.png")} style={styles.duckImage} />

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#555"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#555"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Signup Section */}
      <Text style={styles.signupText}>Don’t have an account?</Text>
      <TouchableOpacity style={styles.signupButton} onPress={() => navigation.navigate("Profile")}>
        <Text style={styles.signupButtonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4D7", 
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  speechBubble: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 20,
    position: "absolute",
    top: 80,
    left: 40,
    right: 40,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  speechText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  duckImage: {
    width: 80,
    height: 80,
    position: "absolute",
    top: 140,
    right: 50,
  },
  input: {
    width: "90%",
    height: 40,
    backgroundColor: "white",
    marginVertical: 10,
    borderRadius: 5,
    paddingLeft: 10,
    borderWidth: 1,
    borderColor: "#999",
  },
  signupText: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
  },
  signupButton: {
    backgroundColor: "#6D9F60",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 10,
  },
  signupButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default SignInScreen;