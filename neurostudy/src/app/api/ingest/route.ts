import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import pdfParse from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // Handle PDF upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = await pdfParse(buffer);
      const rawText = (parsed.text || "").trim();
      if (!rawText) {
        return NextResponse.json(
          { error: "Could not extract text from this PDF. It may be scanned images only." },
          { status: 400 }
        );
      }
      return NextResponse.json({
        rawText,
        sourceTitle: file.name.replace(/\.pdf$/i, ""),
        inputType: "pdf",
      });
    }

    // Handle URL (YouTube or article)
    const { url, inputType } = await req.json();

    if (inputType === "youtube") {
      const videoId = extractYouTubeId(url);
      if (!videoId) return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });

      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      const rawText = transcript.map((t) => t.text).join(" ").trim();
      if (!rawText) {
        return NextResponse.json(
          { error: "No transcript text found for this video." },
          { status: 400 }
        );
      }
      return NextResponse.json({ rawText, sourceTitle: "YouTube Video", inputType: "youtube" });
    }

    if (inputType === "article") {
      const response = await fetch(url);
      const html = await response.text();
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      if (!article) return NextResponse.json({ error: "Could not parse article" }, { status: 400 });

      const rawText = (article.textContent || "").trim();
      if (!rawText) {
        return NextResponse.json(
          { error: "Article text was empty after extraction. The page may require login or block scraping." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        rawText,
        sourceTitle: article.title || "Article",
        inputType: "article",
      });
    }

    return NextResponse.json({ error: "Unknown input type" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Ingestion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/
  );
  return match ? match[1] : null;
}
