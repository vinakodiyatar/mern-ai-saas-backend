import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

const formatContent = (content) => {
  const { keyword, module, result, provider } = content;
  const lines = [];
  lines.push(`Module: ${module}`);
  lines.push(`Keyword/Product: ${keyword || "N/A"}`);
  lines.push(`Provider: ${provider}`);
  if (result.metaTitle) lines.push(`Meta Title: ${result.metaTitle}`);
  if (result.metaDescription) lines.push(`Meta Description: ${result.metaDescription}`);
  if (result.outline) lines.push("Outline: " + result.outline.join(" | "));
  if (result.ads) {
    result.ads.forEach((ad, idx) =>
      lines.push(`Ad ${idx + 1}: ${ad.headline1} / ${ad.description1}`)
    );
  }
  return lines.join("\n");
};

export const buildPdf = (content) => {
  const doc = new PDFDocument({ margin: 40 });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));

  doc.fontSize(18).text("AI Marketing Output", { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(formatContent(content));
  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
};

export const buildDocx = async (content) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "AI Marketing Output",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph(""),
          ...formatContent(content)
            .split("\n")
            .map((line) => new Paragraph({ children: [new TextRun(line)] })),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
};
