// src/providers/AuthProvider.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { getInfor, logoutApi } from '../services/auth';


export type Role = 'admin' | 'department' | 'delegate';

export interface Department {
  id: number;
  code: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface User {
  id: number;
  code: string;       // ví dụ: "SV001"
  email: string;
  name: string;       // họ tên từ BE
  role: Role;
  mssv?: string | null;
  ava?: string | null;
  hasContactInfo?: boolean;
  department?: Department;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

// ---- Context interface ----
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  // login chỉ nhận user đã có (FE không giữ token, token nằm trong cookie HttpOnly)
  login: (userData: User) => void;
  // logout gọi BE để clear cookie, rồi xóa user trong context
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]     = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await getInfor();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutApi(); 
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth phải được dùng trong AuthProvider');
  }
  return ctx;
};
