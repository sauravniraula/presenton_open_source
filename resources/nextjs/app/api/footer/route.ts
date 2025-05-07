// app/api/footer/route.ts
import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import fs from "fs";

// Define the interface for footer properties
export interface FooterProperties {
  logoProperties: {
    showLogo: boolean;
    logoPosition: string;
    opacity: number;
    logoImage: {
      light: string;
      dark: string;
    };
  };
  logoScale: number;
  logoOffset: {
    x: number;
    y: number;
  };
  footerMessage: {
    showMessage: boolean;
    opacity: number;
    fontSize: number;
    message: string;
  };
}

const DB_PATH = path.join(process.cwd(), "data", "footer-settings.db");

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Database connection helper
const getDb = async () => {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.verbose().Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS footer_properties (
      userId TEXT PRIMARY KEY,
      properties TEXT NOT NULL
    )
  `);

  return db;
};

// GET handler to retrieve properties
export async function GET(request: NextRequest) {
  console.log("called get ");
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    const result = await db.get(
      "SELECT properties FROM footer_properties WHERE userId = ?",
      userId
    );

    await db.close();

    if (result) {
      return NextResponse.json({ properties: JSON.parse(result.properties) });
    }

    return NextResponse.json({ properties: null });
  } catch (error) {
    console.error("Error retrieving footer properties:", error);
    return NextResponse.json(
      { error: "Failed to retrieve footer properties" },
      { status: 500 }
    );
  }
}

// POST handler to save properties
export async function POST(request: NextRequest) {
  console.log("post called");
  try {
    const body = await request.json();
    const { userId, properties } = body;

    if (!userId || !properties) {
      return NextResponse.json(
        { error: "User ID and properties are required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Convert properties object to JSON string
    const propertiesJson = JSON.stringify(properties);

    // Insert or replace (upsert) the footer properties
    await db.run(
      "INSERT OR REPLACE INTO footer_properties (userId, properties) VALUES (?, ?)",
      [userId, propertiesJson]
    );

    await db.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving footer properties:", error);
    return NextResponse.json(
      { error: "Failed to save footer properties" },
      { status: 500 }
    );
  }
}
