import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { submitRoute } from './routes/submit.js';
import { adminRoute } from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api', submitRoute);
app.use('/api/admin', adminRoute);

// In production, serve the built frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (_req, res) => {
    res.sendFile('index.html', { root: 'dist' });
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
