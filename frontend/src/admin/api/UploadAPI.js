import adminApiClient from "./adminApiClient";
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await adminApiClient.post("/api/admin/images/upload", formData);
    return response.data.secure_url || response.data.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
