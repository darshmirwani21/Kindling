import { StudyFormat } from "./types";

export function buildPrompt(
  rawText: string,
  format: StudyFormat,
  microMode: boolean,
  sourceTitle?: string
): string {
  const microInstructions = microMode
    ? `
IMPORTANT — Micro Mode is ON. You MUST follow these rules:
- Keep every single piece of text SHORT. No sentence over 20 words.
- Use simple, direct language. No jargon unless absolutely necessary.
- Break everything into the smallest possible chunks.
- Use active voice. Make it engaging, not dry.
- Add a brief motivational nudge at the very end (1 sentence max).
`
    : "";

  const sourceLine = sourceTitle
    ? `The source material is titled: "${sourceTitle}".`
    : "";

  const formatInstructions: Record<StudyFormat, string> = {
    flashcards: `
Generate a set of 10-15 flashcards from the study material below.
Return ONLY a valid JSON array. No markdown, no explanation, no backticks.
Each object must have exactly two fields: "front" (the question or term) and "back" (the answer or definition).
Example format:
[{"front": "What is mitosis?", "back": "Cell division producing two identical daughter cells."}]
`,
    summary: `
Generate a structured study summary from the material below.
Return ONLY a valid JSON array. No markdown, no explanation, no backticks.
Each object must have exactly two fields: "heading" (a short section title, max 5 words) and "body" (2-4 sentences summarizing that section).
Aim for 5-8 chunks total.
Example format:
[{"heading": "What is Photosynthesis", "body": "Plants convert sunlight into glucose. This process happens in the chloroplasts."}]
`,
    qa: `
Generate 8-12 Socratic-style quiz questions from the material below.
Return ONLY a valid JSON array. No markdown, no explanation, no backticks.
Each object must have exactly two fields: "question" (what you'd ask the student) and "answer" (the correct answer, 1-3 sentences).
Make questions progressively harder — start simple, end with application/analysis.
Example format:
[{"question": "What does DNA stand for?", "answer": "Deoxyribonucleic acid. It carries the genetic instructions for all living organisms."}]
`,
    flowdiagram: `
Generate a Mermaid.js flowchart that maps the key concepts and their relationships from the study material below.
Return ONLY the raw Mermaid syntax. No markdown fences, no explanation, no backticks, no "mermaid" label.
Start directly with "flowchart TD" on the first line.
Use short node labels (max 5 words each). Include 8-15 nodes. Show cause/effect, sequence, or hierarchy as appropriate.
Example format:
flowchart TD
  A[Photosynthesis] --> B[Light Reactions]
  A --> C[Calvin Cycle]
  B --> D[ATP + NADPH]
  C --> E[Glucose]
`,
  };

  return `${microInstructions}
${sourceLine}
${formatInstructions[format]}

--- STUDY MATERIAL START ---
${rawText.slice(0, 12000)}
--- STUDY MATERIAL END ---
`;
}
