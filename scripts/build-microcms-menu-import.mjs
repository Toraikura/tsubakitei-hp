import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "data", "menu.json");
const deliSourcePath = path.join(root, "data", "deli-menu.json");
const outputPath = path.join(root, "data", "microcms-menu-import.csv");

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const deliSource = JSON.parse(fs.readFileSync(deliSourcePath, "utf8"));

const headers = [
  "visible",
  "store",
  "menuId",
  "sectionName",
  "sectionDescription",
  "sortOrder",
  "name",
  "description",
  "price",
  "priceText",
  "imagePath",
  "image"
];

function csvCell(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function variantText(item) {
  if (!Array.isArray(item.variants) || item.variants.length === 0) return "";
  return item.variants
    .map((variant) => `${variant.name} ￥${Number(variant.price).toLocaleString("ja-JP")}`)
    .join(" / ");
}

const rows = [];
let sortOrder = 10;

for (const menu of source.menus || []) {
  for (const section of menu.sections || []) {
    const items = section.items || [];
    if (!items.length && (section.name || section.description)) {
      rows.push({
        visible: "TRUE",
        store: source.store || "tsubakitei",
        menuId: menu.id,
        sectionName: section.name || "",
        sectionDescription: section.description || "",
        sortOrder,
        name: "",
        description: "",
        price: "",
        priceText: "",
        imagePath: "",
        image: ""
      });
      sortOrder += 10;
    }
    for (const item of items) {
      rows.push({
        visible: "TRUE",
        store: source.store || "tsubakitei",
        menuId: menu.id,
        sectionName: section.name || "",
        sectionDescription: section.description || "",
        sortOrder,
        name: item.name || "",
        description: item.description || "",
        price: item.price || "",
        priceText: variantText(item),
        imagePath: item.image || "",
        image: ""
      });
      sortOrder += 10;
    }
  }
}

for (const item of deliSource.items || []) {
  rows.push({
    visible: item.visible === false ? "FALSE" : "TRUE",
    store: deliSource.store || "deli",
    menuId: "deli",
    sectionName: "ツバキ&デリ メニュー",
    sectionDescription: "",
    sortOrder: item.sortOrder || sortOrder,
    name: item.name || "coming soon...",
    description: item.description || "",
    price: item.price || "",
    priceText: item.priceText || "￥...",
    imagePath: item.imagePath || "",
    image: ""
  });
  sortOrder += 10;
}

const csv = [
  headers.join(","),
  ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(","))
].join("\n") + "\n";

fs.writeFileSync(outputPath, csv, "utf8");
console.log(`Wrote ${rows.length} rows to ${outputPath}`);
