import fs from "node:fs";
import path from "node:path";

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function notionFetch(pathname, init = {}) {
  const response = await fetch(`https://api.notion.com/v1${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Notion API ${response.status}: ${body}`);
  }

  return response.json();
}

async function main() {
  loadDotEnv(path.join(process.cwd(), ".env.local"));

  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!token || !databaseId) {
    throw new Error("Missing NOTION_TOKEN or NOTION_DATABASE_ID in .env.local");
  }

  const database = await notionFetch(`/databases/${databaseId}`);
  const currentProperties = database.properties ?? {};

  const desiredProperties = {
    Slug: { rich_text: {} },
    Excerpt: { rich_text: {} },
    Author: { rich_text: {} },
    Tag: {
      select: {
        options: [
          { name: "architecture", color: "blue" },
          { name: "deep dive", color: "green" },
          { name: "security", color: "red" },
          { name: "mcp", color: "purple" },
          { name: "blog", color: "gray" },
        ],
      },
    },
    Published: { checkbox: {} },
    PublishedAt: { date: {} },
    UpdatedAt: { date: {} },
    ReadTime: { rich_text: {} },
    SeoTitle: { rich_text: {} },
    SeoDescription: { rich_text: {} },
    CoverImage: { files: {} },
  };

  const propertiesToCreate = {};

  for (const [name, config] of Object.entries(desiredProperties)) {
    if (!(name in currentProperties)) {
      propertiesToCreate[name] = config;
    }
  }

  if (Object.keys(propertiesToCreate).length === 0) {
    console.log("Notion blog schema already contains the expected properties.");
    return;
  }

  await notionFetch(`/databases/${databaseId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: propertiesToCreate,
    }),
  });

  console.log("Added Notion properties:");
  for (const name of Object.keys(propertiesToCreate)) {
    console.log(`- ${name}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
