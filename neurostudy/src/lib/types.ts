export type StudyFormat = "flashcards" | "summary" | "qa" | "flowdiagram";

export type InputType = "youtube" | "pdf" | "article";

export interface Flashcard {
  front: string;
  back: string;
}

export interface SummaryChunk {
  heading: string;
  body: string;
}

export interface QAItem {
  question: string;
  answer: string;
}

export interface StudyOutput {
  format: StudyFormat;
  title: string;
  flashcards?: Flashcard[];
  summary?: SummaryChunk[];
  qa?: QAItem[];
  mermaidCode?: string;
}

export interface IngestRequest {
  url?: string;
  inputType: InputType;
}

export interface SynthesizeRequest {
  rawText: string;
  format: StudyFormat;
  microMode: boolean;
  sourceTitle?: string;
}
