import axios from 'axios';
import { ChatbotResponse, ChatHistoryItem } from '../types/chat';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

const apiClient = axios.create({
  baseURL: API_URL,
});

export const chatService = {
  sendMessage: async (
    question: string,
    role: string,
    chatHistory: ChatHistoryItem[],
    images: File[] = [],
    isFormSubmit = false,
    formPayload?: Record<string, unknown>
  ) => {
    const formData = new FormData();
    formData.append('question', question);
    formData.append('role', role);
    formData.append('chat_history', JSON.stringify(chatHistory));
    formData.append('is_form_submit', String(isFormSubmit));
    if (formPayload) {
      formData.append('form_payload', JSON.stringify(formPayload));
    }
    images.forEach(f => formData.append('images', f));

    const response = await apiClient.post<ChatbotResponse>('/chatbot/', formData);
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get('/categories/');
    return response.data;
  },

  getBrands: async () => {
    const response = await apiClient.get('/brand/');
    return response.data;
  },
};

export interface BrandItem {
  id: string;
  name: string;
}

export const brandService = {
  list: async () => {
    const response = await apiClient.get<BrandItem[]>('/brand/');
    return response.data;
  },

  create: async (name: string) => {
    const response = await apiClient.post<BrandItem>('/brand/', { name });
    return response.data;
  },

  update: async (id: string, name: string) => {
    const response = await apiClient.patch<BrandItem>(`/brand/${id}/`, { name });
    return response.data;
  },

  remove: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(`/brand/${id}/`);
    return response.data;
  },
};

export default apiClient;
