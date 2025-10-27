
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Permission, User } from '../types';
import { INITIAL_PERMISSION_LIST, PERMANENT_ADMIN_EMAIL } from '../constants';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch, updateDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAuthorized: boolean;
  isAdmin: boolean;
  permissionList: Permission[];
  pendingRequests: string[];
  login: (email: string) => void;
  logout: () => void;
  addUserToPermissionList: (email: string) => Promise<void>;
  removeUserFromPermissionList: (email: string) => Promise<void>;
  grantAdmin: (email: string) => Promise<void>;
  revokeAdmin: (email: string) => Promise<void>;
  requestAccess: (email: string) => Promise<void>;
  approveRequest: (email: string) => Promise<void>;
  denyRequest: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [permissionList, setPermissionList] = useState<Permission[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const permCollection = collection(db, 'permissions');
      const reqCollection = collection(db, 'pending_requests');

      const permSnapshot = await getDocs(permCollection);
      const permData = permSnapshot.docs.map(doc => doc.data() as Permission);
      
      if (permData.length === 0) {
        const batch = writeBatch(db);
        INITIAL_PERMISSION_LIST.forEach(p => {
            const docRef = doc(db, 'permissions', p.email);
            batch.set(docRef, p);
        });
        await batch.commit();
        setPermissionList(INITIAL_PERMISSION_LIST);
      } else {
        setPermissionList(permData);
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
      const currentUserPermission = permissionList.find(p => p.email === user.email);
      const authorized = !!currentUserPermission;

      // Safeguard: The permanent admin is ALWAYS authorized and ALWAYS an admin,
      // regardless of the database state.
      if (user.email === PERMANENT_ADMIN_EMAIL) {
        setIsAuthorized(true);
        setIsAdmin(true);
      } else {
        setIsAuthorized(authorized);
        setIsAdmin(!!currentUserPermission?.isAdmin);
      }
    } else {
      setIsAuthorized(false);
      setIsAdmin(false);
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
    if (normalizedEmail && !permissionList.some(p => p.email === normalizedEmail)) {
      try {
        const newPermission: Permission = { email: normalizedEmail, isAdmin: false };
        await setDoc(doc(db, 'permissions', normalizedEmail), newPermission);
        setPermissionList(prev => [...prev, newPermission]);
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
      setPermissionList(prev => prev.filter(p => p.email !== email));
      if (user?.email === email) {
          setIsAuthorized(false);
          setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error removing user from Firestore:", error);
    }
  };

  const grantAdmin = async (email: string) => {
      if (email === PERMANENT_ADMIN_EMAIL) return;
      try {
        await updateDoc(doc(db, 'permissions', email), { isAdmin: true });
        setPermissionList(prev => prev.map(p => p.email === email ? { ...p, isAdmin: true } : p));
      } catch (error) {
        console.error("Error granting admin privileges:", error);
      }
  };

  const revokeAdmin = async (email: string) => {
      if (email === PERMANENT_ADMIN_EMAIL) return;
       try {
        await updateDoc(doc(db, 'permissions', email), { isAdmin: false });
        setPermissionList(prev => prev.map(p => p.email === email ? { ...p, isAdmin: false } : p));
        if (user?.email === email) {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error revoking admin privileges:", error);
      }
  };

  const requestAccess = async (email: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail && !pendingRequests.includes(normalizedEmail) && !permissionList.some(p => p.email === normalizedEmail)) {
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
        const newPermission: Permission = { email, isAdmin: false };
        const permDocRef = doc(db, "permissions", email);
        batch.set(permDocRef, newPermission);
        const reqDocRef = doc(db, "pending_requests", email);
        batch.delete(reqDocRef);
        await batch.commit();
        
        setPermissionList(prev => [...prev, newPermission]);
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
    isAdmin,
    permissionList,
    pendingRequests,
    login,
    logout,
    addUserToPermissionList,
    removeUserFromPermissionList,
    grantAdmin,
    revokeAdmin,
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
