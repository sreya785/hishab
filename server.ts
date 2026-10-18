import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Support high-resolution camera / photo uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const EXTRACTION_INSTRUCTION = `Read this handwritten shop ledger. Return ONLY a JSON array of rows:
[{date, description, type, amount}]. type is one of: sale, baki_given, baki_received, expense. Bangla digits (০-৯) and English digits may be mixed. If any value is unclear, return null for it. Never guess or invent numbers.`;

function extractJsonArray(text: string): unknown[] | null {
  if (!text) return null;
  const trimmed = text.trim();

  // Try direct parse
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray((parsed as Record<string, unknown>).rows)) {
      return (parsed as Record<string, unknown>).rows as unknown[];
    }
  } catch {
    // Continue to markdown / regex search
  }

  // Look for JSON markdown block or brackets [ ... ]
  const arrayMatch = trimmed.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Continue
    }
  }

  return null;
}

async function callGemmaOrGemini(
  imageBase64: string,
  mimeType: string,
  retryCount = 0
): Promise<unknown[]> {
  // Use gemini-3.8-flash (and gemini-flash-latest as fallback), which fully supports multimodal image input
  // and has free-tier quota in this environment.
  const models = ['gemini-3.8-flash', 'gemini-flash-latest'];

  const imagePart = {
    inlineData: {
      mimeType: mimeType || 'image/jpeg',
      data: imageBase64,
    },
  };

  const textPart = {
    text: EXTRACTION_INSTRUCTION,
  };

  for (const modelName of models) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: [imagePart, textPart] },
        config: {
          systemInstruction:
            'You are an expert OCR transcription assistant for handwritten Bengali khata (ledger) notebooks. You ONLY transcribe text and numbers exactly as written into the requested JSON schema: an array of [{date, description, type, amount}]. Never calculate totals, scores, or summaries. Never guess or invent numbers. If unclear, set to null.',
          responseMimeType: 'application/json',
          temperature: retryCount === 0 ? 0.1 : 0.0,
        },
      });

      const rawText = response.text || '';
      const parsed = extractJsonArray(rawText);
      if (parsed && parsed.length > 0) {
        return parsed;
      }

      // If text returned but couldn't parse as JSON array, retry once as specified
      if (rawText && !parsed && retryCount === 0) {
        return await callGemmaOrGemini(imageBase64, mimeType, 1);
      }
    } catch (err: unknown) {
      console.warn(`Extraction with ${modelName} encountered:`, (err as Error)?.message);
      // Try next model if first fails
    }
  }

  // If first attempt across models returned empty, retry once
  if (retryCount === 0) {
    return await callGemmaOrGemini(imageBase64, mimeType, 1);
  }

  return [];
}

/**
 * POST /api/extract-khata
 * Reads handwritten khata photo using Gemma / Gemini image input.
 * Strictly extracts raw rows with no calculations.
 */
app.post('/api/extract-khata', async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      res.status(400).json({
        error: 'Photo is not clear. Retake in good light, one page at a time.',
      });
      return;
    }

    // Clean data URL prefix if sent
    const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    const extractedRows = await callGemmaOrGemini(
      base64Data,
      mimeType || 'image/jpeg',
      0
    );

    if (!extractedRows || extractedRows.length === 0) {
      res.status(422).json({
        error: 'Photo is not clear. Retake in good light, one page at a time.',
      });
      return;
    }

    // Sanitize rows into KhataRow format
    const rows = (extractedRows as Record<string, unknown>[]).map((item, idx) => {
      const typeStr = String(item.type || '').toLowerCase().trim();
      let safeType: 'sale' | 'baki_given' | 'baki_received' | 'expense' | null = null;
      if (typeStr.includes('sale') || typeStr.includes('বিক্রি') || typeStr.includes('জমা')) {
        safeType = 'sale';
      } else if (typeStr.includes('baki_given') || typeStr.includes('বাকি দেওয়া')) {
        safeType = 'baki_given';
      } else if (typeStr.includes('baki_received') || typeStr.includes('বাকি আদায়')) {
        safeType = 'baki_received';
      } else if (typeStr.includes('expense') || typeStr.includes('খরচ')) {
        safeType = 'expense';
      }

      const unclearFields: ('date' | 'description' | 'type' | 'amount')[] = [];
      if (!item.date) unclearFields.push('date');
      if (!item.description) unclearFields.push('description');
      if (!safeType) unclearFields.push('type');
      if (item.amount === null || item.amount === undefined || item.amount === '') {
        unclearFields.push('amount');
      }

      return {
        id: `extracted-${Date.now()}-${idx}`,
        date: item.date ? String(item.date) : null,
        description: item.description ? String(item.description) : null,
        type: safeType,
        amount: item.amount !== undefined && item.amount !== null ? item.amount : null,
        rawAmount: item.amount ? String(item.amount) : '',
        unclearFields,
      };
    });

    res.json({ success: true, rows });
  } catch (error: unknown) {
    console.error('Extraction error:', error);
    res.status(500).json({
      error: 'Photo is not clear. Retake in good light, one page at a time.',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hishab server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
