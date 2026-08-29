// ==============
// The main server file :)
// ==============

// Import dependencies
import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import crypto from "crypto";

// Import files (if any)

// Constants
const MODEL = "gpt-5.6"

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// To test the API key
//console.log("Key loaded:", Boolean(process.env.OPENAI_API_KEY));

// Add the main post function calls
// Search Agent
app.post("/api/test", async (req, res) => {
  try {
    const result = await openai.responses.create({
      model: MODEL,
      input: req.body.message,
    });

    res.json({ output: result.output_text });

    console.log(result.output_text);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Agent request failed" });
  }
});

// Reccomendation Agent
app.get("/api/recommendations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await getUserProfile(userId);
    const agentResult = await recommendationAgent(profile, products);

    const recommendations = agentResult.recommendations
      .map(item => {
        const product = products.find(
          product => product.id === item.productId
        );

        return product
          ? { ...product, reason: item.reason }
          : null;
      })
      .filter(Boolean);

    res.json({
      summary: agentResult.summary,
      recommendations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Could not generate recommendations"
    });
  }
});

// Connect pinterest (TO DO LATER)


// Check if on the correct port 
app.listen(3000, () => {
  console.log("Backend listening on port 3000");
});