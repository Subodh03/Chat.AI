const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  register: (body) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  sendMessage: (body, token) =>
    request('/chat/message', { method: 'POST', body: JSON.stringify(body) }, token),

  getConversations: (token) =>
    request('/chat/conversations', {}, token),

  getConversation: (id, token) =>
    request(`/chat/conversations/${id}`, {}, token),

  deleteConversation: (id, token) =>
    request(`/chat/conversations/${id}`, { method: 'DELETE' }, token),
};
