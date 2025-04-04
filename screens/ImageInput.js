import React, { useState } from "react";
import { View, Button, Image, StyleSheet, Alert, ActivityIndicator, Text } from "react-native";
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
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are an assistant that extracts text from images." },
            { role: "user", content: `Extract text from this image: data:image/jpeg;base64,${base64Image}` },
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

  return (
    <View style={styles.container}>
      <Button title="Open Gallery" onPress={openGallery} />
      <Button title="Open Camera" onPress={openCamera} />
      {photo && <Image source={{ uri: photo.uri }} style={styles.image} />}
      {photo && <Button title="Send Image to GPT" onPress={sendImageToGPT} />}
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {responseMessage ? <Text style={styles.text}>{responseMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: 200, height: 200, marginTop: 20 },
  text: { marginTop: 20, padding: 10, fontSize: 16, color: "black" },
});

export default TestGallery;