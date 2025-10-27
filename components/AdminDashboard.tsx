
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContent } from '../contexts/ContentContext';
import { TrashIcon, CollectionIcon, UsersIcon, VideoCameraIcon, DocumentTextIcon, FolderIcon, CheckCircleIcon, XCircleIcon } from './icons';

const UserManagementTab: React.FC = () => {
  const { 
    permissionList, 
    addUserToPermissionList, 
    removeUserFromPermissionList, 
    user,
    pendingRequests,
    approveRequest,
    denyRequest
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
          {permissionList.map(email => (
            <li
              key={email}
              className="flex justify-between items-center p-3 bg-gray-700 rounded-md"
            >
              <span className="text-gray-200">{email} {user?.email === email && "(You)"}</span>
              <button
                onClick={() => removeUserFromPermissionList(email)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title={`Remove ${email}`}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

const ContentManagementTab: React.FC = () => {
    const { contentList, addContent, removeContent } = useContent();
    const [newContent, setNewContent] = useState({
        title: '',
        description: '',
        thumbnailUrl: '',
        driveFileId: '',
        type: 'video' as 'video' | 'document' | 'folder',
        duration: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewContent(prev => ({ ...prev, [name]: value }));
    };

    const handleAddContent = (e: React.FormEvent) => {
        e.preventDefault();
        if (newContent.title && newContent.driveFileId && newContent.thumbnailUrl) {
            addContent(newContent);
            setNewContent({
                title: '', description: '', thumbnailUrl: '', driveFileId: '', type: 'video', duration: ''
            });
        } else {
            alert('Please fill out all required fields: Title, Thumbnail URL, and Drive File/Folder ID.');
        }
    };
    
    const getIcon = (type: (typeof newContent.type)) => {
        switch(type) {
            case 'video': return <VideoCameraIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />;
            case 'document': return <DocumentTextIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />;
            case 'folder': return <FolderIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />;
        }
    }

    return (
        <>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Add New Content</h3>
                <form onSubmit={handleAddContent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="title" value={newContent.title} onChange={handleInputChange} placeholder="Content Title" required className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500" />
                    <input type="text" name="thumbnailUrl" value={newContent.thumbnailUrl} onChange={handleInputChange} placeholder="Thumbnail Image URL" required className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500" />
                    <textarea name="description" value={newContent.description} onChange={handleInputChange} placeholder="Description" rows={3} className="md:col-span-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500"></textarea>
                    <input type="text" name="driveFileId" value={newContent.driveFileId} onChange={handleInputChange} placeholder="Google Drive File or Folder ID" required className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500" />
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
                                <p className="text-xs text-gray-400">ID: {content.driveFileId}</p>
                            </div>
                            <button onClick={() => removeContent(content.id)} className="text-gray-400 hover:text-red-500 transition-colors" title={`Remove ${content.title}`}>
                                <TrashIcon className="h-5 w-5" />
                            </button>
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
