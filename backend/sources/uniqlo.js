const BASE_URL =
  "https://www.uniqlo.com/th/api/commerce/v3/en/products";

const WOMEN_CATEGORIES = [
  { name: "tops", id: "25990" },
  { name: "outerwear", id: "25991" },
  { name: "bottoms", id: "25992" },
  { name: "dresses", id: "8406" },
  { name: "innerwear", id: "25994" },
  { name: "loungewear", id: "25993" },
  { name: "accessories", id: "25995" },
];

function getFirstImage(images) {
  if (!images || typeof images !== "object") {
    return null;
  }

  for (const imageGroup of Object.values(images)) {
    if (Array.isArray(imageGroup) && imageGroup.length > 0) {
      return imageGroup[0]?.url || null;
    }
  }

  return null;
}

function normalizeProduct(product, categoryName) {
  return {
    id: `uniqlo-${product.productId || product.id || product.name}`,
    name: product.name,
    brand: "UNIQLO",
    price: product.price || product.minPrice || null,
    currency: "THB",
    image: getFirstImage(product.images),
    url: "https://www.uniqlo.com/th/en/",
    source: "UNIQLO Thailand",
    category: categoryName,
    description: product.description || "",
  };
}

export async function getUniqloWomenProducts() {
  const allProducts = [];

  for (const category of WOMEN_CATEGORIES) {
    const url =
      `${BASE_URL}?path=%2C%2C${category.id}&limit=10`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "VibeHackathonPrototype/1.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `UNIQLO ${category.name} failed: ${response.status}`
      );
      continue;
    }

    const data = await response.json();
    const products = data.result?.items || [];

    const normalizedProducts = products
      .map((product) => normalizeProduct(product, category.name))
      .filter((product) => product.name && product.image);

    allProducts.push(...normalizedProducts);
  }

  const uniqueProducts = [
    ...new Map(
      allProducts.map((product) => [product.id, product])
    ).values(),
  ];

  return uniqueProducts;
}