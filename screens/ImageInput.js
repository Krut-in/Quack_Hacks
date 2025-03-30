import React, { useState } from "react";
import { View, Button, Image, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { launchCamera } from "react-native-image-picker";

const CameraScreen = () => {
  const [photo, setPhoto] = useState(null);
  const navigation = useNavigation();

  const openCamera = () => {
    launchCamera({ mediaType: "photo", saveToPhotos: true }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setPhoto(response.assets[0]);
      }
    });
  };

  const handleSubmit = async () => {
    if (!photo) return;

    const prompt = "Extract details from this food image.";
    const formData = new FormData();
    formData.append("image", {
      uri: photo.uri,
      name: "photo.jpg",
      type: "image/jpeg",
    });
    formData.append("prompt", prompt);

    try {
      const response = await fetch("YOUR_BACKEND_API", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const result = await response.json();
      console.log("GPT Response:", result);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {photo ? (
        <Image source={{ uri: photo.uri }} style={styles.preview} />
      ) : (
        <Button title="Open Camera" onPress={openCamera} />
      )}

      {photo && (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e1edcd",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 10,
  },
  backText: {
    fontSize: 16,
    color: "#436c1c",
  },
  preview: {
    width: 300,
    height: 400,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#436c1c",
    padding: 12,
    borderRadius: 8,
  },
  submitText: {
    color: "yellow",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CameraScreen;