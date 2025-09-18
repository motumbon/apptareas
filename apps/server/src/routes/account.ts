import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const accountRouter = Router();

// Aplicar autenticación a todas las rutas
accountRouter.use(requireAuth);

// Esquemas de validación
const updateProfileSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

// Actualizar perfil
accountRouter.put('/profile', async (req: AuthRequest, res) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { username, email } = parsed.data;

    // Verificar que el username y email no estén en uso por otro usuario
    const existing = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: req.userId } },
          { OR: [{ email }, { username }] }
        ]
      }
    });
    
    if (existing) {
      return res.status(409).json({ error: 'Usuario o email ya están en uso' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { username, email },
      select: { id: true, username: true, email: true }
    });

    res.json({ user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Cambiar contraseña
accountRouter.put('/password', async (req: AuthRequest, res) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.userId },
      data: { passwordHash: newPasswordHash }
    });

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Eliminar cuenta
accountRouter.delete('/account', async (req: AuthRequest, res) => {
  try {
    // Eliminar todas las tareas del usuario
    await prisma.task.deleteMany({
      where: { userId: req.userId }
    });

    // Eliminar el usuario
    await prisma.user.delete({
      where: { id: req.userId }
    });

    res.json({ message: 'Cuenta eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export { accountRouter };
