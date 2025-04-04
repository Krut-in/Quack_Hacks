import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Vibration
} from "react-native";

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebaseConfig.js";

const auth = getAuth(app);


const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    if (email.length > 0) setEmailError(false);
  }, [email]);

  useEffect(() => {
    if (password.length > 0) setPasswordError(false);
  }, [password]);

  const handleSignIn = async () => {
    const isEmailEmpty = !email.trim();
    const isPasswordEmpty = !password.trim();

    setEmailError(isEmailEmpty);
    setPasswordError(isPasswordEmpty);

    if (isEmailEmpty || isPasswordEmpty) {
      Vibration.vibrate(500);
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Successful login
      navigation.navigate("Options");
      // navigation.navigate("Profile");
    } catch (error) {
      Vibration.vibrate(500);
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = error => {
    switch (error.code) {
      case "auth/user-not-found":
        setError("No account found with this email");
        break;
      case "auth/wrong-password":
        setError("Incorrect password");
        break;
      case "auth/invalid-email":
        setError("Invalid email format");
        break;
      case "auth/too-many-requests":
        setError("Too many attempts. Try again later");
        break;
      default:
        setError("Login failed. Please try again");
        console.error("Login error:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            {/* Speech Bubble and Ducks */}
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>
                Welcome to the world of making healthy choices{"\n"}
                Let's get started...
              </Text>
            </View>

            <Image
              source={require("../assets/duck_img.png")}
              style={styles.duckImage}
            />
            <Image
              source={require("../assets/duck_img.png")}
              style={[styles.duckImage, styles.leftDuck]}
            />

            {/* Input Section */}
            <View style={styles.formContainer}>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#666"
                style={[styles.input, emailError && styles.errorInput]}
                onFocus={() => setEmailError(false)}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#666"
                style={[styles.input, passwordError && styles.errorInput]}
                onFocus={() => setPasswordError(false)}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={[styles.signInButton, loading && styles.disabledButton]}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={styles.signInButtonText}>
                {loading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={() => navigation.navigate("SignUp")}
            >
              <Text style={styles.createAccountButtonText}>
                New here? Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#E6F4D7",
    padding: 25,
    paddingTop: 100,
  },
  errorInput: {
    borderColor: "#FF4444",
    backgroundColor: "#FFF0F0",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  speechBubble: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    marginBottom: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  speechText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A7C59",
    textAlign: "center",
    lineHeight: 24,
  },
  duckImage: {
    width: 100,
    height: 100,
    position: "absolute",
    top: 160,
    right: 30,
    transform: [{ rotate: "30deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftDuck: {
    left: 30,
    transform: [{ rotate: "-30deg" }, { scaleX: -1 }],
  },
  formContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    backgroundColor: "#FFF",
    padding: 14,
    marginVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    fontSize: 16,
    color: "#333",
  },
  signInButton: {
    backgroundColor: "#6D9F60",
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  createAccountButton: {
    padding: 14,
    marginTop: 15,
  },
  createAccountButtonText: {
    color: "#6D9F60",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  // Update error text style
  errorText: {
    color: "#FF4444",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600", // Added
    backgroundColor: "#FFF0F0", // Added
    padding: 8, // Added
    borderRadius: 8, // Added
  },
});

export default SignInScreen;
