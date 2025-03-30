import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const SelectionScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Choose one</Text>

      <Option number="1" text="Ordered through UberEats?" onPress={() => navigation.navigate("OrdersFetch")} />
      <Option number="2" text="Upload a picture" onPress={() => navigation.navigate("ImageInput")} />
      <Option number="3" text="Enter manually" onPress={() => navigation.navigate("ManualEntry")}/>
      <Option number="4" text="Get your monthly nutritional plan" />
    </View>
  );
};

const Option = ({ number, text, onPress }) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <View style={styles.circle}>
      <Text style={styles.circleText}>{number}</Text>
    </View>
    <Text style={styles.optionText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d9e8b8",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    backgroundColor: "#617a27",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#eaf4c3",
    borderRadius: 10,
  },
  circle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 2,
    borderColor: "#617a27",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  circleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#617a27",
  },
  optionText: {
    fontSize: 18,
    color: "#333",
  },
});

export default SelectionScreen;
