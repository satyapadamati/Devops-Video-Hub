
import React, { useState, useEffect } from 'react';
import { useContent } from '../contexts/ContentContext';
import { Content } from '../types';
import { PlayIcon, VideoCameraIcon, DocumentTextIcon, XIcon, FolderIcon, ListBulletIcon } from './icons';

const PlayerPanel: React.FC<{ 
  selectedContent: Content; 
  onClose: () => void;
  playlist: Content[];
}> = ({ selectedContent, onClose, playlist }) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(selectedContent);

  useEffect(() => {
    setCurrentlyPlaying(selectedContent);
  }, [selectedContent]);

  const videoUrl = `https://drive.google.com/file/d/${currentlyPlaying.driveFileId}/preview`;

  return (
    <div className="bg-gray-800 shadow-xl flex flex-col h-full">
      <div className="relative">
        <div className="aspect-w-16 aspect-h-9 bg-black">
            <iframe 
                key={currentlyPlaying.id}
                src={videoUrl} 
                title={currentlyPlaying.title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full"
            ></iframe>
        </div>
         <button 
            onClick={onClose} 
            className="absolute top-2 right-2 bg-gray-900 bg-opacity-50 hover:bg-opacity-75 rounded-full p-1.5 transition-colors"
            aria-label="Close video player"
        >
            <XIcon className="h-5 w-5 text-white" />
        </button>
      </div>
      <div className="flex-grow flex flex-col overflow-y-hidden">
        <div className="p-4 border-b border-gray-700">
            <h3 className="text-xl font-bold text-white">{currentlyPlaying.title}</h3>
            <p className="text-gray-400 mt-2 text-sm">{currentlyPlaying.description}</p>
        </div>
        {playlist.length > 0 && (
          <>
            <h4 className="p-4 pb-2 text-sm font-semibold text-gray-300 flex items-center">
              <ListBulletIcon className="h-5 w-5 mr-2" />
              Up Next in {currentlyPlaying.series}
            </h4>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
                {playlist.map(item => (
                    <div 
                        key={item.id}
                        onClick={() => setCurrentlyPlaying(item)}
                        className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            currentlyPlaying.id === item.id 
                            ? 'bg-blue-600 bg-opacity-25' 
                            : 'hover:bg-gray-700'
                        }`}
                    >
                        <img src={item.thumbnailUrl} alt={item.title} className="w-24 h-14 object-cover rounded-md flex-shrink-0" />
                        <div className="overflow-hidden">
                            <p className={`font-semibold text-sm truncate ${currentlyPlaying.id === item.id ? 'text-blue-400' : 'text-white'}`}>{item.title}</p>
                            <p className="text-xs text-gray-400">{item.duration}</p>
                        </div>
                    </div>
                ))}
            </div>
          </>
        )}
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
        {content.series && <p className="text-xs text-blue-400 font-semibold mt-1">{content.series}</p>}
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
        setPlayingContent(null); 
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

  const playlist = playingContent?.series 
    ? contentList.filter(c => c.series === playingContent.series && c.type === 'video')
    : [];

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
      <div className="flex gap-8 items-start">
        <div className={`flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 transition-all duration-300 ${playingContent ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
          {contentList.map(content => (
            <ContentCard key={content.id} content={content} onClick={() => handleContentClick(content)} />
          ))}
        </div>
        <div className={`w-full lg:w-2/5 xl:w-1/3 transition-transform duration-500 ease-in-out fixed top-0 right-0 h-full z-20 ${playingContent ? 'translate-x-0' : 'translate-x-full'}`}>
           {playingContent && <PlayerPanel selectedContent={playingContent} onClose={() => setPlayingContent(null)} playlist={playlist} />}
        </div>
      </div>
       {playingContent && <div onClick={() => setPlayingContent(null)} className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"></div>}
    </div>
  );
};

export default ContentLibrary;