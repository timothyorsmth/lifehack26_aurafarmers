// This agent reccomends you clothes
import { MODEL } from "../server"

async function recommendationAgent(profile, products) {
  const productCatalog = products.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    colors: product.colors,
    styles: product.styles,
    tags: product.tags,
    price: product.price
  }));

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
          products: productCatalog
        })
      }
    ]
  });

  return JSON.parse(completion.choices[0].message.content);
}