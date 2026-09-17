const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  statusCode: number;
  data: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('insur_auth_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = json.message || `API request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, json);
  }

  return json;
}

export const api = {
  // Auth
  register: (body: any) => request<{ success: boolean; data: { agent: any; token: string } }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<{ success: boolean; data: { agent: any; token: string } }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<{ success: boolean; data: any }>('/auth/me'),
  forgotPassword: (email: string) => request<{ success: boolean; message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  // Dashboard
  getDashboardStats: () => request<{ success: boolean; data: any }>('/dashboard/stats'),

  // Customers
  listCustomers: (params: { search?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    return request<{ success: boolean; data: { items: any[]; pagination: any } }>(`/customers?${query.toString()}`);
  },
  getCustomer: (id: string) => request<{ success: boolean; data: any }>(`/customers/${id}`),
  createCustomer: (body: any) => request<{ success: boolean; data: any }>('/customers', { method: 'POST', body: JSON.stringify(body) }),

  // Products
  listProducts: (categoryId?: string) => {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    return request<{ success: boolean; data: any[] }>(`/products${query}`);
  },
  listCategories: () => request<{ success: boolean; data: any[] }>('/products/categories'),
  getEligibleProducts: (customerId: string) =>
    request<{
      success: boolean;
      data: {
        customer: any;
        purchasedPolicies?: any[];
        eligibleProducts: any[];
        ineligibleProducts: any[];
        totalEligible: number;
        totalPurchased?: number;
      };
    }>(`/products/eligible/${customerId}`),

  // Quotes
  listQuotes: (page = 1, limit = 50) => request<{ success: boolean; data: { items: any[]; pagination: any } }>(`/quotes?page=${page}&limit=${limit}`),
  getQuote: (id: string) => request<{ success: boolean; data: { quote: any; whatsAppShareUrl: string } }>(`/quotes/${id}`),
  generateQuote: (body: { customerId: string; productId: string; notes?: string }) =>
    request<{ success: boolean; message: string; data: { quote: any; whatsAppShareUrl: string } }>('/quotes/generate', { method: 'POST', body: JSON.stringify(body) }),

  // Payments
  listPayments: (page = 1, limit = 50) => request<{ success: boolean; data: { items: any[]; pagination: any } }>(`/payments?page=${page}&limit=${limit}`),
  getPayment: (id: string) => request<{ success: boolean; data: { payment: any; policy: any } }>(`/payments/${id}`),
  createPaymentLink: (quoteId: string, customerId?: string) =>
    request<{ success: boolean; data: { payment: any; stripePaymentLink: string; whatsAppPaymentUrl: string } }>('/payments/create-link', {
      method: 'POST',
      body: JSON.stringify({ quoteId, customerId }),
    }),
  simulatePaymentSuccess: (paymentId: string) =>
    request<{ success: boolean; message: string; data: { payment: any; policy: any } }>(`/payments/simulate-success/${paymentId}`, {
      method: 'POST',
    }),
};

