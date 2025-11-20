import ky from "ky";

// Crear instancia de ky con configuración base
const createAPI = () => {
  const token = localStorage.getItem('auth_token');
  
  return ky.create({ 
    prefixUrl: import.meta.env.VITE_API_URL || "http://localhost:8000",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    timeout: 60000  // 60 segundos de timeout (la búsqueda puede tardar ~6-10 segundos)
  });
};

// Función helper para actualizar la instancia cuando cambie el token
export const API = {
  get instance() {
    return createAPI();
  }
};

export interface SearchRow {
  document_id: string;
  title: string;
  number: string;
  category: string;
  doc_type: string;
  revision: string;
  filename: string;
  file_type: string;
  date_modified: string | null;
  snippet: string | null;
  score: number;
  project_id: string;
}

export async function search(params: {
  query: string; project_id?: string; top_k?: number; probes?: number;
}): Promise<SearchRow[]> {
  return API.instance.post("search", { json: params }).json<SearchRow[]>();
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  question: string;
  answer: string;
  sources: SearchRow[];
  context_used: string;
}

export async function chat(params: {
  question: string; 
  max_context_docs?: number;
  history?: ChatMessage[];
}): Promise<ChatResponse> {
  return API.instance.post("chat", { json: params }).json<ChatResponse>();
}

// ============================================================================
// API DE AUTENTICACIÓN
// ============================================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  return API.instance.post("auth/register", { json: data }).json<AuthResponse>();
}

export async function login(data: LoginData): Promise<AuthResponse> {
  return API.instance.post("auth/login", { json: data }).json<AuthResponse>();
}

export async function getCurrentUser(): Promise<User> {
  return API.instance.get("auth/me").json<User>();
}
