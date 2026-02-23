import { User } from '../types';

// Mock Auth Service (In a real app, this would call your backend API/Firebase/Supabase)
const STORAGE_KEY_USERS = 'pem_users_db';
const STORAGE_KEY_SESSION = 'pem_session';

interface StoredUser extends User {
  passwordHash: string; // In real app, never store plain text, even locally this is just a simulation
}

export const authService = {
  // Login
  login: async (email: string, password: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
    const users: StoredUser[] = usersStr ? JSON.parse(usersStr) : [];
    
    // Simple mock validation
    const user = users.find(u => u.email === email && u.passwordHash === btoa(password));
    
    if (user) {
      const sessionUser = { email: user.email, name: user.name };
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
      return sessionUser;
    }
    
    throw new Error("邮箱或密码错误");
  },

  // Register
  register: async (email: string, password: string, name: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 600));

    const usersStr = localStorage.getItem(STORAGE_KEY_USERS);
    const users: StoredUser[] = usersStr ? JSON.parse(usersStr) : [];

    if (users.find(u => u.email === email)) {
      throw new Error("该邮箱已被注册");
    }

    const newUser: StoredUser = {
      email,
      name,
      passwordHash: btoa(password) // Mock hashing
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    
    // Auto login after register
    const sessionUser = { email: newUser.email, name: newUser.name };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionUser));
    
    return sessionUser;
  },

  // Logout
  logout: () => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const sessionStr = localStorage.getItem(STORAGE_KEY_SESSION);
    return sessionStr ? JSON.parse(sessionStr) : null;
  }
};