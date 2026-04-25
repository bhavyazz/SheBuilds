import { Router } from 'express';
import multer from 'multer';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export const uploadRouter = Router();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
});

/* ── Extract text from a single PDF buffer ─────────────────────────── */
async function extractPdfText(buffer) {
  const data = new Uint8Array(buffer);
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const numPages = doc.numPages;
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map(item => item.str)
      .join(' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (pageText) fullText += pageText + '\n\n';
  }

  await doc.destroy();
  return { text: fullText.trim(), pages: numPages };
}

/* POST /api/upload/extract-text — single file text extraction ──────── */
uploadRouter.post('/extract-text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { mimetype, buffer, originalname, size } = req.file;

    // Plain text
    if (mimetype === 'text/plain' || originalname.endsWith('.txt')) {
      return res.json({
        text: buffer.toString('utf-8').trim(),
        filename: originalname,
        size,
      });
    }

    // PDF
    if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
      try {
        const result = await extractPdfText(buffer);
        if (!result.text) {
          return res.json({
            text: '',
            warning: 'This PDF appears to be image-based (scanned document). Text extraction is not possible. Please paste the content manually.',
            pages: result.pages,
            filename: originalname,
            size,
          });
        }
        return res.json({
          text: result.text,
          pages: result.pages,
          filename: originalname,
          size,
        });
      } catch (pdfErr) {
        console.error('PDF extraction error:', pdfErr.message);
        return res.status(400).json({
          error: `Could not read this PDF: ${pdfErr.message}. Try pasting the text manually.`,
        });
      }
    }

    // Images - can't extract text but acknowledge them
    if (['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(mimetype)) {
      return res.json({
        text: '',
        warning: 'Image files cannot be converted to text automatically. They have been accepted as evidence.',
        filename: originalname,
        size,
        type: 'image',
      });
    }

    // DOC/DOCX - basic extraction
    if (originalname.endsWith('.doc') || originalname.endsWith('.docx')) {
      const text = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{3,}/g, ' ');
      return res.json({
        text: text.trim(),
        filename: originalname,
        size,
        warning: 'DOC/DOCX text extraction is limited. For best results, convert to PDF first.',
      });
    }

    return res.status(400).json({ error: 'Unsupported file type. Please upload PDF, TXT, DOC, or image files.' });
  } catch (err) {
    console.error('Upload processing error:', err);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

/* POST /api/upload/evidence — multiple evidence files ──────────────── */
uploadRouter.post('/evidence', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const results = [];
    for (const file of req.files) {
      const entry = {
        filename: file.originalname,
        size: file.size,
        type: file.mimetype,
        extractedText: '',
      };

      // Try to extract text from PDFs and text files
      if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
        try {
          const result = await extractPdfText(file.buffer);
          entry.extractedText = result.text;
          entry.pages = result.pages;
        } catch (e) {
          entry.warning = 'Could not extract text from this PDF.';
        }
      } else if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
        entry.extractedText = file.buffer.toString('utf-8').trim();
      } else if (['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.mimetype)) {
        entry.type = 'image';
        entry.dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }

      results.push(entry);
    }

    res.json({ files: results, count: results.length });
  } catch (err) {
    console.error('Evidence upload error:', err);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});
