import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "theme-settings.db");

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const getDb = async () => {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.verbose().Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS themes (
      userId TEXT PRIMARY KEY,
      themeData TEXT NOT NULL
    )
  `);

  return db;
};

export async function GET(request: NextRequest) {
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
      "SELECT themeData FROM themes WHERE userId = ?",
      userId
    );
    await db.close();

    if (result) {
      return NextResponse.json({ theme: JSON.parse(result.themeData) });
    }

    return NextResponse.json({ theme: null });
  } catch (error) {
    console.error("Error retrieving theme:", error);
    return NextResponse.json(
      { error: "Failed to retrieve theme" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, themeData } = body;

    if (!userId || !themeData) {
      return NextResponse.json(
        { error: "User ID and theme data are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const themeDataJson = JSON.stringify(themeData);

    await db.run(
      "INSERT OR REPLACE INTO themes (userId, themeData) VALUES (?, ?)",
      [userId, themeDataJson]
    );

    await db.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving theme:", error);
    return NextResponse.json(
      { error: "Failed to save theme" },
      { status: 500 }
    );
  }
}
