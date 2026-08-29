import { chromium } from "playwright";

const HM_WOMEN_URL =
  "https://www2.hm.com/en_sg/women.html";

export async function getHMWomenProducts() {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage({
      userAgent: "VibeHackathonPrototype/1.0",
    });

    await page.goto(HM_WOMEN_URL, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForTimeout(3000);

    console.log("H&M page title:", await page.title());
    console.log("H&M current URL:", page.url());

    const products = await page.evaluate(() => {
      return [...document.querySelectorAll("a")]
        .map((link) => {
          const image = link.querySelector("img");

          return {
            name:
              image?.alt ||
              link.innerText?.trim() ||
              "H&M product",
            image:
              image?.src ||
              image?.getAttribute("data-src"),
            url: link.href,
          };
        })
        .filter((product) => product.image)
        .slice(0, 20);
    });

    console.log(`H&M products found: ${products.length}`);

    return products.map((product, index) => ({
      id: `hm-${index}`,
      name: product.name,
      brand: "H&M",
      price: null,
      currency: "SGD",
      image: product.image,
      url: product.url,
      source: "H&M Singapore",
      description: "",
    }));
  } finally {
    await browser.close();
  }
}