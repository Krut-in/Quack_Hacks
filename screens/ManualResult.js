import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const ManualResult = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const nutritionData = route.params.nutritionData; // Get data passed from InputScreen

  const renderNutrient = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.nutrient}>{item.label}</Text>
      <Text style={styles.amount}>{item.value} {item.unit}</Text>
    </View>
  );

  // Transform the object keys into an array for rendering
  const formattedData = nutritionData.map((item) => [
    { label: 'Food', value: item.food, unit: '' },
    { label: 'Calories', value: item.calories, unit: 'kcal' },
    { label: 'Protein', value: item.protein, unit: 'g' },
    { label: 'Carbs', value: item.carbs, unit: 'g' },
    { label: 'Fat', value: item.fat, unit: 'g' },
    { label: 'Fiber', value: item.fiber, unit: 'g' },
  ]).flat(); // Flatten array for FlatList

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Nutrition Breakdown</Text>

      <FlatList
        data={formattedData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderNutrient}
      />
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
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    width: '90%',
  },
  nutrient: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#436c1c',
  },
  amount: {
    fontSize: 16,
    color: '#555',
  },
});

export default ManualResult;
