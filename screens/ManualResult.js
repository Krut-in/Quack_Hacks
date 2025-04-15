import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAuth } from "firebase/auth";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import { app } from "../firebaseConfig.js";

const auth = getAuth(app);
const db = getFirestore(app);

const ManualResult = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const nutritionData = route.params.nutritionData;

  const calculateTotalNutrients = () => {
    const totals = nutritionData.reduce(
      (acc, item) => {
        acc.calories += parseFloat(item.calories) || 0;
        acc.protein += parseFloat(item.protein) || 0;
        acc.carbs += parseFloat(item.carbs) || 0;
        acc.fat += parseFloat(item.fat) || 0;
        acc.fiber += parseFloat(item.fiber) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 } // Initial accumulator values
    );

    Alert.alert(
      'Total Nutrients',
      `Calories: ${totals.calories.toFixed(1)} cal\nProtein: ${totals.protein.toFixed(1)} g\nCarbs: ${totals.carbs.toFixed(1)} g\nFat: ${totals.fat.toFixed(1)} g\nFiber: ${totals.fiber.toFixed(1)} g`
    );
  };

  const renderNutrient = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.nutrient}>{item.food}</Text>
      <Text style={styles.amount}>Calories: {item.calories} cal</Text>
      <Text style={styles.amount}>Protein: {item.protein} g</Text>
      <Text style={styles.amount}>Carbs: {item.carbs} g</Text>
      <Text style={styles.amount}>Fat: {item.fat} g</Text>
      <Text style={styles.amount}>Fiber: {item.fiber} g</Text>
    </View>
  );

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    try {
      const historyRef = collection(db, 'users', user.uid, 'nutritionHistory');
      for (const item of nutritionData) {
        await addDoc(historyRef, {
          ...item,
          timestamp: new Date(),
        });
      }
      Alert.alert('Success', 'Nutrition added to history!');
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      Alert.alert('Error', 'Failed to save nutrition data.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Nutrition Breakdown</Text>

      <FlatList
        data={nutritionData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderNutrient}
        numColumns={2}
        contentContainerStyle={styles.flatListContainer}
      />

      <TouchableOpacity style={styles.submitButton} onPress={calculateTotalNutrients}>
        <Text style={styles.submitButtonText}>Show Total Nutrients</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Add to History</Text>
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
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#436c1c',
    textAlign: 'center',
  },
  flatListContainer: {
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    width: '45%',
  },
  nutrient: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#436c1c',
    textAlign: 'center',
  },
  amount: {
    fontSize: 16,
    color: '#555',
    textAlign: 'left',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '60%',
  },
  paginationButton: {
    backgroundColor: '#436c1c',
    padding: 10,
    borderRadius: 5,
  },
  paginationText: {
    color: '#fff',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#436c1c',
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    width: '60%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default ManualResult;
