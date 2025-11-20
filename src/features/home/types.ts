// src/pages/home/types.ts

export interface HomeWish {
  id?: number | string;
  name: string;
  role: string;
  department?: string;
  message: string;
  time?: string;
  isDelegate?: boolean;
}

export interface StatItem {
  number: string;
  label: string;
  color: string; // ví dụ: 'text-blue-600'
}

export interface ActivityItem {
  title: string;
  description: string;
  image: string;
}
