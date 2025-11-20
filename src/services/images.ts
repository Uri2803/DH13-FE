// src/services/images.ts
import api from '../lib/api';

export type ImageType = 'activities' | 'hero';

export type Image = {
  id: number;
  imageUrl: string;
  type: ImageType;
};

const BASE_PATH = '/images';

// GET: /images hoặc /images?type=hero
export async function fetchImages(type?: ImageType): Promise<Image[]> {
  if (type) {
    const data = (await api.get(BASE_PATH, {
      params: { type },
    })) as unknown as Image[];
    return data;
  }

  const data = (await api.get(BASE_PATH)) as unknown as Image[];
  return data;
}

// POST: upload nhiều file
export async function uploadImages(
  files: File[],
  type: ImageType,
): Promise<Image[]> {
  const formData = new FormData();
  formData.append('type', type);

  files.forEach((file) => {
    formData.append('image', file); // khớp FilesInterceptor('image')
  });

  const data = (await api.post(BASE_PATH, formData)) as unknown as Image[];
  return data;
}

// PUT: update 1 ảnh
export async function updateImage(
  id: number,
  file: File,
  type: ImageType,
): Promise<Image> {
  const formData = new FormData();
  formData.append('type', type);
  formData.append('image', file);

  const data = (await api.put(
    `${BASE_PATH}/${id}`,
    formData,
  )) as unknown as Image;
  return data;
}

export async function deleteImage(id: number): Promise<void> {
  await api.delete(`${BASE_PATH}/${id}`);
}
