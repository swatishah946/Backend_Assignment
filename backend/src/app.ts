import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middlewares/errorHandler.js';
import { v1Router } from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openapiPath = path.join(__dirname, 'config', 'openapi.json');
const openapiDocument = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));

const app = express();

// Trust reverse proxy (Nginx)
app.set('trust proxy', 1);

// Serve Swagger Docs API Explorer
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// Security Hardening Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' })); // Prevents large payload DOS attacks

// Rate Limiting to prevent brute-force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

app.use('/api/', apiLimiter);

// API Versioning routing
app.use('/api/v1', v1Router);

// Root route check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Global Unhandled Error Boundary
app.use(errorHandler);

export default app;
