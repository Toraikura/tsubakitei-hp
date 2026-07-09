import fs from "node:fs";

const config = fs.readFileSync("assets/js/menu-config.js", "utf8");
const key = config.match(/apiKey:\s*"([^"]+)"/)?.[1];

if (!key) throw new Error("API key not found");

const base = "https://tsubakitei-hp.microcms.io/api/v1";
const headers = {
  "Content-Type": "application/json",
  "X-MICROCMS-API-KEY": key
};

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  const body = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${url}: ${body}`);
  return body ? JSON.parse(body) : {};
}

function selected(value) {
  return Array.isArray(value) ? value[0] : value;
}

function storeOf(row) {
  const value = String(selected(row.storeSingle || row.storeSelect || row.store) || "").trim();
  return ["deli", "Deli", "デリ", "ツバキ&デリ"].includes(value) ? "deli" : "tsubakitei";
}

function menuIdOf(row) {
  const value = String(selected(row.menuIdSingle || row.menuIdSelect || row.menuId || row.menu) || "");
  if (["dinner-menu", "Dinner", "dinner", "ディナー", "ディナーメニュー"].includes(value)) return "Dinner";
  if (["course-menu", "Course", "course", "コース", "コースメニュー"].includes(value)) return "Course";
  return "Lunch";
}

function priceTextOf(row) {
  if (row.priceText) return row.priceText;
  const price = Number(row.price);
  return price > 0 ? `￥${price.toLocaleString("ja-JP")}` : "";
}

function imagePathOf(row) {
  return row.image?.url || row.imagePath || "";
}

async function create(endpoint, payload) {
  try {
    return await request(`${base}/${endpoint}`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  } catch (error) {
    if (!String(error.message).includes("400")) throw error;
    const retry = { ...payload };
    if (retry.menuId) retry.menuId = [retry.menuId];
    if (retry.sectionName) retry.sectionName = [retry.sectionName];
    return request(`${base}/${endpoint}`, {
      method: "POST",
      body: JSON.stringify(retry)
    });
  }
}

const [legacy, existingMain, existingDeli] = await Promise.all([
  request(`${base}/menus?limit=100&orders=sortOrder`),
  request(`${base}/tsubakitei-menus?limit=1`),
  request(`${base}/deli-menus?limit=1`)
]);

if (existingMain.totalCount || existingDeli.totalCount) {
  throw new Error(`Targets are not empty: main=${existingMain.totalCount}, deli=${existingDeli.totalCount}`);
}

const mainRows = legacy.contents.filter((row) => storeOf(row) === "tsubakitei");
const deliRows = legacy.contents.filter((row) => storeOf(row) === "deli");

if (mainRows.length !== 60 || deliRows.length !== 20) {
  throw new Error(`Unexpected source counts: main=${mainRows.length}, deli=${deliRows.length}`);
}

for (const row of mainRows) {
  await create("tsubakitei-menus", {
    visible: row.visible !== false,
    menuId: menuIdOf(row),
    sectionName: selected(row.sectionNameSingle || row.sectionNameSelect || row.sectionName) || "ランチメニュー",
    name: row.name || "",
    sectionDescription: [row.sectionDescription, row.description].filter(Boolean).join("\n"),
    priceText: priceTextOf(row),
    imagePath: imagePathOf(row),
    sortOrder: Number(row.sortOrder) || 0
  });
}

for (const row of deliRows) {
  await create("deli-menus", {
    visible: row.visible !== false,
    name: row.name || "coming soon...",
    priceText: priceTextOf(row) || "￥...",
    imagePath: imagePathOf(row),
    sortOrder: Number(row.sortOrder) || 0
  });
}

const [mainResult, deliResult, store3Result] = await Promise.all([
  request(`${base}/tsubakitei-menus?limit=1`),
  request(`${base}/deli-menus?limit=1`),
  request(`${base}/store3-menus?limit=1`)
]);

console.log(JSON.stringify({
  source: legacy.totalCount,
  tsubakitei: mainResult.totalCount,
  deli: deliResult.totalCount,
  store3: store3Result.totalCount
}));
