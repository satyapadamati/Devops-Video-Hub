import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Content } from '../types';
import { DRIVE_CONTENT } from '../constants';

interface ContentContextType {
  contentList: Content[];
  addContent: (content: Omit<Content, 'id'>) => void;
  removeContent: (id: string) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contentList, setContentList] = useState<Content[]>(DRIVE_CONTENT);

  const addContent = useCallback((newContent: Omit<Content, 'id'>) => {
    setContentList(prevList => [
      ...prevList,
      { ...newContent, id: new Date().toISOString() } // Use timestamp for a simple unique ID
    ]);
  }, []);

  const removeContent = useCallback((id: string) => {
    setContentList(prevList => prevList.filter(item => item.id !== id));
  }, []);

  return (
    <ContentContext.Provider value={{ contentList, addContent, removeContent }}>
      {children}
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
