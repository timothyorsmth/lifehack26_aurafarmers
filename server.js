// ==============
// The main server file :)
// ==============

// Import dependencies
import "dotenv/config";
import express from "express";
import OpenAI from "openai";

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

// Check if on the correct port 
app.listen(3000, () => {
  console.log("Backend listening on port 3000");
});