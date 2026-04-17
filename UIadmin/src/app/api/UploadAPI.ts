import { apiClient } from '../../services/apiClient';

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.postFormData('/admin/images/upload', formData);
    //Dùng Cloudinary 
    return response.secure_url || response.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
