import type { Expense, ExpenseFormData } from '../types/expense';

/** Ensures the base URL always ends with /api (common deploy mistake is omitting it). */
const normalizeApiBase = (url: string) => {
  const trimmed = url.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API_BASE_URL = normalizeApiBase(
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
);

export interface UserProfile {
  displayName: string;
  photoData: string;
  updatedAt: string | null;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  userId: string;
  body?: unknown;
}

export const getAuthHeaders = (userId: string) => ({
  'Content-Type': 'application/json',
  'x-user-id': userId,
});

/**
 * Reads the body as text before parsing so an empty or non-JSON reply (a wrong
 * server on the port, a proxy error page) surfaces as a readable message
 * instead of "Unexpected end of JSON input".
 */
const request = async <T>(path: string, { method = 'GET', userId, body }: RequestOptions): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: getAuthHeaders(userId),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error(
      `Cannot reach the server at ${API_BASE_URL}. Start it with "npm start" inside the server folder.`
    );
  }

  const rawBody = await response.text();
  let data: any = null;

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (data?.error || data?.message) {
      throw new Error(data.error || data.message);
    }
    if (response.status === 404) {
      throw new Error(
        `The API did not recognise this request (404). Another app may be running on ${API_BASE_URL}.`
      );
    }
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (data === null) {
    throw new Error(`The server at ${API_BASE_URL} returned an unreadable response.`);
  }

  return data as T;
};

const toExpense = (raw: any): Expense => ({
  id: raw._id,
  userId: raw.userId,
  title: raw.title,
  amount: raw.amount,
  category: raw.category,
  description: raw.description,
  date: new Date(raw.date),
  createdAt: new Date(raw.createdAt),
  updatedAt: new Date(raw.updatedAt),
});

export const expenseAPI = {
  getAll: async (userId: string): Promise<Expense[]> => {
    const data = await request<any[]>('/expenses', { userId });
    return data.map(toExpense);
  },

  getOne: async (userId: string, id: string): Promise<Expense> => {
    const data = await request<any>(`/expenses/${id}`, { userId });
    return toExpense(data);
  },

  create: async (userId: string, expenseData: ExpenseFormData): Promise<Expense> => {
    const data = await request<any>('/expenses', { method: 'POST', userId, body: expenseData });
    return toExpense(data);
  },

  update: async (userId: string, id: string, expenseData: ExpenseFormData): Promise<Expense> => {
    const data = await request<any>(`/expenses/${id}`, { method: 'PUT', userId, body: expenseData });
    return toExpense(data);
  },

  delete: async (userId: string, id: string): Promise<void> => {
    await request<{ message: string }>(`/expenses/${id}`, { method: 'DELETE', userId });
  },
};

export const profileAPI = {
  get: (userId: string) => request<UserProfile>('/profile', { userId }),

  updatePhoto: (userId: string, photoData: string) =>
    request<UserProfile>('/profile', { method: 'PUT', userId, body: { photoData } }),

  updateDisplayName: (userId: string, displayName: string) =>
    request<UserProfile>('/profile', { method: 'PUT', userId, body: { displayName } }),

  removePhoto: (userId: string) =>
    request<UserProfile>('/profile/photo', { method: 'DELETE', userId }),
};
