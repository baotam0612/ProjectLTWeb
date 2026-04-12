import { authService } from './authService';

const API_BASE = 'http://localhost:8081/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE) {
    this.baseURL = baseURL;
  }

  private getHeaders(isFormData: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {};
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const token = authService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      let errorData = null;

      try {
        if (contentType?.includes('application/json')) {
          errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          errorMessage = await response.text();
        }
      } catch (e) {
        // Use default error message if parsing fails
      }

      const error: ApiError = {
        message: errorMessage,
        status: response.status,
        data: errorData,
      };

      throw error;
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    try {
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else if (contentType?.includes('text/html')) {
        return (await response.text()) as T;
      } else {
        return (await response.blob()) as T;
      }
    } catch (e) {
      return {} as T;
    }
  }

  async get<T = any>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, {
      ...options,
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T = any>(
    url: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, {
      ...options,
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T = any>(
    url: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, {
      ...options,
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, {
      ...options,
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T = any>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, {
      ...options,
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async postFormData<T = any>(
    url: string,
    formData: FormData,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, {
      ...options,
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData,
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
