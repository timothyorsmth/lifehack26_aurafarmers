import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("Key loaded:", Boolean(process.env.OPENAI_API_KEY));

app.post("/api/test", async (req, res) => {
  try {
    const result = await openai.responses.create({
      model: "gpt-5.6",
      input: req.body.message,
    });

    res.json({ output: result.output_text });

    console.log(result.output_text);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Agent request failed" });
  }
});

app.listen(3000, () => {
  console.log("Backend listening on port 3000");
});