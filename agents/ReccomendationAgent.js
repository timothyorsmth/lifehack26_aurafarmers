// This agent reccomends you clothes
import OpenAI from "openai";

// Called by frontend
export async function getReccomendations(userId) {
  const response = await fetch(`/api/recommendations/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  // Error checking
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.error || `Request failed: ${response.status}`
    );
  }

  // Return recommendation data
  return response.json();
}

// Called by backend idk what the fuck is this formatting i just need this to work rn
export async function recommendationAgent(profile, products, MODEL) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
        model: MODEL,
        response_format: {
        type: "json_object"
        },
        messages: [
        {
            role: "system",
            content: `
                You are a clothing recommendation agent.

                Recommend products based on:
                1. The user's personality tags
                2. The user's previous searches
                3. The available product catalog

                Only recommend products whose IDs exist in the catalog.
                Do not invent products or product IDs.

                Return valid JSON in this format:
                {
                    "recommendations": [
                        {
                        "productId": "existing-product-id",
                        "reason": "Short explanation"
                        }
                    ],
                    "summary": "Short summary of the user's style"
                }
            `
        },
        {
            role: "user",
            content: JSON.stringify({
                userProfile: {
                    tags: "minimalist",
                    previousSearches: "black"
                },
                products: products
            })
        }
        ]
    });

    return JSON.parse(completion.choices[0].message.content);
}