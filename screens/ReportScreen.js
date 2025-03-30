import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

// Function to send a single prompt with all items to the GPT-based backend API
const getNutritionForItems = async (items) => {
  // Build a prompt that instructs GPT to return valid JSON.
  const prompt = `For the following list of food items, provide detailed nutrition facts for each item.
Return a JSON array where each object corresponds to an item and has the following keys:
"name", "calories", "protein", "fat", "carbs", "fiber", "sugar", "vitamins", and "minerals".
Return only the JSON array without any additional text or markdown.
Food Items: ${JSON.stringify(items)}`;

  try {
    const response = await fetch('http://localhost:3001/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [prompt] })
    });
    const data = await response.json();
    if (data.success && data.results && data.results.length > 0) {
      // Expecting data.results[0].nutrition to be a valid JSON string.
      try {
        const nutritionArray = data.results;
        return nutritionArray;
      } catch (e) {
        throw new Error("Failed to parse nutrition data as JSON");
      }
    } else {
      throw new Error("Failed to get nutrition data from GPT");
    }
  } catch (error) {
    throw new Error(`Error fetching nutrition data: ${error.message}`);
  }
};

const ReportScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orders } = route.params; // Orders passed from the previous screen

  const [nutritionTotals, setNutritionTotals] = useState({
    protein: 0,
    carbs: 0,
    fiber: 0,
    fat: 0,
    sugar: 0,
    calories: 0,
    vitamins: "",
    minerals: ""
  });
  const [loading, setLoading] = useState(true);

  // Calculates nutrition totals by sending all food items in one request to GPT.
  const calculateNutritionTotals = async () => {
    // Flatten all food items from the orders into one array.
    const items = [];
    orders.forEach(order => {
      order.items.forEach(item => items.push(item));
    });

    try {
      const nutritionArray = await getNutritionForItems(items);
      let totals = {
        protein: 0,
        carbs: 0,
        fiber: 0,
        fat: 0,
        sugar: 0,
        calories: 0,
        vitamins: new Set(),
        minerals: new Set()
      };

      // Aggregate values from each nutrition object.
      nutritionArray.forEach(nutrition => {
        totals.protein += Number(nutrition.protein) || 0;
        totals.carbs += Number(nutrition.carbs) || 0;
        totals.fiber += Number(nutrition.fiber) || 0;
        totals.fat += Number(nutrition.fat) || 0;
        totals.sugar += Number(nutrition.sugar) || 0;
        totals.calories += Number(nutrition.calories) || 0;

        if (Array.isArray(nutrition.vitamins)) {
          nutrition.vitamins.forEach(vit => totals.vitamins.add(vit));
        } else if (typeof nutrition.vitamins === "string") {
          nutrition.vitamins.split(",").forEach(vit => totals.vitamins.add(vit.trim()));
        }
        if (Array.isArray(nutrition.minerals)) {
          nutrition.minerals.forEach(min => totals.minerals.add(min));
        } else if (typeof nutrition.minerals === "string") {
          nutrition.minerals.split(",").forEach(min => totals.minerals.add(min.trim()));
        }
      });

      // Convert sets to comma-separated strings.
      totals.vitamins = Array.from(totals.vitamins).join(", ");
      totals.minerals = Array.from(totals.minerals).join(", ");

      setNutritionTotals(totals);
    } catch (error) {
      console.error("Error calculating nutrition totals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateNutritionTotals();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with Back and Profile buttons */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Text style={styles.iconText}>⏪</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.iconText}>👤</Text>
        </TouchableOpacity>
      </View>
  
      {/* Gauge Indicator */}
      <Image source={require("../assets/gauge.png")} style={styles.gauge} />
  
      {loading ? (
        <ActivityIndicator size="large" color="#617a27" />
      ) : (
        <>
          {/* Total Consumption Header */}
          <Text style={styles.totalConsumptionHeader}>Total Consumption</Text>
  
          <View style={styles.nutritionGrid}>
            {[
              { label: "Protein", value: nutritionTotals.protein + "g" },
              { label: "Carbs", value: nutritionTotals.carbs + "g" },
              { label: "Fiber", value: nutritionTotals.fiber + "g" },
              { label: "Fat", value: nutritionTotals.fat + "g" },
              { label: "Sugar", value: nutritionTotals.sugar + "g" },
              { label: "Calories", value: nutritionTotals.calories + " kcal" },
            ].map((item, index) => (
              <View key={index} style={styles.nutritionBox}>
                <Text style={styles.nutritionValue}>{item.value}</Text>
                <Text style={styles.nutritionLabel}>{item.label}</Text>
              </View>
            ))}
  
            {nutritionTotals.vitamins && (
              <View style={styles.nutritionBoxFull}>
                <Text style={styles.nutritionLabel}>Vitamins</Text>
                <Text style={styles.nutritionValue}>{nutritionTotals.vitamins}</Text>
              </View>
            )}
            {nutritionTotals.minerals && (
              <View style={styles.nutritionBoxFull}>
                <Text style={styles.nutritionLabel}>Minerals</Text>
                <Text style={styles.nutritionValue}>{nutritionTotals.minerals}</Text>
              </View>
            )}
          </View>
        </>
      )}
  
      <TouchableOpacity style={styles.showMore}>
        <Text style={styles.showMoreText}>show more</Text>
      </TouchableOpacity>
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf4c3",
    alignItems: "center",
    paddingVertical: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
  },
  iconButton: {
    padding: 10,
  },
  iconText: {
    fontSize: 20,
  },
  gauge: {
    width: 120,
    height: 80,
    marginVertical: 20,
  },
  nutritionGrid: {
    width: "90%",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nutritionBox: {
    width: "45%",
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  nutritionBoxFull: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  nutritionLabel: {
    fontSize: 16,
    color: "#4a7c20",
    fontWeight: "bold",
  },
  showMore: {
    marginTop: 20,
  },
  showMoreText: {
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default ReportScreen;
