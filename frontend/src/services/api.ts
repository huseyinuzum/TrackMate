const BASE_URL = 'http://127.0.0.1:8000';

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Place {
  id: string;
  external_id: string;
  name: string;
  latitude: number;
  longitude: number;
  category?: string;
  price_level?: number;
  rating?: number;
  estimated_time_mins: number;
}

export interface RoutePlace {
  id: string;
  route_id: string;
  place_id: string;
  step_order: number;
  arrival_time: string;
  departure_time: string;
  travel_time_from_prev: number;
  travel_mode: string;
  place: Place;
}

export interface Route {
  id: string;
  user_id: string;
  name: string;
  planned_date: string;
  total_duration_mins: number;
  total_cost_estimate: number;
  user_prompt?: string;
  ai_response?: string;
  places: RoutePlace[];
}

export const api = {
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('trackmate_token', token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('trackmate_token');
    }
    return null;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('trackmate_token');
    }
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  },

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    this.setToken(res.access_token);
    return res;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.access_token);
    return res;
  },

  async getMe(): Promise<User> {
    return this.request<User>('/api/v1/auth/me');
  },

  async searchPlaces(query: string, location?: string): Promise<Place[]> {
    return this.request<Place[]>('/api/v1/places/search', {
      method: 'POST',
      body: JSON.stringify({ query, location }),
    });
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
        categories: [],
        max_duration_mins: 240,
        location: null
      }),
    });
  },
};
