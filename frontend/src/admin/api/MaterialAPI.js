import { getPage } from "./pagedApi";
import adminApiClient from "./adminApiClient";
const API_URL = "/admin/materials";
const mapApiMaterialToMaterial = (apiMaterial, index) => {
  return {
    id: apiMaterial.materialID || apiMaterial.id || `M${String(index + 1).padStart(3, "0")}`,
    name: apiMaterial.materialName || "",
    quantity: apiMaterial.quantity || 0,
    supplier: apiMaterial.supplier || "Unknown",
    unitPrice: apiMaterial.unitPrice || 0,
    lastUpdated: apiMaterial.lastUpdated || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    composition: apiMaterial.composition || "",
    weight: apiMaterial.weight || "",
    purity: apiMaterial.purity || ""
  };
};
export const getMaterials = async () => {
  const response = await adminApiClient.get(API_URL);
  const materials = Array.isArray(response.data) ? response.data : response.data.data || [];
  return Array.isArray(materials) ? materials.map((material, index) => mapApiMaterialToMaterial(material, index)) : [];
};
const mapFormToPayload = (data) => ({
  materialName: data.name,
  composition: data.composition,
  weight: data.weight,
  purity: data.purity,
  unit: data.unit || ""
});
export const createMaterial = async (data) => {
  const response = await adminApiClient.post(API_URL, mapFormToPayload(data));
  const materialData = response.data.data || response.data;
  return mapApiMaterialToMaterial(materialData, 0);
};
export const updateMaterial = async (id, data) => {
  const response = await adminApiClient.put(`${API_URL}/${id}`, mapFormToPayload(data));
  const materialData = response.data.data || response.data;
  return mapApiMaterialToMaterial(materialData, 0);
};
export const deleteMaterial = async (id) => {
  const response = await adminApiClient.delete(`${API_URL}/${id}`);
  return response.data;
};

export const getMaterialsPage = (params, signal) => getPage(API_URL, params, mapApiMaterialToMaterial, signal);
