import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDoc, doc, getDocs } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import axios from 'axios';

const auth = getAuth(app);
const db = getFirestore(app);

const WeeklyIntake = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [userNeeds, setUserNeeds] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const fetchWeeklyData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not logged in.');
        return;
      }

      const userDocRef = doc(db, 'users', user.uid); // Reference to the user's document
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
        Alert.alert('Error', 'User details not found.');
        return;
        }

        const userDetails = userDoc.data(); 

      // Fetch nutrition history for the past 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const historyQuery = query(
        collection(db, 'users', user.uid, 'nutritionHistory'),
        where('timestamp', '>=', oneWeekAgo)
      );

      const historySnapshot = await getDocs(historyQuery);
      const historyData = historySnapshot.docs.map(doc => doc.data());

      // Group data by day
      const groupedData = groupDataByDay(historyData);

      // Fetch user needs from GPT
      const needs = await fetchUserNeedsFromGPT(userDetails);

      setWeeklyData(groupedData);
      setUserNeeds(needs);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      Alert.alert('Error', 'Failed to fetch weekly data.');
    } finally {
      setLoading(false);
    }
  };

  const groupDataByDay = (data) => {
    const grouped = {};

    // Initialize all 7 days of the week with "Insufficient Data"
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toDateString();
      grouped[dateString] = null; // Set null for days with no data
    }

    // Populate grouped data with actual values from Firestore
    data.forEach((item) => {
      const date = new Date(item.timestamp.toDate()).toDateString();
      if (!grouped[date]) {
        grouped[date] = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
      }

      grouped[date].calories += parseFloat(item.calories) || 0;
      grouped[date].protein += parseFloat(item.protein) || 0;
      grouped[date].carbs += parseFloat(item.carbs) || 0;
      grouped[date].fat += parseFloat(item.fat) || 0;
      grouped[date].fiber += parseFloat(item.fiber) || 0;
    });

    return grouped;
  };

  const fetchUserNeedsFromGPT = async (userDetails) => {
    const prompt = `
      You are a nutritionist. Based on the following user details, calculate their daily nutrient requirements:
      - Age: ${userDetails.age}
      - Gender: ${userDetails.gender}
      - Weight: ${userDetails.weight} kg
      - Height: ${userDetails.height.feet} feet ${userDetails.height.inches} inches
      - Activity Level: Moderate
      Provide only the requirements in JSON format with keys: "calories", "protein", "carbs", "fat", "fiber". dont include any other text or markdown.
    `;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a nutritionist.' },
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

      const output = response.data.choices[0].message.content.trim();
      return JSON.parse(output);
    } catch (error) {
      console.error('Error fetching user needs from GPT:', error);
      Alert.alert('Error', 'Failed to fetch user needs.');
      return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#617a27" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Weekly Nutritional Intake</Text>

      {Object.keys(weeklyData).map((date, index) => (
        <View key={index} style={styles.dayContainer}>
          <Text style={styles.date}>{date}</Text>
          {weeklyData[date] ? (
            <>
              <Text style={styles.nutrient}>
                Calories: {weeklyData[date].calories.toFixed(1)} / {userNeeds?.calories || 'N/A'} cal
              </Text>
              <Text style={styles.nutrient}>
                Protein: {weeklyData[date].protein.toFixed(1)} / {userNeeds?.protein || 'N/A'} g
              </Text>
              <Text style={styles.nutrient}>
                Carbs: {weeklyData[date].carbs.toFixed(1)} / {userNeeds?.carbs || 'N/A'} g
              </Text>
              <Text style={styles.nutrient}>
                Fat: {weeklyData[date].fat.toFixed(1)} / {userNeeds?.fat || 'N/A'} g
              </Text>
              <Text style={styles.nutrient}>
                Fiber: {weeklyData[date].fiber.toFixed(1)} / {userNeeds?.fiber || 'N/A'} g
              </Text>
            </>
          ) : (
            <Text style={styles.insufficientData}>Insufficient Data</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e1edcd',
  },
  container: {
    padding: 20,
    backgroundColor: '#e1edcd',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#436c1c',
    marginBottom: 20,
    textAlign: 'center',
  },
  dayContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#436c1c',
    marginBottom: 10,
  },
  nutrient: {
    fontSize: 16,
    color: '#555',
  },
  insufficientData: {
    fontSize: 16,
    color: '#ff0000', // Red color for emphasis
    fontStyle: 'italic',
  },
});

export default WeeklyIntake;