import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Vibration
} from "react-native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "../firebaseConfig.js";

const auth = getAuth(app);
const db = getFirestore(app);

const SignUpScreen = ({ navigation }) => {
  const genders = ["Male", "Female", "Other"];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dobMonth: "",
    dobYear: "",
    gender: "",
    weight: "",
    heightFeet: "",
    heightInch: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    setLoading(true);
    setError("");

    // Validation checks
    if (!Object.values(formData).every(field => field.trim())) {
      Vibration.vibrate(500);
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Numeric validation
    if (
      isNaN(formData.weight) ||
      isNaN(formData.heightFeet) ||
      isNaN(formData.heightInch)
    ) {
      Vibration.vibrate(500);
      setError("Please enter valid numbers for weight/height");
      setLoading(false);
      return;
    }

    // Date validation
    const month = parseInt(formData.dobMonth);
    const year = parseInt(formData.dobYear);
    if (
      month < 1 ||
      month > 12 ||
      year < 1900 ||
      year > new Date().getFullYear()
    ) {
      Vibration.vibrate(500);
      setError("Invalid date of birth");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Vibration.vibrate(500);
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      Vibration.vibrate(500);
      setError("Invalid email format");
      setLoading(false);
      return;
    }

    try {
      // Create Firebase auth user

      console.log("Let's try");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Prepare user data for Firestore
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: `${formData.dobMonth}/${formData.dobYear}`,
        gender: formData.gender,
        weight: parseFloat(formData.weight),
        height: {
          feet: parseInt(formData.heightFeet),
          inches: parseInt(formData.heightInch),
        },
        email: formData.email,
        createdAt: new Date(),
      };

      // Save additional user data to Firestore

      console.log("Data ready to gooo");

      await setDoc(doc(db, "users", userCredential.user.uid), userData);
      console.log("Data gooed");

      navigation.navigate("AuthScreen");
    } catch (error) {
      Vibration.vibrate(500);
      // handleSignupError(error);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = email => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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
          <ScrollView contentContainerStyle={styles.container}>
            {/* Profile Icon */}
            <Image
              source={require("../assets/propic.png")}
              style={styles.profileIcon}
            />

            {/* Personal Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <View style={styles.nameContainer}>
                <TextInput
                  placeholder="First Name"
                  style={[styles.input, styles.halfInput]}
                  value={formData.firstName}
                  onChangeText={text => handleChange("firstName", text)}
                />
                <TextInput
                  placeholder="Last Name"
                  style={[styles.input, styles.halfInput]}
                  value={formData.lastName}
                  onChangeText={text => handleChange("lastName", text)}
                />
              </View>

              <View style={styles.dobContainer}>
                <TextInput
                  placeholder="MM"
                  style={[styles.input, styles.dobInput]}
                  keyboardType="numeric"
                  value={formData.dobMonth}
                  onChangeText={text => handleChange("dobMonth", text)}
                />
                <TextInput
                  placeholder="YYYY"
                  style={[styles.input, styles.dobInput]}
                  keyboardType="numeric"
                  value={formData.dobYear}
                  onChangeText={text => handleChange("dobYear", text)}
                />
              </View>

              <View style={styles.genderContainer}>
                {genders.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.genderButton,
                      formData.gender === option && styles.selectedGender,
                    ]}
                    onPress={() => handleChange("gender", option)}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        formData.gender === option && styles.selectedGenderText,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Physical Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Physical Information</Text>

              <View style={styles.measurementContainer}>
                <TextInput
                  placeholder="Weight (kg)"
                  style={[styles.input, styles.measurementInput]}
                  keyboardType="numeric"
                  value={formData.weight}
                  onChangeText={text => handleChange("weight", text)}
                />
                <View style={styles.heightContainer}>
                  <TextInput
                    placeholder="Feet"
                    style={[styles.input, styles.heightInput]}
                    keyboardType="numeric"
                    value={formData.heightFeet}
                    onChangeText={text => handleChange("heightFeet", text)}
                  />
                  <TextInput
                    placeholder="Inches"
                    style={[styles.input, styles.heightInput]}
                    keyboardType="numeric"
                    value={formData.heightInch}
                    onChangeText={text => handleChange("heightInch", text)}
                  />
                </View>
              </View>
            </View>

            {/* Account Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Information</Text>
              <TextInput
                placeholder="Email Address"
                style={styles.input}
                value={formData.email}
                onChangeText={text => handleChange("email", text)}
                keyboardType="email-address"
              />
              <TextInput
                placeholder="Password"
                style={styles.input}
                secureTextEntry
                value={formData.password}
                onChangeText={text => handleChange("password", text)}
              />
              <TextInput
                placeholder="Confirm Password"
                style={styles.input}
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={text => handleChange("confirmPassword", text)}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Buttons */}
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={handleSignUp}
            >
              <Text style={styles.signUpButtonText}>{loading ? "Creating..." : "Create Account"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.signInButtonText}>
                Already have an account? Sign In
              </Text>
            </TouchableOpacity>
          </ScrollView>
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
    paddingTop: 40,
  },
  errorText: {
    color: "#FF4444",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600",
    backgroundColor: "#FFF0F0",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#6D9F60",
    alignSelf: "center",
    marginBottom: 30,
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A7C59",
    marginBottom: 15,
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  dobContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dobInput: {
    width: "30%",
    textAlign: "center",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  genderButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    backgroundColor: "#F8F8F8",
  },
  selectedGender: {
    backgroundColor: "#6D9F60",
    borderColor: "#6D9F60",
  },
  genderText: {
    color: "#666",
    fontWeight: "500",
  },
  selectedGenderText: {
    color: "white",
  },
  measurementContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  measurementInput: {
    width: "48%",
  },
  heightContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "48%",
  },
  heightInput: {
    width: "48%",
  },
  input: {
    backgroundColor: "#FFF",
    padding: 14,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    fontSize: 16,
  },
  signUpButton: {
    backgroundColor: "#6D9F60",
    padding: 16,
    borderRadius: 12,
    marginVertical: 15,
  },
  signUpButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  signInButton: {
    padding: 10,
    marginBottom: 20,
  },
  signInButtonText: {
    color: "#6D9F60",
    fontWeight: "600",
    textAlign: "center",
    textDecorationLine: "underline",
    fontSize: 16,
  },
});

export default SignUpScreen;
