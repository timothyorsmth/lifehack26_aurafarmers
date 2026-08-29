const BASE_URL =
  "https://www.uniqlo.com/th/api/commerce/v3/en/products";

// Paste your category codes here
const WOMEN_CATEGORY_CODES = [
  "8404",
  "8406",
  "117241",
  "8392"
];

const THB_TO_SGD = 0.03851;

const PRODUCTS_PER_CATEGORY = 20;

function getFirstImage(images) {
  if (!images || typeof images !== "object") {
    return null;
  }

  for (const group of Object.values(images)) {
    if (!Array.isArray(group)) {
      continue;
    }

    const image = group.find((item) => item?.url);

    if (image) {
      return image.url;
    }
  }

  return null;
}

function getPrice(product) {
  const promoPrice = product.prices?.promo?.value;
  const basePrice = product.prices?.base?.value;

  const thbPrice = Number(promoPrice || basePrice);

  if (!thbPrice || Number.isNaN(thbPrice)) {
    console.warn(`No price found for: ${product.name}`);
    return null;
  }

  return Number((thbPrice * THB_TO_SGD).toFixed(2));
}

function getProductIdentifier(product) {
  return (
    product.productId ||
    product.id ||
    product.productCode ||
    product.productNumber ||
    product.name
  );
}

function normalizeProduct(product, categoryCode) {
  const image = getFirstImage(product.images);
  const price = getPrice(product);

  return {
    id: `uniqlo-${getProductIdentifier(product)}`,
    name: product.name || "UNIQLO product",
    brand: "UNIQLO",
    price,
    currency: "SGD",
    image,
    url: "https://www.uniqlo.com/th/en/",
    source: "UNIQLO Thailand",
    description: product.description || "",
  };
}

export async function getUniqloWomenProducts() {
  const allProducts = [];

  for (const categoryCode of WOMEN_CATEGORY_CODES) {
    const url =
      `${BASE_URL}?path=%2C%2C${categoryCode}&limit=${PRODUCTS_PER_CATEGORY}`;

    console.log(
      `Fetching category code ${categoryCode}...`
    );

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "VibeHackathonPrototype/1.0",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.error(
          `Category ${categoryCode} failed with status ${response.status}`
        );

        continue;
      }

      const data = await response.json();
      const products = data.result?.items || [];

      console.log(
        `Category ${categoryCode}: API returned ${products.length} products`
      );

      const normalizedProducts = products
        .map((product) =>
          normalizeProduct(product, categoryCode)
        )
        .filter((product) => {
          if (!product.image) {
            console.log(
              `Skipped ${product.name}: no image`
            );

            return false;
          }

          return true;
        });

      console.log(
        `Category ${categoryCode}: kept ${normalizedProducts.length} products`
      );

      allProducts.push(...normalizedProducts);
    } catch (error) {
      console.error(
        `Category ${categoryCode} request failed:`,
        error.message
      );
    }
  }

  const uniqueProducts = [
    ...new Map(
      allProducts.map((product) => [product.id, product])
    ).values(),
  ];

  console.log(
    `Total unique products: ${uniqueProducts.length}`
  );

  return uniqueProducts;
}