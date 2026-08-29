import "dotenv/config";
import express from "express";
import OpenAI from "openai";

import { supabase } from "./backend/supabase.js";
import { getUniqloWomenProducts } from "./backend/sources/uniqlo.js";
import { analyzeProductImage } from "./backend/analyser/analyzeProductImage.js";

import { getHMWomenProducts } from "./backend/sources/hm.js";

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

    const { data: existingProducts, error: existingError } =
      await supabase
        .from("products")
        .select("id, ai_analysis");

    if (existingError) {
      throw existingError;
    }

    const analyzedIds = new Set(
      existingProducts
        .filter((product) => product.ai_analysis)
        .map((product) => product.id)
    );

    const enrichedProducts = [];

    for (const product of products) {
      const existing = existingProducts.find(
        (item) => item.id === product.id
      );

      if (analyzedIds.has(product.id)) {
        console.log(`Skipping already analyzed: ${product.name}`);

        enrichedProducts.push({
          ...product,
          ai_analysis: existing.ai_analysis,
          tags: existing.ai_analysis.styleTags,
          updated_at: new Date().toISOString(),
        });

        continue;
      }

      try {
        console.log(`Analyzing: ${product.name}`);

        const aiAnalysis = await analyzeProductImage(
          openai,
          product
        );

        enrichedProducts.push({
          ...product,
          tags: aiAnalysis.styleTags,
          ai_analysis: aiAnalysis,
          updated_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error(
          `Analysis failed for ${product.name}:`,
          error.message
        );
      }
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
      message: "Products refreshed",
      scraped: products.length,
      analyzed: products.length - analyzedIds.size,
      skipped: analyzedIds.size,
      saved: data.length,
    });
  } catch (error) {
    console.error("Refresh failed:", error);

    res.status(500).json({
      error: "Could not refresh products",
      details: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Backend listening on port 3000");
});