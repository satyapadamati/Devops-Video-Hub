
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Content } from '../types';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';

interface ContentContextType {
  contentList: Content[];
  addContent: (content: Omit<Content, 'id'>) => Promise<void>;
  removeContent: (id: string) => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contentList, setContentList] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const contentCollection = collection(db, 'content');
      const q = query(contentCollection, orderBy('createdAt', 'desc'));
      const contentSnapshot = await getDocs(q);
      
      const contents = contentSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              title: data.title,
              description: data.description,
              thumbnailUrl: data.thumbnailUrl,
              driveFileId: data.driveFileId,
              type: data.type,
              duration: data.duration,
              series: data.series || '',
          }
      })
      setContentList(contents);
    } catch (error) {
      console.error("Error fetching content from Firestore:", error);
      // Fallback for when createdAt field doesn't exist yet
      if (error instanceof Error && error.message.includes("ordered by a field that is not created")) {
        const contentSnapshot = await getDocs(collection(db, 'content'));
        setContentList(contentSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                description: data.description,
                thumbnailUrl: data.thumbnailUrl,
                driveFileId: data.driveFileId,
                type: data.type,
                duration: data.duration,
                series: data.series || '',
            }
        }) as Content[]);
      }
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const addContent = async (newContent: Omit<Content, 'id'>) => {
    try {
      const contentToAdd = {
        ...newContent,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'content'), contentToAdd);
      fetchContent(); // Re-fetch to get the newly added content with its ID
    } catch(error) {
        console.error("Error adding content to Firestore:", error);
    }
  };

  const removeContent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'content', id));
      setContentList(prev => prev.filter(c => c.id !== id));
    } catch (error) {
        console.error("Error removing content from Firestore:", error);
    }
  };

  return (
    <ContentContext.Provider value={{ contentList, addContent, removeContent }}>
      {!loading ? children : null}
    </ContentContext.Provider>
  );
};

export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};