import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const prisma = new PrismaClient();
export const tasksRouter = Router();

tasksRouter.use(requireAuth);

const checkboxSchema = z.object({
  id: z.string(),
  text: z.string(),
  checked: z.boolean(),
});

const createTaskSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  comment: z.string().optional().default(''),
  checkboxes: z.array(checkboxSchema).optional().default([]),
});

const updateTaskSchema = z.object({
  name: z.string().min(1).optional(),
  comment: z.string().optional(),
  checkboxes: z.array(checkboxSchema).optional(),
  completed: z.boolean().optional(),
});

// Helper function to parse tasks with checkboxes
const parseTask = (task: any) => ({
  ...task,
  checkboxes: JSON.parse(task.checkboxes || '[]'),
});

// Listado de pendientes
tasksRouter.get('/pending', async (req: AuthRequest, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.userId!, completed: false },
    orderBy: { createdAt: 'desc' },
  });
  res.json(tasks.map(parseTask));
});

// Listado de completadas
tasksRouter.get('/completed', async (req: AuthRequest, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.userId!, completed: true },
    orderBy: { completedAt: 'desc' },
  });
  res.json(tasks.map(parseTask));
});

// Crear tarea
tasksRouter.post('/', async (req: AuthRequest, res) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { name, comment, checkboxes } = parsed.data;
  const task = await prisma.task.create({ 
    data: { 
      name, 
      comment, 
      checkboxes: JSON.stringify(checkboxes), 
      userId: req.userId! 
    } 
  });
  res.status(201).json(parseTask(task));
});

// Obtener por id
tasksRouter.get('/:id', async (req: AuthRequest, res) => {
  const task = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.userId! } });
  if (!task) return res.status(404).json({ error: 'No encontrada' });
  res.json(parseTask(task));
});

// Editar
tasksRouter.put('/:id', async (req: AuthRequest, res) => {
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const data = parsed.data as any;
  if (data.checkboxes) {
    data.checkboxes = JSON.stringify(data.checkboxes);
  }
  if (data.completed === true) {
    data.completedAt = new Date();
  } else if (data.completed === false) {
    data.completedAt = null;
  }
  try {
    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data,
    });
    if (updated.userId !== req.userId) return res.status(403).json({ error: 'Prohibido' });
    res.json(parseTask(updated));
  } catch (e) {
    res.status(404).json({ error: 'No encontrada' });
  }
});

// Completar
tasksRouter.patch('/:id/complete', async (req: AuthRequest, res) => {
  try {
    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: { completed: true, completedAt: new Date() },
    });
    if (updated.userId !== req.userId) return res.status(403).json({ error: 'Prohibido' });
    res.json(parseTask(updated));
  } catch (e) {
    res.status(404).json({ error: 'No encontrada' });
  }
});

// Eliminar
tasksRouter.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const task = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.userId! } });
    if (!task) return res.status(404).json({ error: 'No encontrada' });
    
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(404).json({ error: 'No encontrada' });
  }
});
