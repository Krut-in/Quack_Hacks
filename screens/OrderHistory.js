import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const App = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialCount, setInitialCount] = useState(5);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showPicker, setShowPicker] = useState({ start: false, end: false });

  const fetchOrders = async (platform, pageNum, limit) => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3001/orders/${platform}?page=${pageNum}&limit=${limit}`
      );
      const data = await response.json();

      if (data.success) {
        setHasMoreOrders(data.orders.length === limit);
        const sortedOrders = [...orders, ...data.orders].sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(sortedOrders);
        setFilteredOrders(filterOrdersByDate(sortedOrders, startDate, endDate));
      } else {
        console.error("Error fetching orders:", data.message);
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders("uber-eats", page, initialCount);
  }, [page, initialCount]);

  useEffect(() => {
    setFilteredOrders(filterOrdersByDate(orders, startDate, endDate));
  }, [startDate, endDate, orders]);

  const filterOrdersByDate = (orders, start, end) => {
    return orders.filter((order) => {
      const orderDate = new Date(order.date);
      return (!start || orderDate >= start) && (!end || orderDate <= end);
    });
  };

  const handleShowMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleGenerateReport = () => {
    console.log("Generating Report...", filteredOrders);
    // Implement report generation logic (e.g., export to CSV, PDF)
  };

  const showDatePicker = (type) => {
    setShowPicker((prev) => ({ ...prev, [type]: true }));
  };

  const onDateChange = (event, selectedDate, type) => {
    if (selectedDate) {
      if (type === "start") setStartDate(selectedDate);
      else setEndDate(selectedDate);
    }
    setShowPicker((prev) => ({ ...prev, [type]: false }));
  };

  const renderItem = ({ item }) => (
    <View style={styles.orderContainer}>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.restaurant}>{item.restaurant}</Text>
      <Text style={styles.items}>Items: {item.items.join(", ")}</Text>
      <Text style={styles.total}>Total: ${item.total.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Date Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => showDatePicker("start")} style={styles.dateButton}>
          <Text style={styles.dateText}>{startDate ? startDate.toDateString() : "Start Date"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => showDatePicker("end")} style={styles.dateButton}>
          <Text style={styles.dateText}>{endDate ? endDate.toDateString() : "End Date"}</Text>
        </TouchableOpacity>
      </View>

      {showPicker.start && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => onDateChange(event, date, "start")}
        />
      )}
      {showPicker.end && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => onDateChange(event, date, "end")}
        />
      )}

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />

      {/* Footer with "Show More" & "Generate Report" Buttons */}
      <View style={styles.footer}>
        {hasMoreOrders && (
          <TouchableOpacity style={styles.button} onPress={handleShowMore} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Loading..." : "Show More"}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.button} onPress={handleGenerateReport}>
          <Text style={styles.buttonText}>Generate Report</Text>
        </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f4f4f4",
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#28a745",
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default App;
