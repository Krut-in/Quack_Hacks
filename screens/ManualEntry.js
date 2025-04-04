import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Vibration, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const InputScreen = () => {
  const navigation = useNavigation();
  const [foodEntries, setFoodEntries] = useState([{ food: '', source: '' }]);
  const [error, setError] = useState("");

  
  const userDetails = {
    height: "6'1\"",
    weight: "75 kg",
    age: 24,
    gender: "male"
  };

  const handleAddEntry = () => {
    setFoodEntries([...foodEntries, { food: '', source: '' }]);
  };

  const handleRemoveEntry = (index) => {
    if (foodEntries.length > 1) {
      setFoodEntries(foodEntries.filter((_, i) => i !== index));
    }
  };

  const handleChange = (index, field, value) => {
    const updatedEntries = [...foodEntries];
    updatedEntries[index][field] = value;
    setFoodEntries(updatedEntries);
  };

  // const handleSubmit = async () => {
  //   setError("");

  //   // Validation: Ensure all food items and sources are filled
  //   if (foodEntries.some(entry => !entry.food.trim() || !entry.source.trim())) {
  //     Vibration.vibrate(500);
  //     setError("Please fill in all required fields.");
  //     return;
  //   }

  //   try {
  //     const response = await fetch('http://localhost:3001/manual-nutrition', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ 
  //         prompt: `Based on the food entries: ${JSON.stringify(foodEntries)}, user details (height: ${userDetails.height}, weight: ${userDetails.weight}, age: ${userDetails.age}, gender: ${userDetails.gender}), how much more protein, carbs, fiber, fat, vitamins, and minerals does the person need?
  //         Return only the JSON array without any additional text or markdown. 
  //         Response should be similar to - [{"nutrient": "protein", "amount_needed": 100}, {"nutrient": "carbs", "amount_needed": 200}, {"nutrient": "fiber", "amount_needed": 300}, {"nutrient": "fat", "amount_needed": 400}, {"nutrient": "vitamins", "amount_needed": 500}, {"nutrient": "minerals", "amount_needed": 600}],
  //         If it is not a valid food item, please return 'not_found'.`,
  //       })
  //     });

  //     const data = await response.json();
  //     let nutritionData;
  //     try {
  //       if (data.responseText === "not_found") {
  //         setError("One or more food items not found.");
  //         return;
  //       }
        
  //       nutritionData = JSON.parse(data.responseText);
  //     } catch (error) {
  //       console.error("Error parsing JSON:", error);
  //       Alert.alert("Error", "Invalid response format.");
  //       return;
  //     }
  //     navigation.navigate('ManualResult', { nutritionData });
  //   } catch (error) {
  //     console.error(error);
  //     setError("Failed to fetch dietary recommendations.");
  //   }
  // };

  const handleSubmit = async () => {
    setError("");
  
    if (foodEntries.some(entry => !entry.food.trim() || !entry.source.trim())) {
      Vibration.vibrate(500);
      setError("Please fill in all required fields.");
      return;
    }
  
    try {
      const accessToken = await getFatSecretAccessToken(); // Fetch or cache access token
      let nutritionData = [];
  
      for (const entry of foodEntries) {
        // Step 1: Search for food item
        const searchResponse = await fetch(`https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${encodeURIComponent(entry.food)}&format=json`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
  
        const searchData = await searchResponse.json();
        if (!searchData.foods || !searchData.foods.food) {
          setError(`Food not found: ${entry.food}`);
          return;
        }
  
        const foodId = searchData.foods.food[0].food_id;
  
        // Step 2: Get detailed nutrition info
        const detailsResponse = await fetch(`https://platform.fatsecret.com/rest/server.api?method=food.get.v2&food_id=${foodId}&format=json`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
  
        const detailsData = await detailsResponse.json();
        if (!detailsData.food) {
          setError(`Could not fetch details for: ${entry.food}`);
          return;
        }
  
        const nutrients = detailsData.food.servings.serving; // Assuming first serving
        nutritionData.push({
          food: entry.food,
          calories: nutrients.calories,
          protein: nutrients.protein,
          carbs: nutrients.carbohydrate,
          fat: nutrients.fat,
          fiber: nutrients.fiber,
        });
      }
  
      // Navigate to results screen with fetched data
      navigation.navigate('ManualResult', { nutritionData });
  
    } catch (error) {
      console.error(error);
      setError("Failed to fetch dietary recommendations.");
    }
  };
  
  const getFatSecretAccessToken = async () => {
    
    const clientId = "58300473be5d49f48a5e1ad11a7a0239";
    const clientSecret = "be92c1ddd3634b3bbe5b612fafba5a0a";
  
    const authString = btoa(`${clientId}:${clientSecret}`);
  
    const response = await fetch('https://oauth.fatsecret.com/connect/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&scope=basic'
    });
  
    const data = await response.json();
    return data.access_token;
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        <Image source={require('../assets/duck_img.png')} style={styles.image} />
        <Image source={require('../assets/manual_img2.png')} style={styles.image} />
      </View>

      <Text style={styles.instructionText}>
        Enter multiple food items with sources (e.g., "Bean burrito from Taco Bell").
      </Text>

      {foodEntries.map((entry, index) => (
        <View key={index} style={styles.entryContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter food item..."
            placeholderTextColor="#436c1c"
            value={entry.food}
            onChangeText={(text) => handleChange(index, 'food', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Restaurant/Homecooked..."
            placeholderTextColor="#436c1c"
            value={entry.source}
            onChangeText={(text) => handleChange(index, 'source', text)}
          />
          {foodEntries.length > 1 && (
            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveEntry(index)}>
              <Text style={styles.removeButtonText}>❌</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={handleAddEntry}>
        <Text style={styles.addButtonText}>+ Add Another</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>SUBMIT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  entryContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
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
    marginBottom: 10,
  },
  removeButton: {
    position: 'absolute',
    right: 20,
    top: 10,
  },
  removeButtonText: {
    fontSize: 18,
    color: 'red',
  },
  addButton: {
    marginTop: 10,
    backgroundColor: '#436c1c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  errorText: {
    color: "#FF4444",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600", 
    backgroundColor: "#FFF0F0", 
    padding: 8,
    borderRadius: 8, 
  }
});

export default InputScreen;
