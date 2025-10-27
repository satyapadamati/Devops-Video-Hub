
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContent } from '../contexts/ContentContext';
import { TrashIcon, CollectionIcon, UsersIcon, VideoCameraIcon, DocumentTextIcon, FolderIcon, CheckCircleIcon, XCircleIcon, PencilIcon } from './icons';
import { PERMANENT_ADMIN_EMAIL } from '../constants';
import { Content } from '../types';

const UserManagementTab: React.FC = () => {
  const { 
    permissionList, 
    addUserToPermissionList, 
    removeUserFromPermissionList, 
    user,
    pendingRequests,
    approveRequest,
    denyRequest,
    grantAdmin,
    revokeAdmin
  } = useAuth();
  const [newEmail, setNewEmail] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail) {
      addUserToPermissionList(newEmail);
      setNewEmail('');
    }
  };

  return (
    <>
      {pendingRequests.length > 0 && (
        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4">Pending Access Requests ({pendingRequests.length})</h3>
            <ul className="space-y-3">
                {pendingRequests.map(email => (
                    <li key={email} className="flex justify-between items-center p-3 bg-gray-700 rounded-md">
                        <span className="text-gray-200">{email}</span>
                        <div className="flex space-x-3">
                            <button onClick={() => approveRequest(email)} className="text-green-400 hover:text-green-300 transition-colors" title={`Approve ${email}`}>
                                <CheckCircleIcon className="h-6 w-6" />
                            </button>
                            <button onClick={() => denyRequest(email)} className="text-red-400 hover:text-red-300 transition-colors" title={`Deny ${email}`}>
                                <XCircleIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
      )}

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Add User to Permission List</h3>
        <form onSubmit={handleAddUser} className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="user@example.com"
            className="flex-grow px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors duration-300"
          >
            Add User
          </button>
        </form>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Authorized Users ({permissionList.length})</h3>
        <ul className="space-y-3">
          {permissionList.map(p => (
            <li
              key={p.email}
              className="flex justify-between items-center p-3 bg-gray-700 rounded-md"
            >
              <div className="flex items-center space-x-2">
                <span className="text-gray-200">{p.email}</span>
                {user?.email === p.email && <span className="text-xs text-gray-400">(You)</span>}
                {p.email === PERMANENT_ADMIN_EMAIL && <span className="text-xs font-semibold bg-yellow-600 text-yellow-100 px-2 py-0.5 rounded-full">Permanent Admin</span>}
                {p.isAdmin && p.email !== PERMANENT_ADMIN_EMAIL && <span className="text-xs font-semibold bg-blue-600 text-blue-100 px-2 py-0.5 rounded-full">Admin</span>}
              </div>
              <div className="flex items-center space-x-3">
                {user?.email === PERMANENT_ADMIN_EMAIL && p.email !== PERMANENT_ADMIN_EMAIL && (
                   p.isAdmin 
                   ? <button onClick={() => revokeAdmin(p.email)} className="text-xs px-2 py-1 bg-yellow-700 hover:bg-yellow-800 rounded-md">Revoke Admin</button>
                   : <button onClick={() => grantAdmin(p.email)} className="text-xs px-2 py-1 bg-green-700 hover:bg-green-800 rounded-md">Make Admin</button>
                )}
                {p.email !== PERMANENT_ADMIN_EMAIL && (
                  <button
                    onClick={() => removeUserFromPermissionList(p.email)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title={`Remove ${p.email}`}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

const EditContentModal: React.FC<{
    content: Content;
    onClose: () => void;
    onSave: (updatedContent: Partial<Omit<Content, 'id'>>) => void;
}> = ({ content, onClose, onSave }) => {
    const [editedContent, setEditedContent] = useState(content);

    useEffect(() => {
        setEditedContent(content);
    }, [content]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedContent(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(editedContent);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
                <h3 className="text-xl font-semibold text-white mb-4">Edit Content</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="title" value={editedContent.title} onChange={handleInputChange} placeholder="Content Title" required className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500" />
                    <input type="text" name="thumbnailUrl" value={editedContent.thumbnailUrl} onChange={handleInputChange} placeholder="Thumbnail Image URL" required className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500" />
                    <textarea name="description" value={editedContent.description} onChange={handleInputChange} placeholder="Description" rows={3} className="md:col-span-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500"></textarea>
                    <input type="text" name="driveFileId" value={editedContent.driveFileId} onChange={handleInputChange} placeholder="Google Drive File or Folder ID" required className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500" />
                    <input type="text" name="series" value={editedContent.series || ''} onChange={handleInputChange} placeholder="Series / Playlist Name (optional)" className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500" />
                    <div className="flex gap-4">
                        <select name="type" value={editedContent.type} onChange={handleInputChange} className="flex-grow px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500">
                            <option value="video">Video</option>
                            <option value="document">Document</option>
                            <option value="folder">Folder</option>
                        </select>
                        <input type="text" name="duration" value={editedContent.duration} onChange={handleInputChange} placeholder="e.g., 14:32 or 5 pages" className="flex-grow px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500" />
                    </div>
                </div>
                 <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white font-semibold">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const ContentManagementTab: React.FC = () => {
    const { contentList, addContent, removeContent, updateContent } = useContent();
    const [newContent, setNewContent] = useState<Omit<Content, 'id'>>({
        title: '',
        description: '',
        thumbnailUrl: '',
        driveFileId: '',
        type: 'video',
        duration: '',
        series: ''
    });
    const [isEditing, setIsEditing] = useState<Content | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewContent(prev => ({ ...prev, [name]: value }));
    };

    const handleAddContent = (e: React.FormEvent) => {
        e.preventDefault();
        if (newContent.title && newContent.driveFileId && newContent.thumbnailUrl) {
            addContent(newContent);
            setNewContent({
                title: '', description: '', thumbnailUrl: '', driveFileId: '', type: 'video', duration: '', series: ''
            });
        } else {
            alert('Please fill out all required fields: Title, Thumbnail URL, and Drive File/Folder ID.');
        }
    };
    
    const handleUpdateContent = (updatedContent: Partial<Omit<Content, 'id'>>) => {
        if (isEditing) {
            updateContent(isEditing.id, updatedContent);
        }
    };
    
    const getIcon = (type: Content['type']) => {
        switch(type) {
            case 'video': return <VideoCameraIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />;
            case 'document': return <DocumentTextIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />;
            case 'folder': return <FolderIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />;
        }
    }

    return (
        <>
            {isEditing && (
                <EditContentModal 
                    content={isEditing} 
                    onClose={() => setIsEditing(null)} 
                    onSave={handleUpdateContent} 
                />
            )}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Add New Content</h3>
                <form onSubmit={handleAddContent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="title" value={newContent.title} onChange={handleInputChange} placeholder="Content Title" required className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500" />
                    <input type="text" name="thumbnailUrl" value={newContent.thumbnailUrl} onChange={handleInputChange} placeholder="Thumbnail Image URL" required className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500" />
                    <textarea name="description" value={newContent.description} onChange={handleInputChange} placeholder="Description" rows={3} className="md:col-span-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500"></textarea>
                    <input type="text" name="driveFileId" value={newContent.driveFileId} onChange={handleInputChange} placeholder="Google Drive File or Folder ID" required className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500" />
                    <input type="text" name="series" value={newContent.series} onChange={handleInputChange} placeholder="Series / Playlist Name (optional)" className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500" />
                    <div className="flex gap-4">
                        <select name="type" value={newContent.type} onChange={handleInputChange} className="flex-grow px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500">
                            <option value="video">Video</option>
                            <option value="document">Document</option>
                            <option value="folder">Folder</option>
                        </select>
                        <input type="text" name="duration" value={newContent.duration} onChange={handleInputChange} placeholder="e.g., 14:32 or 5 pages" className="flex-grow px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500" />
                    </div>
                    <button type="submit" className="md:col-span-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors duration-300">Add Content</button>
                </form>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-white mb-4">Manage Content ({contentList.length})</h3>
                 <ul className="space-y-3">
                    {contentList.map(content => (
                        <li key={content.id} className="flex items-center p-3 bg-gray-700 rounded-md space-x-4">
                            {getIcon(content.type)}
                            <div className="flex-grow">
                                <p className="font-semibold text-white">{content.title}</p>
                                {content.series && <p className="text-xs text-blue-400 font-semibold">{content.series}</p>}
                                <p className="text-xs text-gray-400">ID: {content.driveFileId}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button onClick={() => setIsEditing(content)} className="text-gray-400 hover:text-blue-400 transition-colors" title={`Edit ${content.title}`}>
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => removeContent(content.id)} className="text-gray-400 hover:text-red-500 transition-colors" title={`Remove ${content.title}`}>
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'content' | 'users'>('content');

  const TabButton: React.FC<{
      tabName: 'content' | 'users';
      label: string;
      icon: React.ReactNode;
  }> = ({ tabName, label, icon }) => (
      <button
          onClick={() => setActiveTab(tabName)}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tabName ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}
      >
          {icon}
          <span>{label}</span>
      </button>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>
        <div className="flex space-x-2 p-1 bg-gray-800 rounded-lg">
            <TabButton tabName="content" label="Content Management" icon={<CollectionIcon className="h-5 w-5" />} />
            <TabButton tabName="users" label="User Management" icon={<UsersIcon className="h-5 w-5" />} />
        </div>
      </div>
      
      {activeTab === 'content' && <ContentManagementTab />}
      {activeTab === 'users' && <UserManagementTab />}
    </div>
  );
};

export default AdminDashboard;
