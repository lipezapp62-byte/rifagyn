// Camada de API para integração com backend n8n
const API_BASE =
  "https://criadordigital-n8n-webhook.tw9mqd.easypanel.host/webhook/rifagyn";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Auth token management
export const setAuthToken = (token: string) => {
  const sanitized = token.toString().replace(/^=+/, "");
  localStorage.setItem("rifagyn_token", sanitized);
};

export const getAuthToken = () => {
  return localStorage.getItem("rifagyn_token");
};

export const clearAuthToken = () => {
  localStorage.removeItem("rifagyn_token");
};

// Generic API call function
async function apiCall<T = any>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
  body?: any
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = { method, headers };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Erro na requisição" }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth endpoints
export const authApi = {
  login: async (phone: string, password: string) => {
    return apiCall("/auth/login", "POST", { phone, password });
  },

  register: async (data: { name: string; phone: string; password: string }) => {
    return apiCall("/auth/register", "POST", data);
  },

  validateToken: async () => {
    return apiCall("/auth/validate", "POST");
  },
};

// Public endpoints
export const publicApi = {
  getAppHome: async () => {
    return apiCall("/app/home", "POST");
  },

  getCampaigns: async () => {
    return apiCall("/campaigns/public", "POST");
  },

  // 🔥 Agora SEMPRE envia ID
  getCampaignSummary: async (campaignId: string) => {
    return apiCall("/campaigns/summary", "POST", { id: campaignId });
  },

  getCampaignsSummaryList: async () => {
    return apiCall("/campaigns/summary/list", "POST");
  },

  getCampaignAvailable: async (campaignId: string) => {
    return apiCall("/campaigns/available", "POST", { campaign_id: campaignId });
  },

  getCampaignCombos: async (campaignId: string) => {
    return apiCall("/campaigns/combos", "POST", { campaign_id: campaignId });
  },

  getCampaignRules: async (campaignId: string) => {
    return apiCall("/campaigns/rules", "POST", { campaign_id: campaignId });
  },

  getCampaignFreeNumbers: async (campaignId: string) => {
    return apiCall("/campaigns/numbers/free", "POST", {
      campaign_id: campaignId,
    });
  },
};

// User endpoints
export const userApi = {
  getOrders: async () => {
    return apiCall("/user/orders", "POST");
  },

  getHistory: async () => {
    return apiCall("/user/history", "POST");
  },

  getOrder: async (orderId: string) => {
    return apiCall("/user/orders/detail", "POST", { order_id: orderId });
  },

  createOrder: async (data: {
    campaign_id: string;
    quantity: number;
    combo_id?: string;
  }) => {
    return apiCall("/orders/create", "POST", data);
  },
};

// Admin endpoints
export const adminApi = {
  getDashboard: async () => {
    return apiCall("/admin/dashboard", "POST");
  },

  getMyCampaigns: async () => {
    return apiCall("/campaigns/my", "POST");
  },

  createCampaign: async (data: any) => {
    return apiCall("/campaigns/create", "POST", data);
  },

  updateCampaign: async (campaignId: string, data: any) => {
    return apiCall("/campaigns/update", "POST", {
      campaign_id: campaignId,
      ...data,
    });
  },

  getCampaignDetails: async (campaignId: string) => {
    return apiCall("/campaigns/detail", "POST", { campaign_id: campaignId });
  },
};
