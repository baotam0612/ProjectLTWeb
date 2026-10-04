import adminApiClient from "./adminApiClient";

export async function getPage(url, params, mapRow, signal) {
  const response = await adminApiClient.get(url, { params, signal });
  const page = response.data;
  if (!Array.isArray(page?.content)) {
    throw new Error("API chưa hỗ trợ phân trang. Hãy khởi động lại backend sau khi cập nhật.");
  }
  return { ...page, content: page.content.map(mapRow) };
}
