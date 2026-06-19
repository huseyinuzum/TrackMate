import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator, localhost for iOS
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

let authToken: string | null = null;

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category?: string;
  estimated_time_mins: number;
}

export interface RoutePlace {
  id: string;
  step_order: number;
  arrival_time: string;
  departure_time: string;
  travel_time_from_prev: number;
  place: Place;
}

export interface Route {
  id: string;
  name: string;
  total_duration_mins: number;
  user_prompt?: string;
  ai_response?: string;
  places: RoutePlace[];
}

export const api = {
  setToken(token: string) {
    authToken = token;
  },

  getToken() {
    return authToken;
  },

  logout() {
    authToken = null;
  },

  async request<T>(endpoint: string, options: any = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Bir hata oluştu.';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  },

  async register(username: string, email: string, password: string): Promise<any> {
    const res = await this.request<any>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  },

  async login(email: string, password: string): Promise<any> {
    const res = await this.request<any>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  },

  async getRoutes(): Promise<Route[]> {
    return this.request<Route[]>('/api/v1/routes', {
      method: 'GET',
    });
  },

  async generateRoute(payload: {
    query: string;
    lat?: number;
    lon?: number;
  }): Promise<Route> {
    return this.request<Route>('/api/v1/routes/generate', {
      method: 'POST',
      body: JSON.stringify({
        query: payload.query,
        lat: payload.lat || null,
        lon: payload.lon || null,
        max_duration_mins: 240,
        location: null,
      }),
    });
  },
};
