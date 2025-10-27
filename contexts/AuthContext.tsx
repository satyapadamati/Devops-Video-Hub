
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { INITIAL_PERMISSION_LIST } from '../constants';

interface AuthContextType {
  user: User | null;
  isAuthorized: boolean;
  permissionList: string[];
  pendingRequests: string[];
  login: (email: string) => void;
  logout: () => void;
  addUserToPermissionList: (email: string) => void;
  removeUserFromPermissionList: (email: string) => void;
  requestAccess: (email: string) => void;
  approveRequest: (email: string) => void;
  denyRequest: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [permissionList, setPermissionList] = useState<string[]>(INITIAL_PERMISSION_LIST);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);

  const login = useCallback((email: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail) {
      const newUser = { email: normalizedEmail };
      setUser(newUser);
      setIsAuthorized(permissionList.includes(normalizedEmail));
    }
  }, [permissionList]);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthorized(false);
  }, []);

  const addUserToPermissionList = useCallback((email: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail && !permissionList.includes(normalizedEmail)) {
      setPermissionList(prevList => [...prevList, normalizedEmail]);
    }
  }, [permissionList]);

  const removeUserFromPermissionList = useCallback((email: string) => {
    setPermissionList(prevList => prevList.filter(e => e !== email));
    if(user?.email === email) {
        setIsAuthorized(false);
    }
  }, [user]);

  const requestAccess = useCallback((email: string) => {
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail && !pendingRequests.includes(normalizedEmail) && !permissionList.includes(normalizedEmail)) {
          setPendingRequests(prev => [...prev, normalizedEmail]);
      }
  }, [pendingRequests, permissionList]);

  const approveRequest = useCallback((email: string) => {
      addUserToPermissionList(email);
      setPendingRequests(prev => prev.filter(r => r !== email));
  }, [addUserToPermissionList]);

  const denyRequest = useCallback((email: string) => {
      setPendingRequests(prev => prev.filter(r => r !== email));
  }, []);


  return (
    <AuthContext.Provider value={{ user, isAuthorized, permissionList, pendingRequests, login, logout, addUserToPermissionList, removeUserFromPermissionList, requestAccess, approveRequest, denyRequest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
