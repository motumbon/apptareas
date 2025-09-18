import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AuthResponse, LoginData, RegisterData, Task, CreateTaskData, UpdateTaskData } from '../types';

// Cambia esta URL por la de tu API en Railway cuando la despliegues
const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar el token JWT a todas las requests
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      // Aquí podrías navegar al login, pero lo manejaremos en el contexto
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
