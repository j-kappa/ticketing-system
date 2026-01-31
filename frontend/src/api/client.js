const API_BASE = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

// Tickets
export async function getTickets(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const response = await fetch(`${API_BASE}/tickets?${params}`);
  return handleResponse(response);
}

export async function getTicket(id) {
  const response = await fetch(`${API_BASE}/tickets/${id}`);
  return handleResponse(response);
}

export async function createTicket(data) {
  const response = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateTicket(id, data) {
  const response = await fetch(`${API_BASE}/tickets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteTicket(id) {
  const response = await fetch(`${API_BASE}/tickets/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

// Notes
export async function addNote(ticketId, data) {
  const response = await fetch(`${API_BASE}/tickets/${ticketId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// Attachments
export async function uploadAttachment(ticketId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE}/tickets/${ticketId}/attachments`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
}

export async function deleteAttachment(id) {
  const response = await fetch(`${API_BASE}/attachments/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

// Team
export async function getTeamMembers() {
  const response = await fetch(`${API_BASE}/team`);
  return handleResponse(response);
}

export async function createTeamMember(data) {
  const response = await fetch(`${API_BASE}/team`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateTeamMember(id, data) {
  const response = await fetch(`${API_BASE}/team/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteTeamMember(id) {
  const response = await fetch(`${API_BASE}/team/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

// Stats
export async function getStats() {
  const response = await fetch(`${API_BASE}/stats`);
  return handleResponse(response);
}
