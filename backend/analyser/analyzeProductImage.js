export async function analyzeProductImage(openai, product) {
    const result = await openai.responses.create({
        model: "gpt-4o-mini",
        input: [
        {
            role: "user",
            content: [
            {
                type: "input_text",
                text: `
    Analyze this clothing image and return only valid JSON.

    Use this structure:
    {
    "styleTags": [],
    "colors": [],
    "silhouette": "",
    "formality": "",
    "occasions": [],
    "details": [],
    "aestheticSummary": ""
    }

    Generate specific aesthetic tags such as:
    minimalist, Y2K, romantic, edgy, vintage,
    streetwear, preppy, quiet luxury, bohemian.

    Do not use generic tags like fashion or clothing.
                `,
            },
            {
                type: "input_image",
                image_url: product.image,
            },
            ],
        },
        ],
    });

    let text = result.output_text.trim();

    text = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

    return JSON.parse(text);
}