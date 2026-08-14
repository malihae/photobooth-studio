import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import sharp from 'sharp';

const app = express();
const port = Number(process.env.PORT ?? 5000);
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB ?? 12);
const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';

app.use(helmet());
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.LOG_LEVEL === 'debug' ? 'dev' : 'combined'));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxUploadMb * 1024 * 1024 }
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/images/optimize', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image file is required' });

    const width = Number(req.body.width ?? 1280);
    const height = Number(req.body.height ?? 1024);
    const quality = Math.max(1, Math.min(100, Number(req.body.quality ?? 90)));

    const output = await sharp(req.file.buffer)
      .rotate()
      .resize(width, height, { fit: 'cover', withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();

    res.type('image/jpeg').send(output);
  } catch (error) {
    next(error);
  }
});

app.post('/api/images/crop', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image file is required' });

    const x = Math.max(0, Number(req.body.x ?? 0));
    const y = Math.max(0, Number(req.body.y ?? 0));
    const width = Math.max(1, Number(req.body.width ?? 400));
    const height = Math.max(1, Number(req.body.height ?? 400));

    const output = await sharp(req.file.buffer)
      .extract({ left: x, top: y, width, height })
      .jpeg({ quality: 90 })
      .toBuffer();

    res.type('image/jpeg').send(output);
  } catch (error) {
    next(error);
  }
});

app.post('/api/images/convert', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image file is required' });

    const format = String(req.body.format ?? 'png');
    const quality = Math.max(1, Math.min(100, Number(req.body.quality ?? 90)));
    const pipeline = sharp(req.file.buffer).rotate();

    if (format === 'jpeg') {
      const output = await pipeline.jpeg({ quality }).toBuffer();
      return res.type('image/jpeg').send(output);
    }
    if (format === 'webp') {
      const output = await pipeline.webp({ quality }).toBuffer();
      return res.type('image/webp').send(output);
    }

    const output = await pipeline.png().toBuffer();
    return res.type('image/png').send(output);
  } catch (error) {
    next(error);
  }
});

app.post('/api/images/metadata', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image file is required' });
    const metadata = await sharp(req.file.buffer).metadata();
    res.json({
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      space: metadata.space,
      channels: metadata.channels,
      sizeBytes: req.file.size
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Provider-neutral AI-art hook.
 *
 * The browser never receives a provider secret. A future provider can be
 * connected here using an environment variable and server-side SDK.
 */
app.post('/api/ai-art/transform', (_req, res) => {
  res.status(501).json({
    enabled: false,
    message: 'AI art is optional and no provider is configured. The core photobooth works without it.'
  });
});

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Photobooth backend listening on http://localhost:${port}`);
});
