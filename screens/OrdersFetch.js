import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";

const OrderHistoryScreen = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showPicker, setShowPicker] = useState({ start: false, end: false });
  const navigation = useNavigation();

  const fetchOrders = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/orders/uber-eats`);
      const data = await response.json();
      if (data.success) {
        const sortedOrders = data.orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(sortedOrders);
        setFilteredOrders(filterOrdersByDate(sortedOrders, startDate, endDate));
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setFilteredOrders(filterOrdersByDate(orders, startDate, endDate));
  }, [startDate, endDate, orders]);

  const filterOrdersByDate = (orders, start, end) => {
    return orders.filter((order) => {
      const orderDate = new Date(order.date);
      return (!start || orderDate >= start) && (!end || orderDate <= end);
    });
  };

  const showDatePicker = (type) => {
    setShowPicker((prev) => ({ ...prev, [type]: true }));
  };

  const onDateChange = (event, selectedDate, type) => {
    if (selectedDate) {
      type === "start" ? setStartDate(selectedDate) : setEndDate(selectedDate);
    }
    setShowPicker((prev) => ({ ...prev, [type]: false }));
  };

  const navigateToReport = () => {
    navigation.navigate("ReportScreen", { orders: filteredOrders });
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => showDatePicker("start")} style={styles.dateButton}>
          <Text style={styles.dateText}>{startDate ? startDate.toDateString() : "Start Date"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => showDatePicker("end")} style={styles.dateButton}>
          <Text style={styles.dateText}>{endDate ? endDate.toDateString() : "End Date"}</Text>
        </TouchableOpacity>
      </View>

      {showPicker.start && (
        <DateTimePicker value={startDate || new Date()} mode="date" display="default" onChange={(event, date) => onDateChange(event, date, "start")} />
      )}
      {showPicker.end && (
        <DateTimePicker value={endDate || new Date()} mode="date" display="default" onChange={(event, date) => onDateChange(event, date, "end")} />
      )}

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.orderContainer}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.restaurant}>{item.restaurant}</Text>
            <Text style={styles.items}>Items: {item.items.join(", ")}</Text>
            <Text style={styles.total}>Total: ${item.total.toFixed(2)}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Button title="Generate Report" onPress={navigateToReport} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dateButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#617a27",
    backgroundColor: "#eaf4c3",
  },
  dateText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
  orderContainer: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  date: {
    fontSize: 14,
    color: "#555",
  },
  restaurant: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  items: {
    fontSize: 16,
    color: "#666",
  },
  total: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
});

export default OrderHistoryScreen;
