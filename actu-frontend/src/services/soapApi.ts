const API_BASE = process.env.NEXT_PUBLIC_API_SOAP_BASE_URL || 'http://localhost:8080';

export interface User {
  id: number;
  username: string;
  email: string;
  role: "VISITOR" | "EDITOR" | "ADMIN";
}

export interface Token {
  id: number;
  value: string;
  userId: number;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// Helper function to create SOAP envelope
function createSoapEnvelope(action: string, body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:usr="http://actu.com/users"
                  xmlns:sec="http://actu.com/security">
   <soapenv:Header>
      <sec:Authorization>Bearer ${getAuthToken()}</sec:Authorization>
   </soapenv:Header>
   <soapenv:Body>
      ${body}
   </soapenv:Body>
</soapenv:Envelope>`;
}

// Helper function to parse XML response
function parseXmlResponse(xmlString: string): any {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  
  // Remove namespaces for easier parsing
  const cleanXml = xmlString.replace(/xmlns[^=]*="[^"]*"/g, '');
  const cleanDoc = parser.parseFromString(cleanXml, "text/xml");
  
  return cleanDoc;
}

// Helper function to extract users from XML
function extractUsersFromXml(xmlDoc: Document): User[] {
  const users: User[] = [];
  
  // Handle both namespace formats (ns2:user and user)
  const userElements = xmlDoc.querySelectorAll('user, ns2\\:user');
  
  userElements.forEach(userEl => {
    const id = userEl.querySelector('id, ns2\\:id')?.textContent;
    const username = userEl.querySelector('username, ns2\\:username')?.textContent;
    const email = userEl.querySelector('email, ns2\\:email')?.textContent;
    const role = userEl.querySelector('role, ns2\\:role')?.textContent;
    
    if (id && username && email && role) {
      users.push({
        id: parseInt(id),
        username,
        email,
        role: role as "VISITOR" | "EDITOR" | "ADMIN"
      });
    }
  });
  
  return users;
}

// Helper function to extract tokens from XML
function extractTokensFromXml(xmlDoc: Document): Token[] {
  const tokens: Token[] = [];
  
  // Handle both namespace formats
  const tokenElements = xmlDoc.querySelectorAll('token, ns2\\:token');
  
  tokenElements.forEach(tokenEl => {
    const id = tokenEl.querySelector('id, ns2\\:id')?.textContent;
    const value = tokenEl.querySelector('value, ns2\\:value')?.textContent;
    const userId = tokenEl.querySelector('userId, ns2\\:userId')?.textContent;
    const createdAt = tokenEl.querySelector('createdAt, ns2\\:createdAt')?.textContent;
    const expiresAt = tokenEl.querySelector('expiresAt, ns2\\:expiresAt')?.textContent;
    const revoked = tokenEl.querySelector('revoked, ns2\\:revoked')?.textContent;
    
    if (id && value && userId && createdAt && expiresAt && revoked !== null) {
      tokens.push({
        id: parseInt(id),
        value,
        userId: parseInt(userId),
        createdAt,
        expiresAt,
        revoked: revoked === 'true'
      });
    }
  });
  
  return tokens;
}

// Helper function to extract single user from XML
function extractUserFromXml(xmlDoc: Document): User | null {
  // Handle both namespace formats
  const userEl = xmlDoc.querySelector('user, ns2\\:user');
  if (!userEl) return null;
  
  const id = userEl.querySelector('id, ns2\\:id')?.textContent;
  const username = userEl.querySelector('username, ns2\\:username')?.textContent;
  const email = userEl.querySelector('email, ns2\\:email')?.textContent;
  const role = userEl.querySelector('role, ns2\\:role')?.textContent;
  
  if (id && username && email && role) {
    return {
      id: parseInt(id),
      username,
      email,
      role: role as "VISITOR" | "EDITOR" | "ADMIN"
    };
  }
  
  return null;
}

// Helper function to extract success message from XML
function extractSuccessFromXml(xmlDoc: Document): { success: boolean; message: string } {
  // Handle both namespace formats
  const successEl = xmlDoc.querySelector('success, ns2\\:success');
  const messageEl = xmlDoc.querySelector('message, ns2\\:message');
  
  return {
    success: successEl?.textContent === 'true',
    message: messageEl?.textContent || ''
  };
}

// SOAP API functions
export async function fetchUsers(): Promise<User[]> {
  const soapBody = '<usr:getAllUsersRequest/>';
  const soapEnvelope = createSoapEnvelope('getAllUsers', soapBody);
  
  const response = await fetch(`${API_BASE}/ws`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
    },
    body: soapEnvelope,
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors du chargement des utilisateurs");
  }
  
  const xmlText = await response.text();
  const xmlDoc = parseXmlResponse(xmlText);
  return extractUsersFromXml(xmlDoc);
}

export async function createUser(user: { username: string; email: string; password: string; role: string }): Promise<User> {
  const soapBody = `
    <usr:createUserRequest>
      <usr:user>
        <usr:username>${user.username}</usr:username>
        <usr:password>${user.password}</usr:password>
        <usr:email>${user.email}</usr:email>
        <usr:role>${user.role}</usr:role>
      </usr:user>
    </usr:createUserRequest>`;
  
  const soapEnvelope = createSoapEnvelope('createUser', soapBody);
  
  const response = await fetch(`${API_BASE}/ws`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
    },
    body: soapEnvelope,
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la création de l'utilisateur");
  }
  
  const xmlText = await response.text();
  const xmlDoc = parseXmlResponse(xmlText);
  const createdUser = extractUserFromXml(xmlDoc);
  
  if (!createdUser) {
    throw new Error("Erreur lors de la création de l'utilisateur");
  }
  
  return createdUser;
}

export async function updateUser(id: number, user: { username: string; email: string; password?: string; role: string }): Promise<User> {
  const passwordElement = user.password ? `<usr:password>${user.password}</usr:password>` : '';
  
  const soapBody = `
    <usr:updateUserRequest>
      <usr:id>${id}</usr:id>
      <usr:user>
        <usr:username>${user.username}</usr:username>
        ${passwordElement}
        <usr:email>${user.email}</usr:email>
        <usr:role>${user.role}</usr:role>
      </usr:user>
    </usr:updateUserRequest>`;
  
  const soapEnvelope = createSoapEnvelope('updateUser', soapBody);
  
  const response = await fetch(`${API_BASE}/ws`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
    },
    body: soapEnvelope,
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la modification de l'utilisateur");
  }
  
  const xmlText = await response.text();
  const xmlDoc = parseXmlResponse(xmlText);
  const updatedUser = extractUserFromXml(xmlDoc);
  
  if (!updatedUser) {
    throw new Error("Erreur lors de la modification de l'utilisateur");
  }
  
  return updatedUser;
}

export async function deleteUser(id: number): Promise<void> {
  const soapBody = `
    <usr:deleteUserRequest>
      <usr:id>${id}</usr:id>
    </usr:deleteUserRequest>`;
  
  const soapEnvelope = createSoapEnvelope('deleteUser', soapBody);
  
  const response = await fetch(`${API_BASE}/ws`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
    },
    body: soapEnvelope,
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la suppression de l'utilisateur");
  }
  
  const xmlText = await response.text();
  const xmlDoc = parseXmlResponse(xmlText);
  const result = extractSuccessFromXml(xmlDoc);
  
  if (!result.success) {
    throw new Error(result.message || "Erreur lors de la suppression de l'utilisateur");
  }
}

export async function fetchTokens(): Promise<Token[]> {
  const soapBody = '<usr:getAllTokensRequest/>';
  const soapEnvelope = createSoapEnvelope('getAllTokens', soapBody);
  
  const response = await fetch(`${API_BASE}/ws`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
    },
    body: soapEnvelope,
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors du chargement des jetons");
  }
  
  const xmlText = await response.text();
  const xmlDoc = parseXmlResponse(xmlText);
  return extractTokensFromXml(xmlDoc);
}

export async function generateToken(userId: number): Promise<Token> {
  const soapBody = `
    <usr:generateTokenRequest>
      <usr:userId>${userId}</usr:userId>
    </usr:generateTokenRequest>`;
  
  const soapEnvelope = createSoapEnvelope('generateToken', soapBody);
  
  const response = await fetch(`${API_BASE}/ws`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
    },
    body: soapEnvelope,
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la génération du jeton");
  }
  
  const xmlText = await response.text();
  const xmlDoc = parseXmlResponse(xmlText);
  
  // Handle both namespace formats
  const tokenEl = xmlDoc.querySelector('token, ns2\\:token');
  
  if (!tokenEl) {
    throw new Error("Erreur lors de la génération du jeton");
  }
  
  const id = tokenEl.querySelector('id, ns2\\:id')?.textContent;
  const value = tokenEl.querySelector('value, ns2\\:value')?.textContent;
  const tokenUserId = tokenEl.querySelector('userId, ns2\\:userId')?.textContent;
  const createdAt = tokenEl.querySelector('createdAt, ns2\\:createdAt')?.textContent;
  const expiresAt = tokenEl.querySelector('expiresAt, ns2\\:expiresAt')?.textContent;
  const revoked = tokenEl.querySelector('revoked, ns2\\:revoked')?.textContent;
  
  if (!id || !value || !tokenUserId || !createdAt || !expiresAt || revoked === null) {
    throw new Error("Erreur lors de la génération du jeton");
  }
  
  return {
    id: parseInt(id),
    value,
    userId: parseInt(tokenUserId),
    createdAt,
    expiresAt,
    revoked: revoked === 'true'
  };
}

export async function deleteToken(id: number): Promise<void> {
  const soapBody = `
    <usr:deleteTokenRequest>
      <usr:id>${id}</usr:id>
    </usr:deleteTokenRequest>`;
  
  const soapEnvelope = createSoapEnvelope('deleteToken', soapBody);
  
  const response = await fetch(`${API_BASE}/ws`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
    },
    body: soapEnvelope,
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la suppression du jeton");
  }
  
  const xmlText = await response.text();
  const xmlDoc = parseXmlResponse(xmlText);
  const result = extractSuccessFromXml(xmlDoc);
  
  if (!result.success) {
    throw new Error(result.message || "Erreur lors de la suppression du jeton");
  }
}

export async function fetchTokensByUser(userId: number): Promise<Token[]> {
  const soapBody = `
    <usr:getTokensByUserRequest>
      <usr:userId>${userId}</usr:userId>
    </usr:getTokensByUserRequest>`;
  
  const soapEnvelope = createSoapEnvelope('getTokensByUser', soapBody);
  
  const response = await fetch(`${API_BASE}/ws`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
    },
    body: soapEnvelope,
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors du chargement des jetons de l'utilisateur");
  }
  
  const xmlText = await response.text();
  const xmlDoc = parseXmlResponse(xmlText);
  return extractTokensFromXml(xmlDoc);
}

export async function reactivateToken(id: number): Promise<void> {
  const soapBody = `
    <usr:reactivateTokenRequest>
      <usr:id>${id}</usr:id>
    </usr:reactivateTokenRequest>`;
  
  const soapEnvelope = createSoapEnvelope('reactivateToken', soapBody);
  
  const response = await fetch(`${API_BASE}/ws`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
    },
    body: soapEnvelope,
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la réactivation du jeton");
  }
  
  const xmlText = await response.text();
  const xmlDoc = parseXmlResponse(xmlText);
  const result = extractSuccessFromXml(xmlDoc);
  
  if (!result.success) {
    throw new Error(result.message || "Erreur lors de la réactivation du jeton");
  }
}

export async function revokeToken(id: number): Promise<void> {
  const soapBody = `
    <usr:revokeTokenRequest>
      <usr:id>${id}</usr:id>
    </usr:revokeTokenRequest>`;
  
  const soapEnvelope = createSoapEnvelope('revokeToken', soapBody);
  
  const response = await fetch(`${API_BASE}/ws`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
    },
    body: soapEnvelope,
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la révocation du jeton");
  }
  
  const xmlText = await response.text();
  const xmlDoc = parseXmlResponse(xmlText);
  const result = extractSuccessFromXml(xmlDoc);
  
  if (!result.success) {
    throw new Error(result.message || "Erreur lors de la révocation du jeton");
  }
}

// Editor profile functions
export async function getProfile(): Promise<User> {
  const soapBody = '<usr:getProfileRequest/>';
  const soapEnvelope = createSoapEnvelope('getProfile', soapBody);
  
  const response = await fetch(`${API_BASE}/ws`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
    },
    body: soapEnvelope,
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors du chargement du profil");
  }
  
  const xmlText = await response.text();
  const xmlDoc = parseXmlResponse(xmlText);
  const user = extractUserFromXml(xmlDoc);
  
  if (!user) {
    throw new Error("Erreur lors du chargement du profil");
  }
  
  return user;
}

export async function updateProfile(user: { username: string; email: string; password?: string }): Promise<User> {
  const passwordElement = user.password ? `<usr:password>${user.password}</usr:password>` : '';
  
  const soapBody = `
    <usr:updateProfileRequest>
      <usr:user>
        <usr:username>${user.username}</usr:username>
        ${passwordElement}
        <usr:email>${user.email}</usr:email>
      </usr:user>
    </usr:updateProfileRequest>`;
  
  const soapEnvelope = createSoapEnvelope('updateProfile', soapBody);
  
  const response = await fetch(`${API_BASE}/ws`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
    },
    body: soapEnvelope,
  });
  
  if (!response.ok) {
    throw new Error("Erreur lors de la modification du profil");
  }
  
  const xmlText = await response.text();
  const xmlDoc = parseXmlResponse(xmlText);
  const updatedUser = extractUserFromXml(xmlDoc);
  
  if (!updatedUser) {
    throw new Error("Erreur lors de la modification du profil");
  }
  
  return updatedUser;
}

// --- SOAP Authentication ---

export async function soapLogin(username: string, password: string): Promise<{ token: string; user: { username: string; role: string } }> {
  const soapBody = `
    <usr:loginRequest>
      <usr:username>${username}</usr:username>
      <usr:password>${password}</usr:password>
    </usr:loginRequest>`;
  const envelope = createSoapEnvelope('login', soapBody);
  const response = await fetch(`${API_BASE}/ws`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: envelope,
  });
  if (!response.ok) throw new Error('Erreur lors de la connexion');
  const xml = await response.text();
  const xmlDoc = parseXmlResponse(xml);
  const token = xmlDoc.querySelector('token, ns2\\:token')?.textContent || '';
  const userEl = xmlDoc.querySelector('user, ns2\\:user');
  const usernameResp = userEl?.querySelector('username, ns2\\:username')?.textContent || '';
  const role = userEl?.querySelector('role, ns2\\:role')?.textContent || '';
  if (token) localStorage.setItem('token', token);
  return { token, user: { username: usernameResp, role } };
}

export async function soapRegister(username: string, email: string, password: string): Promise<{ success: boolean; message: string }> {
  const soapBody = `
    <usr:registerRequest>
      <usr:username>${username}</usr:username>
      <usr:email>${email}</usr:email>
      <usr:password>${password}</usr:password>
    </usr:registerRequest>`;
  const envelope = createSoapEnvelope('register', soapBody);
  const response = await fetch(`${API_BASE}/ws`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: envelope,
  });
  if (!response.ok) throw new Error('Erreur lors de l\'inscription');
  const xml = await response.text();
  const xmlDoc = parseXmlResponse(xml);
  const success = xmlDoc.querySelector('success, ns2\\:success')?.textContent === 'true';
  const message = xmlDoc.querySelector('message, ns2\\:message')?.textContent || '';
  return { success, message };
}

export async function soapGetCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const soapBody = `<usr:getCurrentUserRequest/>`;
  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:usr=\"http://actu.com/users\" xmlns:sec=\"http://actu.com/security\">
      <soapenv:Header>
        <sec:Authorization>Bearer ${token}</sec:Authorization>
      </soapenv:Header>
      <soapenv:Body>
        ${soapBody}
      </soapenv:Body>
    </soapenv:Envelope>`;
  const response = await fetch(`${API_BASE}/ws`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: envelope,
  });
  if (!response.ok) return null;
  const xml = await response.text();
  const xmlDoc = parseXmlResponse(xml);
  return extractUserFromXml(xmlDoc);
}

export async function soapLogout(): Promise<{ success: boolean; message: string }> {
  const token = localStorage.getItem('token');
  if (!token) return { success: false, message: 'Not logged in' };
  const soapBody = `<usr:logoutRequest/>`;
  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:usr=\"http://actu.com/users\" xmlns:sec=\"http://actu.com/security\">
      <soapenv:Header>
        <sec:Authorization>Bearer ${token}</sec:Authorization>
      </soapenv:Header>
      <soapenv:Body>
        ${soapBody}
      </soapenv:Body>
    </soapenv:Envelope>`;
  const response = await fetch(`${API_BASE}/ws`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml' },
    body: envelope,
  });
  const xml = await response.text();
  const xmlDoc = parseXmlResponse(xml);
  const success = xmlDoc.querySelector('success, ns2\\:success')?.textContent === 'true';
  const message = xmlDoc.querySelector('message, ns2\\:message')?.textContent || '';
  if (success) localStorage.removeItem('token');
  return { success, message };
} 