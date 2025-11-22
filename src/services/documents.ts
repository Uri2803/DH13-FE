// src/services/documents.ts
import api from '../lib/api';

export type CongressDocument = {
  id: number | string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize?: string | null;
  category: string;
  isPublic: boolean;
  uploadedBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchDocuments(): Promise<CongressDocument[]> {
  const res = await api.get('/documents'); // BE: GET /documents, dùng user để filter
  const data = (res as any)?.data ?? res;
  return data;
}

export async function createDocument(formData: FormData): Promise<CongressDocument> {
  const res = await api.post('/documents', formData);
  return (res as any).data ?? res;
}

export async function updateDocument(
  id: number | string,
  formData: FormData,
): Promise<CongressDocument> {
  const res = await api.patch(`/documents/${id}`, formData);
  return (res as any).data ?? res;
}

export async function deleteDocument(id: number | string): Promise<void> {
  await api.delete(`documents/${id}`);
}
