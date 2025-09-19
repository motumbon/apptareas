import axios from 'axios';
import { AuthResponse, LoginData, RegisterData, Task, CreateTaskData, UpdateTaskData } from '../types';

// Base URL de la API: usa VITE_API_URL si está presente, con fallback en dev
const DEFAULT_API = 'http://localhost:3000/api';
const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API;

if (!import.meta.env.VITE_API_URL) {
  // Aviso en desarrollo si no está configurada la variable
  console.warn('[API] VITE_API_URL no está definido. Usando fallback:', DEFAULT_API);
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar el token JWT a todas las requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  updateProfile: async (data: { username: string; email: string }) => {
    const response = await api.put('/account/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/account/password', data);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/account/account');
    return response.data;
  },
};

export const tasksAPI = {
  getPending: async (): Promise<Task[]> => {
    const response = await api.get('/tasks/pending');
    return response.data;
  },

  getCompleted: async (): Promise<Task[]> => {
    const response = await api.get('/tasks/completed');
    return response.data;
  },

  create: async (data: CreateTaskData): Promise<Task> => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  getById: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateTaskData): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  complete: async (id: string): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}/complete`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

export default api;
