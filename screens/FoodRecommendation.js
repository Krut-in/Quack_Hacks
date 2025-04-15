import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import axios from 'axios';
import { app } from '../firebaseConfig';

const auth = getAuth(app);
const db = getFirestore(app);

const FoodRecommendation = () => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(''); // State to store recommendations
  const [header, setHeader] = useState(''); // State to store the header (e.g., "Nearby Restaurants" or "Recipes")

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not logged in.');
        return null;
      }

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        Alert.alert('Error', 'User details not found.');
        return null;
      }

      return userDoc.data();
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to fetch user data.');
      return null;
    }
  };

  const fetchRecommendationsFromGPT = async (prompt) => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a nutritionist and location expert.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer sk-API-KEY`, // Replace with your OpenAI API key
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error fetching recommendations from GPT:', error);
      return 'Failed to fetch recommendations.';
    }
  };

  const handleSearchRestaurants = async () => {
    setLoading(true);
    setHeader('Nearby Restaurants');
    setRecommendations(''); // Clear previous recommendations

    try {
      const userData = await fetchUserData();
      if (!userData) return;

      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setRecommendations('Location permission is required to find nearby restaurants.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // GPT prompt for restaurant recommendations
      const prompt = `
        Based on the following user details, recommend restaurants nearby (${latitude}, ${longitude}) that meet their nutritional needs:
        - Age: ${userData.age}
        - Gender: ${userData.gender}
        - Weight: ${userData.weight} kg
        - Height: ${userData.height.feet} feet ${userData.height.inches} inches
        - Activity Level: Moderate
        Provide only a list of restaurants with their names and the type of food they serve. dont include bold text format and location coordinates.
      `;

      const recommendations = await fetchRecommendationsFromGPT(prompt);
      setRecommendations(recommendations);
    } catch (error) {
      console.error('Error searching restaurants:', error);
      setRecommendations('Failed to fetch recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchRecipes = async () => {
    setLoading(true);
    setHeader('Recipes to Make at Home');
    setRecommendations(''); // Clear previous recommendations

    try {
      const userData = await fetchUserData();
      if (!userData) return;

      // GPT prompt for recipe recommendations
      const prompt = `
        Based on the following user details, suggest recipes to cook at home that meet their nutritional needs:
        - Age: ${userData.age}
        - Gender: ${userData.gender}
        - Weight: ${userData.weight} kg
        - Height: ${userData.height.feet} feet ${userData.height.inches} inches
        - Activity Level: Moderate
        Provide a list of recipes directly with their names, ingredients, and preparation steps.dont include bold or any other text styles.
      `;

      const recommendations = await fetchRecommendationsFromGPT(prompt);
      setRecommendations(recommendations);
    } catch (error) {
      console.error('Error searching recipes:', error);
      setRecommendations('Failed to fetch recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Food Recommendations</Text>

      <TouchableOpacity style={styles.button} onPress={handleSearchRestaurants} disabled={loading}>
        <Text style={styles.buttonText}>Search Restaurants Nearby</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSearchRecipes} disabled={loading}>
        <Text style={styles.buttonText}>Recipes to Make at Home</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#617a27" />}

      {!loading && recommendations && (
        <ScrollView style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsHeader}>{header}</Text>
          <Text style={styles.recommendationsText}>{recommendations}</Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e1edcd',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#436c1c',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#436c1c',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  recommendationsContainer: {
    marginTop: 20,
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  recommendationsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#436c1c',
    marginBottom: 10,
  },
  recommendationsText: {
    fontSize: 16,
    color: '#555',
  },
});

export default FoodRecommendation;