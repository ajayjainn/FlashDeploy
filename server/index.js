import express from 'express';
import dotenv from 'dotenv';
import expressHttpProxy from 'express-http-proxy';
import mongoose from 'mongoose';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import awsRouter from './routes/aws.js';
import authRouter from './routes/auth.js';
import repoRouter from './routes/repository.js';
import projectsRouter from './routes/projects.js';
import { authenticateJWT, optionalJWT } from './middlewares/auth.js';
const __dirname = path.resolve();

dotenv.config();
const app = express();

const bucketName = process.env.AWS_BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION;


// CORS configuration for development and production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'http://localhost:3000'
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());
// app.use(passport.session());

// Optional JWT authentication for all routes
app.use(optionalJWT);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));


const staticMiddleware = express.static(path.join(__dirname, 'dist'), {
  index: false,
});

function subdomainCount(host = '') {
  return host.split('.').length - 2;
}

app.use((req, res, next) => {
  const host = req.headers.host || '';
  const isRootApp = (
    process.env.NODE_ENV !== 'production' ||
    subdomainCount(host) === 1
  );

  if (isRootApp) {
    return staticMiddleware(req, res, next);
  }
  next();
});

app.get(
  ['/', '/login', '/callback', '/dashboard', '/dashboard/*'],
  (req, res, next) => {
    const host = req.headers.host || '';
    const isRootApp = (
      process.env.NODE_ENV !== 'production' ||
      subdomainCount(host) === 1
    );
    if (isRootApp) {
      return res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
    next();
  }
);



// Routes
app.use('/api/deploy', awsRouter);
app.use('/api/auth', authRouter);
app.use('/api/repositories', authenticateJWT, repoRouter);
app.use('/api/projects', authenticateJWT, projectsRouter);

// Catch all frontend routes for SPA
app.get(['/callback', '/login', '/dashboard', '/dashboard/*', '/'], (req, res, next) => {
  // In production, only serve index.html if there are exactly 2 subdomains
  if (process.env.NODE_ENV === 'production') {
    const host = req.headers.host;
    // Count the number of subdomains (e.g. app.example.com has 1, sub.app.example.com has 2)
    const subdomainCount = host.split('.').length-2; 
    console.log(host.split('.'));
    console.log(subdomainCount);
    if (subdomainCount === 1) {
      return res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    } else {
      // Continue to next handler (likely the proxy)
      return next();
    }
  } else {
    console.log('Development mode');
    // In development, always serve index.html for SPA routes
    return res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  }
});

// Test route
app.get('/test', (req, res) => {
  res.status(200).send('Hello World');
});

// S3 proxy route - this should be last to avoid capturing SPA routes
const proxy = expressHttpProxy(`https://${bucketName}.s3.${AWS_REGION}.amazonaws.com`, {
  proxyReqPathResolver: function (req) {
    const path = req.url === '/' ? '/index.html' : req.url;
    return `/build/${req.headers.host.split('.')[0]}${path}`;
  }
});

const exampleMiddleware = (req, res, next) => {
  console.log('Req is being proxied');
  next();
}

// This now only captures routes not handled by the above handlers
app.use('/', exampleMiddleware, proxy);

app.listen(5001, () => {
  console.log('Server is running on port 5001');
});

export default app;