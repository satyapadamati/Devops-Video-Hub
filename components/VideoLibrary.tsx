import React, { useState } from 'react';
import { useContent } from '../contexts/ContentContext';
import { Content } from '../types';
import { PlayIcon, VideoCameraIcon, DocumentTextIcon, XIcon, FolderIcon } from './icons';

const VideoSidePanel: React.FC<{ content: Content; onClose: () => void }> = ({ content, onClose }) => {
  const videoUrl = `https://drive.google.com/file/d/${content.driveFileId}/preview`;

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl flex flex-col h-full">
      <div className="relative p-4">
        <div className="aspect-w-16 aspect-h-9">
            <iframe 
                src={videoUrl} 
                title={content.title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full rounded-md"
            ></iframe>
        </div>
         <button 
            onClick={onClose} 
            className="absolute top-0 right-0 m-2 bg-gray-700 hover:bg-gray-600 rounded-full p-1.5 transition-colors"
            aria-label="Close video player"
        >
            <XIcon className="h-4 w-4 text-gray-200" />
        </button>
      </div>
      <div className="p-4 pt-0 overflow-y-auto">
        <h3 className="text-xl font-bold text-white">{content.title}</h3>
        <p className="text-gray-400 mt-2 text-sm">{content.description}</p>
      </div>
    </div>
  );
};

const ContentCard: React.FC<{ content: Content; onClick: () => void }> = ({ content, onClick }) => {
  const getIcon = (type: Content['type'], className: string) => {
    switch(type) {
      case 'video': return <PlayIcon className={className} />;
      case 'document': return <DocumentTextIcon className={className} />;
      case 'folder': return <FolderIcon className={className} />;
      default: return null;
    }
  };
  
  const getBadgeIcon = (type: Content['type'], className: string) => {
      switch(type) {
          case 'video': return <VideoCameraIcon className={className} />;
          case 'document': return <DocumentTextIcon className={className} />;
          case 'folder': return <FolderIcon className={className} />;
          default: return null;
      }
  }

  return (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <img src={content.thumbnailUrl} alt={content.title} className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {getIcon(content.type, "h-16 w-16 text-white")}
        </div>
         <span className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
            {getBadgeIcon(content.type, "h-4 w-4")}
            <span>{content.type.charAt(0).toUpperCase() + content.type.slice(1)}</span>
        </span>
        <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">{content.duration}</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-white">{content.title}</h3>
        <p className="text-gray-400 text-sm mt-1">{content.description}</p>
      </div>
    </div>
  );
};


const ContentLibrary: React.FC = () => {
  const [playingContent, setPlayingContent] = useState<Content | null>(null);
  const { contentList } = useContent();
  
  const handleContentClick = (content: Content) => {
    if (content.type === 'video') {
       if (playingContent?.id === content.id) {
          setPlayingContent(null);
      } else {
          setPlayingContent(content);
      }
    } else {
        setPlayingContent(null); // Close video player if another content type is clicked
        let url = '';
        if (content.type === 'document') {
            url = `https://drive.google.com/file/d/${content.driveFileId}/view`;
        } else if (content.type === 'folder') {
            url = `https://drive.google.com/drive/folders/${content.driveFileId}`;
        }

        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }
  };

  if (contentList.length === 0) {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-white">Content Library</h2>
            <div className="text-center py-16 bg-gray-800 rounded-lg">
                <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-2 text-xl font-medium text-white">No Content Available</h3>
                <p className="mt-1 text-md text-gray-400">The content library is currently empty.</p>
                <p className="mt-1 text-sm text-gray-500">An administrator can add content from the Admin Dashboard.</p>
            </div>
        </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-white">Content Library</h2>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className={`flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 ${playingContent ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} transition-all duration-300`}>
          {contentList.map(content => (
            <ContentCard key={content.id} content={content} onClick={() => handleContentClick(content)} />
          ))}
        </div>
        {playingContent && (
           <div className="w-full lg:w-2/5 xl:w-1/3 sticky top-8">
            <VideoSidePanel content={playingContent} onClose={() => setPlayingContent(null)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentLibrary;