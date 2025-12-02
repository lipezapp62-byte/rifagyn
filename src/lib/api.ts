// Camada de API para integração com backend n8n
const API_BASE =
  "https://criadordigital-n8n-webhook.tw9mqd.easypanel.host/webhook/rifagyn";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ===========================
//   AUTH TOKEN MANAGEMENT
// ===========================
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

// ==============================================
//   LISTA TODOS OS NÚMEROS DO USUÁRIO
// ==============================================
export const getMyTickets = async () => {
  const token = getAuthToken();

  const res = await fetch(
    "https://criadordigital-n8n-webhook.tw9mqd.easypanel.host/webhook/rifagyn/tickets/my",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
      // ❗ Não enviar body — o fluxo N8N não usa
    }
  );

  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(data.error || "Erro ao buscar números");
  }

  return data; // success + tickets (exatamente como o fluxo envia)
};

// ===========================
//   GENERIC FETCH WRAPPER
// ===========================
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

// ===========================
//   AUTH ENDPOINTS
// ===========================
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

// ===========================
//   PUBLIC ENDPOINTS
// ===========================
export const publicApi = {
  getAppHome: async () => {
    return apiCall("/app/home", "POST");
  },

  getCampaigns: async () => {
    return apiCall("/campaigns/public", "POST");
  },

  getCampaignSummary: async (campaignId: string) => {
    return apiCall("/campaigns/summary", "POST", { id: campaignId });
  },

  getCampaignsSummaryList: async () => {
    return apiCall("/campaigns/summary/list", "POST");
  },

  getCampaignAvailable: async (campaignId: string) => {
    return apiCall("/campaigns/available", "POST", {
      campaign_id: campaignId,
    });
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

// ===========================
//   USER ENDPOINTS
// ===========================
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

  // 🔥 CREATE ORDER — COMPATÍVEL COM SEU FLUXO DO N8N
  createOrder: async (data: {
    campaign_id: string;
    quantity: number;
    qty?: number;
    combo_id?: string;
    buyer_name?: string;
    buyer_whatsapp?: string;
  }) => {
    return apiCall("/orders/create", "POST", {
      ...data,
      qty: data.qty ?? data.quantity, // garante que SEMPRE exista qty
    });
  },
};

// ===========================
//   ADMIN ENDPOINTS
// ===========================
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
    return apiCall("/campaigns/detail", "POST", {
      campaign_id: campaignId,
    });
  },
};
