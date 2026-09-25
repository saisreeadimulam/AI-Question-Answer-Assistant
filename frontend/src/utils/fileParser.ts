import { jsPDF } from "jspdf";
import mammoth from "mammoth";
import JSZip from "jszip";

export interface ParsingProgress {
  status: "idle" | "reading" | "parsing" | "converting" | "complete" | "error";
  message: string;
}

export type SupportedFileType = "pdf" | "ppt" | "image" | "text" | "doc";

/**
 * Validates file type and size.
 */
export function validateFile(file: File): { valid: boolean; error?: string; type?: SupportedFileType } {
  const fileName = file.name.toLowerCase();
  const fileSizeMB = file.size / (1024 * 1024);

  if (fileSizeMB > 50) {
    return { valid: false, error: "File size exceeds 50MB limit." };
  }

  if (fileName.endsWith(".pdf")) {
    return { valid: true, type: "pdf" };
  }
  if (fileName.endsWith(".ppt") || fileName.endsWith(".pptx")) {
    return { valid: true, type: "ppt" };
  }
  if (
    fileName.endsWith(".png") ||
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".jpeg") ||
    fileName.endsWith(".webp")
  ) {
    return { valid: true, type: "image" };
  }
  if (fileName.endsWith(".txt") || fileName.endsWith(".docx")) {
    return { valid: true, type: fileName.endsWith(".docx") ? "doc" : "text" };
  }

  return {
    valid: false,
    error: "Unsupported file format. Please upload PDF, PPT/PPTX, Image (PNG/JPG/WEBP), TXT, or DOCX.",
  };
}

/**
 * Parses non-PDF files (.txt, .docx, .pptx, .png, .jpg, .jpeg, .webp) and returns a PDF File blob,
 * ensuring seamless ingestion into the backend PyPDFLoader pipeline without breaking existing backend logic.
 */
export async function parseAndPrepareFile(
  file: File,
  onProgress?: (progress: ParsingProgress) => void
): Promise<File> {
  const fileName = file.name.toLowerCase();

  // If already a PDF, return as is
  if (fileName.endsWith(".pdf")) {
    onProgress?.({ status: "complete", message: "PDF ready for ingestion" });
    return file;
  }

  onProgress?.({ status: "reading", message: `Reading ${file.name}...` });

  // 1. Plain Text (.txt)
  if (fileName.endsWith(".txt")) {
    const text = await readAsText(file);
    onProgress?.({ status: "converting", message: "Formatting document text into PDF..." });
    return createPdfFromText(text, file.name);
  }

  // 2. Microsoft Word Document (.docx)
  if (fileName.endsWith(".docx")) {
    onProgress?.({ status: "parsing", message: "Extracting Word document structure & text..." });
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value || "No readable text found in document.";
    onProgress?.({ status: "converting", message: "Converting document layout to PDF..." });
    return createPdfFromText(text, file.name);
  }

  // 3. PowerPoint Presentation (.pptx / .ppt)
  if (fileName.endsWith(".pptx") || fileName.endsWith(".ppt")) {
    onProgress?.({ status: "parsing", message: "Parsing presentation slides & text..." });
    try {
      const text = await extractTextFromPptx(file);
      onProgress?.({ status: "converting", message: "Formatting slides into PDF document..." });
      return createPdfFromText(text, file.name);
    } catch (e: any) {
      console.warn("PPTX zip extraction failed, falling back to text stream:", e);
      const text = await readAsText(file);
      return createPdfFromText(`[Presentation Content: ${file.name}]\n\n${text}`, file.name);
    }
  }

  // 4. Images (.png, .jpg, .jpeg, .webp)
  if (
    fileName.endsWith(".png") ||
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".jpeg") ||
    fileName.endsWith(".webp")
  ) {
    onProgress?.({ status: "parsing", message: "Processing image & generating document container..." });
    return createPdfFromImage(file);
  }

  throw new Error(`Unsupported file type: ${file.name}`);
}

/** Helper: Read file as text string */
function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/** Helper: Extract slide text from PPTX files using JSZip */
async function extractTextFromPptx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  const slideFiles = Object.keys(zip.files).filter((path) =>
    path.startsWith("ppt/slides/slide") && path.endsWith(".xml")
  );

  // Sort slides numerically (slide1, slide2, slide10...)
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, "") || "0", 10);
    const numB = parseInt(b.replace(/[^0-9]/g, "") || "0", 10);
    return numA - numB;
  });

  const extractedSlides: string[] = [];

  for (let i = 0; i < slideFiles.length; i++) {
    const slideXmlStr = await zip.files[slideFiles[i]].async("text");
    // Extract text inside <a:t> XML tags
    const matches = slideXmlStr.match(/<a:t[^>]*>(.*?)<\/a:t>/g) || [];
    const slideText = matches
      .map((tag) => tag.replace(/<[^>]+>/g, "").trim())
      .filter((t) => t.length > 0)
      .join(" ");

    if (slideText) {
      extractedSlides.push(`--- SLIDE ${i + 1} ---\n${slideText}`);
    }
  }

  if (extractedSlides.length === 0) {
    return `[Presentation Document: ${file.name}]\nSlide content indexed.`;
  }

  return `DOCUMENT: ${file.name}\nPRESENTATION SLIDES SUMMARY\n\n` + extractedSlides.join("\n\n");
}

/** Helper: Convert raw text string into a formatted PDF file using jsPDF */
function createPdfFromText(text: string, originalFilename: string): File {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxLineWidth = pageWidth - margin * 2;
  const lineHeight = 16;
  let cursorY = margin + 20;

  // Title Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text(`Document: ${originalFilename}`, margin, cursorY);
  cursorY += 25;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, cursorY - 10, pageWidth - margin, cursorY - 10);

  // Content Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  const lines = doc.splitTextToSize(text, maxLineWidth);

  for (let i = 0; i < lines.length; i++) {
    if (cursorY + lineHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
    }
    doc.text(lines[i], margin, cursorY);
    cursorY += lineHeight;
  }

  const pdfBlob = doc.output("blob");
  const cleanName = originalFilename.replace(/\.[^/.]+$/, "") + ".pdf";
  return new File([pdfBlob], cleanName, { type: "application/pdf" });
}

/** Helper: Embed Image into PDF */
function createPdfFromImage(imageFile: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const doc = new jsPDF({
          unit: "pt",
          format: "a4",
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 30;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`Image Asset: ${imageFile.name}`, margin, margin + 10);

        // Scale image to fit page
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 3 - 20;

        let renderWidth = img.width;
        let renderHeight = img.height;

        const ratio = Math.min(availableWidth / renderWidth, availableHeight / renderHeight);
        renderWidth = renderWidth * ratio;
        renderHeight = renderHeight * ratio;

        const imageFormat = imageFile.type.includes("png") ? "PNG" : "JPEG";
        doc.addImage(img, imageFormat, margin, margin + 30, renderWidth, renderHeight);

        const pdfBlob = doc.output("blob");
        const cleanName = imageFile.name.replace(/\.[^/.]+$/, "") + ".pdf";
        resolve(new File([pdfBlob], cleanName, { type: "application/pdf" }));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}
