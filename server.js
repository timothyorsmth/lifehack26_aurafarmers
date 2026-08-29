import "dotenv/config";
import express from "express";
import OpenAI from "openai";

import { supabase } from "./backend/supabase.js";
import { getUniqloWomenProducts } from "./backend/sources/uniqlo.js";
import { analyzeProductImage } from "./backend/analyser/analyzeProductImage.js";
import { recommendationAgent } from "./agents/ReccomendationAgent.js";

// constants
const MODEL = "gpt-5.6"

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());

// Add the main post function calls
// Get Product list
export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*");

  if (error) {
    throw error;
  }

  return data;
}

// Web scrape products
app.get("/api/products", async (_req, res) => {
  try {
    const products = await getUniqloWomenProducts();

    const enrichedProducts = [];

    for (const product of products.slice(0, 12)) {
      try {
        console.log(`Analyzing: ${product.name}`);

        const aiAnalysis = await analyzeProductImage(
          openai,
          product
        );

        enrichedProducts.push({
          ...product,
          tags: aiAnalysis.styleTags,
          aiAnalysis,
        });
      } catch (error) {
        console.error(
          `Image analysis failed for ${product.name}:`,
          error.message
        );

        enrichedProducts.push({
          ...product,
          tags: ["women", "everyday"],
        });
      }
    }

    res.json({
      source: "UNIQLO Women",
      count: enrichedProducts.length,
      products: enrichedProducts,
    });
  } catch (error) {
    console.error("UNIQLO API failed:", error);

    res.status(500).json({
      error: "Could not retrieve UNIQLO products",
      details: error.message,
    });
  }
});

app.post("/api/products/refresh", async (_req, res) => {
  try {
    const products = await getUniqloWomenProducts();

    const enrichedProducts = [];

    for (const product of products.slice(0, 12)) {
      console.log(`Analyzing ${product.name}`);

      const aiAnalysis = await analyzeProductImage(
        openai,
        product
      );

      enrichedProducts.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        currency: product.currency,
        image: product.image,
        url: product.url,
        source: product.source,
        category: product.category,
        description: product.description,
        tags: aiAnalysis.styleTags,
        ai_analysis: aiAnalysis,
        updated_at: new Date().toISOString(),
      });
    }

    const { data, error } = await supabase
      .from("products")
      .upsert(enrichedProducts, {
        onConflict: "id",
      })
      .select();

    if (error) {
      throw error;
    }

    res.json({
      message: "Products saved to Supabase",
      count: data.length,
      products: data,
    });
  } catch (error) {
    console.error("Supabase save failed:", error);

    res.status(500).json({
      error: "Could not save products",
      details: error.message,
    });
  }
});

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

// Reccomendation Agent
app.get("/api/recommendations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const products = await getProducts()
    const agentResult = await recommendationAgent("", products, MODEL);

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