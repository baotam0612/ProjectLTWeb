import axios from 'axios';
import { Material } from '../data/mockData';

const API_URL = 'http://localhost:8081/admin/materials';

// Map API response to Material interface
const mapApiMaterialToMaterial = (apiMaterial: any, index: number): Material => {
  return {
    id: apiMaterial.materialID || apiMaterial.id || `M${String(index + 1).padStart(3, '0')}`,
    name: apiMaterial.materialName || '',
    quantity: apiMaterial.quantity || 0,
    supplier: apiMaterial.supplier || 'Unknown',
    unitPrice: apiMaterial.unitPrice || 0,
    lastUpdated: apiMaterial.lastUpdated || new Date().toISOString().split('T')[0],
    composition: apiMaterial.composition || '',
    weight: apiMaterial.weight || '',
    purity: apiMaterial.purity || '',
  };
};

export const getMaterials = async (): Promise<Material[]> => {
  const response = await axios.get(API_URL);
  // Response structure: { data: [...], message, status }
  const materials = Array.isArray(response.data) ? response.data : (response.data.data || []);
  return Array.isArray(materials)
    ? materials.map((material: any, index: number) => mapApiMaterialToMaterial(material, index))
    : [];
};

const mapFormToPayload = (data: any) => ({
  materialName: data.name,
  composition: data.composition,
  weight: data.weight,
  purity: data.purity,
  unit: data.unit || ''
});

export const createMaterial = async (data: any): Promise<Material> => {
  const response = await axios.post(API_URL, mapFormToPayload(data));
  const materialData = response.data.data || response.data;
  return mapApiMaterialToMaterial(materialData, 0);
};

export const updateMaterial = async (id: number | string, data: any): Promise<Material> => {
  const response = await axios.put(`${API_URL}/${id}`, mapFormToPayload(data));
  const materialData = response.data.data || response.data;
  return mapApiMaterialToMaterial(materialData, 0);
};

export const deleteMaterial = async (id: number | string) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
