import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth-export.js';
import { tasksRouter } from './routes/tasks.js';
import { accountRouter } from './routes/account.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ ok: true, name: 'App Tareas API', version: '0.1.0' });
});

app.use('/api/auth', authRouter);
app.use('/api/account', accountRouter);
app.use('/api/tasks', tasksRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
