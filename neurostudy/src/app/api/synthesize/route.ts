import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildPrompt } from "@/lib/prompts";
import { StudyFormat } from "@/lib/types";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return NextResponse.json(
      {
        error:
          "Missing GEMINI_API_KEY. Create .env.local in the app root with GEMINI_API_KEY=your_key from Google AI Studio.",
      },
      { status: 503 }
    );
  }

  try {
    const { rawText, format, microMode, sourceTitle } = await req.json();

    if (typeof rawText !== "string" || !rawText.trim()) {
      return NextResponse.json(
        { error: "No text to study. Try another source or check that the PDF or page has extractable text." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = buildPrompt(rawText, format as StudyFormat, microMode, sourceTitle);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleaned = responseText
      .replace(/```json\n?/g, "")
      .replace(/```mermaid\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    if (format === "flowdiagram") {
      return NextResponse.json({
        format,
        title: sourceTitle || "Study Session",
        mermaidCode: cleaned,
      });
    }

    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      format,
      title: sourceTitle || "Study Session",
      [format === "flashcards" ? "flashcards" : format === "summary" ? "summary" : "qa"]: parsed,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Synthesis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
