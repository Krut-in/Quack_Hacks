import React, { useState } from "react";
import { View, Button, Image, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity, } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const TestGallery = () => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "We need access to your photo library to proceed.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "We need access to your camera to proceed.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const sendImageToGPT = async () => {
    if (!photo) {
      Alert.alert("No Image", "Please upload or capture an image first.");
      return;
    }

    setLoading(true);

    try {
      // Read the image file and encode it in Base64
      const base64Image = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send the Base64-encoded image to GPT
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer OPEN_AI_KEY`, // Replace with your OpenAI API key
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages:[
            {"role": "user", "content": [
                {"type": "text", "text": "Extract the following info from the image. Send only the info in json format. No other markdown or text. Food, calories, protein, fat, carbs, fiber with units. Don't put unit of particular category if not there"},
                {"type": "image_url", "image_url": {
                    "url": `data:image/png;base64,${base64Image}`                
                  }
                }
            ]}
        ],
        }),
      });

      const data = await response.json();
      setResponseMessage(data.choices[0].message.content);
    } catch (error) {
      console.error("Error sending image to GPT:", error);
      Alert.alert("Error", "Failed to send image to GPT.");
    } finally {
      setLoading(false);
    }
  };

  const CustomButton = ({ title, onPress }) => (
    <TouchableOpacity style={styles.header} onPress={onPress}>
      <Text style={{ color: "#fff", fontSize: 18 }}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
    <CustomButton title="Open Gallery" onPress={openGallery} />
    <CustomButton title="Open Camera" onPress={openCamera} />
    {photo && <Image source={{ uri: photo.uri }} style={styles.image} />}
    {photo && <CustomButton title="Send Image to GPT" onPress={sendImageToGPT} />}
    {loading && <ActivityIndicator size="large" color="#0000ff" />}
    {responseMessage ? <Text style={styles.text}>{responseMessage}</Text> : null}
  </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#d9e8b8", justifyContent: "center", alignItems: "center" },
  image: { width: 200, height: 200, marginTop: 20 },
  text: { marginTop: 20, padding: 10, fontSize: 16, color: "black" },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    backgroundColor: "#617a27",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
});



export default TestGallery;