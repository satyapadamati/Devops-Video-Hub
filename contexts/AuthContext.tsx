
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types';
import { INITIAL_PERMISSION_LIST, PERMANENT_ADMIN_EMAIL } from '../constants';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAuthorized: boolean;
  permissionList: string[];
  pendingRequests: string[];
  login: (email: string) => void;
  logout: () => void;
  addUserToPermissionList: (email: string) => Promise<void>;
  removeUserFromPermissionList: (email: string) => Promise<void>;
  requestAccess: (email: string) => Promise<void>;
  approveRequest: (email: string) => Promise<void>;
  denyRequest: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [permissionList, setPermissionList] = useState<string[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const permCollection = collection(db, 'permissions');
      const reqCollection = collection(db, 'pending_requests');

      const permSnapshot = await getDocs(permCollection);
      const permEmails = permSnapshot.docs.map(doc => doc.data().email);
      
      if (permEmails.length === 0) {
        const batch = writeBatch(db);
        INITIAL_PERMISSION_LIST.forEach(email => {
            const docRef = doc(db, 'permissions', email);
            batch.set(docRef, { email });
        });
        await batch.commit();
        setPermissionList(INITIAL_PERMISSION_LIST);
      } else {
        setPermissionList(permEmails);
      }

      const reqSnapshot = await getDocs(reqCollection);
      setPendingRequests(reqSnapshot.docs.map(doc => doc.data().email));
      
    } catch (error) {
      console.error("Error fetching auth data from Firestore:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (user) {
      setIsAuthorized(permissionList.includes(user.email));
    } else {
      setIsAuthorized(false);
    }
  }, [user, permissionList]);

  const login = useCallback((email: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail) {
      const newUser = { email: normalizedEmail };
      setUser(newUser);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const addUserToPermissionList = async (email: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail && !permissionList.includes(normalizedEmail)) {
      try {
        await setDoc(doc(db, 'permissions', normalizedEmail), { email: normalizedEmail });
        setPermissionList(prev => [...prev, normalizedEmail]);
      } catch (error) {
        console.error("Error adding user to Firestore:", error);
      }
    }
  };

  const removeUserFromPermissionList = async (email: string) => {
    if (email === PERMANENT_ADMIN_EMAIL) {
      alert("The permanent admin account cannot be removed.");
      return;
    }
    try {
      await deleteDoc(doc(db, 'permissions', email));
      setPermissionList(prev => prev.filter(p => p !== email));
      if (user?.email === email) {
          setIsAuthorized(false);
      }
    } catch (error) {
      console.error("Error removing user from Firestore:", error);
    }
  };

  const requestAccess = async (email: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail && !pendingRequests.includes(normalizedEmail) && !permissionList.includes(normalizedEmail)) {
      try {
        await setDoc(doc(db, 'pending_requests', normalizedEmail), { email: normalizedEmail });
        setPendingRequests(prev => [...prev, normalizedEmail]);
      } catch (error) {
        console.error("Error requesting access in Firestore:", error)
      }
    }
  };

  const approveRequest = async (email: string) => {
    try {
        const batch = writeBatch(db);
        const permDocRef = doc(db, "permissions", email);
        batch.set(permDocRef, { email });
        const reqDocRef = doc(db, "pending_requests", email);
        batch.delete(reqDocRef);
        await batch.commit();
        
        setPermissionList(prev => [...prev, email]);
        setPendingRequests(prev => prev.filter(r => r !== email));
    } catch (error) {
        console.error("Error approving request in Firestore:", error);
    }
  };

  const denyRequest = async (email: string) => {
    try {
      await deleteDoc(doc(db, 'pending_requests', email));
      setPendingRequests(prev => prev.filter(r => r !== email));
    } catch (error) {
      console.error("Error denying request in Firestore:", error);
    }
  };

  const value = {
    user,
    isAuthorized,
    permissionList,
    pendingRequests,
    login,
    logout,
    addUserToPermissionList,
    removeUserFromPermissionList,
    requestAccess,
    approveRequest,
    denyRequest
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>}
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