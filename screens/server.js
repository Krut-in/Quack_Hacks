const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config({ path: "mac.env" }); // Load environment variables from mac.env

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --------------------------------------------------
// 📌 Fake Order History Data (Uber Eats Orders)
// --------------------------------------------------
const fakeOrders = {
  "uber-eats": [
    { id: 1, restaurant: "McDonald's", items: ["Big Mac", "Fries", "Coke"], total: 12.99, date: "2025-03-01" },
    { id: 2, restaurant: "KFC", items: ["Chicken Bucket", "Biscuits"], total: 15.49, date: "2025-03-05" },
    { id: 3, restaurant: "Starbucks", items: ["Caramel Macchiato", "Banana Bread"], total: 8.99, date: "2025-03-10" },
    { id: 4, restaurant: "Taco Bell", items: ["Crunchwrap Supreme", "Nachos"], total: 9.99, date: "2025-03-12" },
    { id: 5, restaurant: "Panda Express", items: ["Orange Chicken", "Fried Rice"], total: 10.49, date: "2025-03-15" },
  ],
};

// --------------------------------------------------
// 📌 Route: Get Order History with Pagination
// --------------------------------------------------
app.get("/orders/:platform", (req, res) => {
  const platform = req.params.platform;
  const { page = 1, limit = 5 } = req.query;

  if (fakeOrders[platform]) {
    let orders = fakeOrders[platform].sort((a, b) => new Date(b.date) - new Date(a.date));
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = orders.slice(startIndex, endIndex);
    res.json({ success: true, orders: paginatedOrders });
  } else {
    res.status(404).json({ success: false, message: "Platform not found" });
  }
});

// --------------------------------------------------
// 📌 Function: Fetch Nutrition Data Using GPT API
// --------------------------------------------------
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Secure API key in mac.env

async function getNutritionFromGPT(items) {
  if (!OPENAI_API_KEY) {
    console.error("❌ OpenAI API key is missing. Add it to your mac.env file.");
    return { error: "Server misconfiguration: Missing OpenAI API key." };
  }

  // Create a prompt that instructs GPT to return nutrition facts in JSON format.
  const prompt = `You are a nutritionist. Provide detailed nutrition facts for the following food items.
Return a JSON array where each object represents an item with keys: "name", "calories", "protein", "fat", "carbs", "fiber", "sugar", "vitamins", and "minerals".
Food Items: ${JSON.stringify(items)}`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini", // Use your desired model
        messages: [
          { role: "system", content: "You are a nutritionist who provides detailed nutrition facts." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Expect GPT to return a JSON-formatted string in its response.
    const output = response.data.choices[0].message.content.trim();
    try {
      const nutritionArray = JSON.parse(output);
      return nutritionArray;
    } catch (parseError) {
      console.error("❌ Failed to parse GPT response as JSON:", output);
      return { error: "Failed to parse GPT response as JSON." };
    }
  } catch (error) {
    console.error("❌ Error fetching nutrition data from GPT:", error.response?.data || error.message);
    return { error: "Failed to fetch nutrition data from GPT." };
  }
}

// --------------------------------------------------
// 📌 Route: Get Nutrition Data for Multiple Items Using GPT
// --------------------------------------------------
app.post("/nutrition", async (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ success: false, message: "Items array required" });
  }

  const nutritionData = await getNutritionFromGPT(items);
  if (nutritionData.error) {
    return res.status(500).json({ success: false, error: nutritionData.error });
  }

  res.json({ success: true, results: nutritionData });
});

// --------------------------------------------------
// 📌 Route: Get Nutrition Data for Manually Entered Food
// --------------------------------------------------
app.post("/manual-nutrition", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ success: false, message: "Valid prompt string is required" });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a nutritionist who provides dietary recommendations." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data.choices[0].message.content.trim();
    res.json({ success: true, responseText: result });
  } catch (error) {
    console.error("❌ Error fetching manual nutrition data:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: "Failed to fetch manual nutrition data." });
  }
});


// --------------------------------------------------
// 📌 Start the Server
// --------------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
