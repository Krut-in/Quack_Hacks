import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const InputScreen = () => {
  const navigation = useNavigation();
  const [foodInput, setFoodInput] = useState('');

  // User details
  const userDetails = {
    height: "6'1\"",
    weight: "75 kg",
    age: 24,
    gender: "male"
  };

  let fakeOrders = {
    "uber-eats": [
      { id: 1, restaurant: "McDonald's", items: ["Big Mac", "Fries", "Coke"], total: 12.99, date: "2025-03-01" },
      { id: 2, restaurant: "KFC", items: ["Chicken Bucket", "Biscuits"], total: 15.49, date: "2025-03-05" },
      { id: 3, restaurant: "Starbucks", items: ["Caramel Macchiato", "Banana Bread"], total: 8.99, date: "2025-03-10" },
      { id: 4, restaurant: "Taco Bell", items: ["Crunchwrap Supreme", "Nachos"], total: 9.99, date: "2025-03-12" },
      { id: 5, restaurant: "Panda Express", items: ["Orange Chicken", "Fried Rice"], total: 10.49, date: "2025-03-15" },
    ],
  };

  const handleSubmit = async () => {
    if (!foodInput.trim()) {
      Alert.alert('Error', 'Please enter a valid food item.');
      return;
    }
  
    try {
      fakeOrders = JSON.stringify(fakeOrders); // Convert fake orders to JSON string
  
      const response = await fetch('http://localhost:3001/manual-nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Based on the food: "${foodInput}", and order history ${fakeOrders} user details (height: ${userDetails.height}, weight: ${userDetails.weight}, age: ${userDetails.age}, gender: ${userDetails.gender}), how much more protein, carbs, fiber, fat, vitamins, and minerals does the person need to fulfill his daily dietary requirements? We do not have any other information. Please give your answer with whatever we gave you. Assume things if not given. Return only the JSON array without any additional text or markdown.`
        })
      });
  
      const data = await response.json();
  
      // Ensure data is properly parsed
      let nutritionData;
      try {
        nutritionData = JSON.parse(data.responseText); // Parse JSON if it's returned as a string
      } catch (error) {
        console.error("Error parsing JSON:", error);
        Alert.alert("Error", "Invalid response format.");
        return;
      }
  
      // Navigate to ManualResult screen with parsed data
      navigation.navigate('ManualResult', { nutritionData });
  
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch dietary recommendations.');
    }
  };
  

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>

            {/* Images Side by Side */}
            <View style={styles.imageContainer}>
        <Image source={require('../assets/duck_img.png')} style={styles.image} />
        <Image source={require('../assets/manual_img2.png')} style={styles.image} />
      </View>

      {/* Instruction Text */}
      <Text style={styles.instructionText}>
        Please enter proper names with restaurant/home cooked (e.g., bean burrito from Taco Bell/tomato soup homecooked, not just burrito or soup)
      </Text>

      {/* Text Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your food item..."
        placeholderTextColor="#436c1c"
        value={foodInput}
        onChangeText={setFoodInput}
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>SUBMIT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e1edcd',
    padding: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
  },
  backText: {
    fontSize: 18,
    color: '#436c1c',
  },
  instructionText: {
    color: '#436c1c',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    width: '90%',
    height: 50,
    borderWidth: 1,
    borderColor: '#436c1c',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#436c1c',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#436c1c',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  submitButtonText: {
    color: 'yellow',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  image: {
    width: 120,
    height: 120,
    marginHorizontal: 10,
    borderRadius: 10,
  },
});

export default InputScreen;