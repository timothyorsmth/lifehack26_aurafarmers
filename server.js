import "dotenv/config";
import express from "express";
import OpenAI from "openai";

import { supabase } from "./backend/supabase.js";
import { getUniqloWomenProducts } from "./backend/sources/uniqlo.js";
import { analyzeProductImage } from "./backend/analyser/analyzeProductImage.js";

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());

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

app.listen(3000, () => {
  console.log("Backend listening on port 3000");
});