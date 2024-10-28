import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface FileRecord {
  date: string;
  title: string;
}

interface QueryParams {
  order?: "asc" | "desc" | "date";
}

function compareTitle(
  a: string,
  b: string,
  order: "asc" | "desc" | "date",
): number {
  // Extract numbers from titles for natural sorting
  const numberPattern = /\d+|\D+/g;
  const aParts = a.match(numberPattern) || [];
  const bParts = b.match(numberPattern) || [];

  const minLength = Math.min(aParts.length, bParts.length);

  for (let i = 0; i < minLength; i++) {
    const aNum = parseInt(aParts[i]);
    const bNum = parseInt(bParts[i]);

    if (!isNaN(aNum) && !isNaN(bNum)) {
      // Both parts are numbers
      if (aNum !== bNum) {
        return order === "asc" ? aNum - bNum : bNum - aNum;
      }
    } else {
      // String comparison for non-numeric parts
      const comparison = aParts[i].localeCompare(bParts[i]);
      if (comparison !== 0) {
        return order === "asc" ? comparison : -comparison;
      }
    }
  }

  // If all parts are equal up to the shortest length, sort by length
  return order === "asc"
    ? aParts.length - bParts.length
    : bParts.length - aParts.length;
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const params: QueryParams = {
      order: (searchParams.get("order") as "asc" | "desc" | "date") || "asc",
    };

    // Read and parse the file
    const filePath = path.join(process.cwd(), "public", "data.csv");
    const fileContent = await fs.readFile(filePath, "utf-8");

    const records: FileRecord[] = fileContent
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const [dateTime, title] = line.trim().split(";");
        return {
          date: dateTime.trim(),
          title: title.trim(),
        };
      });

    let sortedRecords = [];
    if (params.order === "date") {
      console.log("here");
      sortedRecords = records.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      });
    } else {
      sortedRecords = records.sort((a, b) => {
        return compareTitle(a.title, b.title, params.order || "asc");
      });
    }

    return NextResponse.json({
      success: true,
      data: sortedRecords,
      metadata: {
        total: sortedRecords.length,
        filters: {
          order: params.order,
        },
      },
    });
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process file",
      },
      { status: 500 },
    );
  }
}
