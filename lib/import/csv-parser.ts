export interface ParsedFilm {
  title: string;
  year?: string;
  rating?: number;
  date?: string;
}

export interface CSVParseResult {
  success: boolean;
  films: ParsedFilm[];
  totalParsed: number;
  skippedDuplicates: number;
  error?: string;
}

/**
 * Parses a standard CSV string handling quotes, commas, CRLF, and UTF-8 BOM.
 */
function parseCSVRows(csvText: string): string[][] {
  const cleanText = csvText.replace(/^\uFEFF/, "").trim();
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      currentRow.push(currentField.trim());
      if (currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parses Letterboxd watched.csv / diary.csv / lists export files.
 */
export function parseLetterboxdCSV(csvContent: string): CSVParseResult {
  if (!csvContent || !csvContent.trim()) {
    return {
      success: false,
      films: [],
      totalParsed: 0,
      skippedDuplicates: 0,
      error: "The CSV file is empty.",
    };
  }

  const rows = parseCSVRows(csvContent);
  if (rows.length < 2) {
    return {
      success: false,
      films: [],
      totalParsed: 0,
      skippedDuplicates: 0,
      error: "CSV must contain a header row and at least one data row.",
    };
  }

  const headerRow = rows[0]!.map((h) => h.toLowerCase().trim());

  // Find column indices
  const titleIdx = headerRow.findIndex((h) => ["name", "title", "film"].includes(h));
  const yearIdx = headerRow.findIndex((h) => ["year", "release year"].includes(h));
  const ratingIdx = headerRow.findIndex((h) => ["rating"].includes(h));
  const dateIdx = headerRow.findIndex((h) => ["date", "watched date"].includes(h));

  if (titleIdx === -1) {
    return {
      success: false,
      films: [],
      totalParsed: 0,
      skippedDuplicates: 0,
      error: "Missing required 'Name' or 'Title' column in CSV.",
    };
  }

  const films: ParsedFilm[] = [];
  const seen = new Set<string>();
  let skippedDuplicates = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    const rawTitle = row[titleIdx]?.trim();
    if (!rawTitle) continue;

    const rawYear = yearIdx !== -1 ? row[yearIdx]?.trim() : undefined;
    const yearMatch = rawYear?.match(/\b(19\d\d|20\d\d)\b/)?.[1];

    const dedupeKey = `${rawTitle.toLowerCase()}::${yearMatch ?? ""}`;
    if (seen.has(dedupeKey)) {
      skippedDuplicates++;
      continue;
    }
    seen.add(dedupeKey);

    let rating: number | undefined;
    if (ratingIdx !== -1 && row[ratingIdx]) {
      const num = parseFloat(row[ratingIdx]!);
      if (!isNaN(num) && num > 0) {
        // Letterboxd uses 0.5 - 5.0 stars, convert to 1-10 if needed
        rating = num <= 5 ? Math.round(num * 2) : Math.round(num);
      }
    }

    films.push({
      title: rawTitle,
      year: yearMatch,
      rating,
      date: dateIdx !== -1 ? row[dateIdx] : undefined,
    });

    // Cap at 100 films per import for reliability
    if (films.length >= 100) break;
  }

  if (films.length === 0) {
    return {
      success: false,
      films: [],
      totalParsed: 0,
      skippedDuplicates,
      error: "No valid movie titles could be found in the CSV.",
    };
  }

  return {
    success: true,
    films,
    totalParsed: films.length,
    skippedDuplicates,
  };
}
