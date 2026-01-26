import { useState } from 'react';
import { Search, User } from 'lucide-react';

interface AuthUser {
  id: number;
  uid: string;
  email: string;
  lastSignIn: string;
  provider: 'Email' | 'Google';
  role: 'Admin' | 'Student';
  isActive: boolean;
}

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [users, setUsers] = useState<AuthUser[]>([
    {
      id: 1,
      uid: 'user123',
      email: 'admin@example.com',
      lastSignIn: '2023-10-01T10:00:00Z',
      provider: 'Email',
      role: 'Admin',
      isActive: true
    },
    {
      id: 2,
      uid: 'user456',
      email: 'student1@example.com',
      lastSignIn: '2023-10-02T11:00:00Z',
      provider: 'Google',
      role: 'Student',
      isActive: true
    },
    {
      id: 3,
      uid: 'user789',
      email: 'student2@example.com',
      lastSignIn: '2023-10-03T12:00:00Z',
      provider: 'Email',
      role: 'Student',
      isActive: true
    },
    {
      id: 4,
      uid: 'user101',
      email: 'student3@example.com',
      lastSignIn: '2023-10-04T13:00:00Z',
      provider: 'Google',
      role: 'Student',
      isActive: false
    },
    {
      id: 5,
      uid: 'user202',
      email: 'student4@example.com',
      lastSignIn: '2023-10-05T14:00:00Z',
      provider: 'Email',
      role: 'Student',
      isActive: true
    },
    {
      id: 6,
      uid: 'user303',
      email: 'student5@example.com',
      lastSignIn: '2023-10-06T15:00:00Z',
      provider: 'Google',
      role: 'Student',
      isActive: true
    }
  ]);

  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    return parts.length >= 2 
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : email.substring(0, 2).toUpperCase();
  };

  const toggleUserStatus = (id: number) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, isActive: !user.isActive } : user
    ));
  };

  return (
    <div className="flex-1 overflow-auto bg-[#121212] p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl mb-2">Supabase Auth Users</h1>
          <p className="text-[#A0A0A0] text-sm lg:text-base">Manage authenticated users and access control</p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 lg:gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
            <input
              type="text"
              placeholder="Search Student"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2D2E30] border border-[#3D3E40] rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#4D4E50] text-sm lg:text-base"
            />
          </div>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="bg-[#2D2E30] border border-[#3D3E40] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4D4E50] text-sm lg:text-base"
          >
            <option value="all">All Providers</option>
            <option value="Email">Email</option>
            <option value="Google">Google</option>
          </select>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#2D2E30] border border-[#3D3E40] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4D4E50] text-sm lg:text-base"
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Student">Student</option>
          </select>
        </div>

        {/* Student List */}
        <div className="bg-[#2D2E30] rounded-xl border border-[#3D3E40] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#3D3E40]">
                  <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm whitespace-nowrap">User UID</th>
                  <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm whitespace-nowrap">Email</th>
                  <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm whitespace-nowrap">Last Sign-in (UTC)</th>
                  <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm whitespace-nowrap">Provider</th>
                  <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm whitespace-nowrap">Role</th>
                  <th className="text-left px-4 lg:px-6 py-4 text-[#A0A0A0] text-sm whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[#3D3E40] hover:bg-[#3D3E40]/30 transition-colors"
                  >
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#3D3E40] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs lg:text-sm">{getInitials(user.email)}</span>
                        </div>
                        <span className="text-white font-mono text-xs lg:text-sm">{user.uid}</span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-[#A0A0A0] text-xs lg:text-sm">{user.email}</td>
                    <td className="px-4 lg:px-6 py-4 text-[#A0A0A0] text-xs lg:text-sm whitespace-nowrap">{new Date(user.lastSignIn).toLocaleString()}</td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className={`px-2 lg:px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                        user.provider === 'Google'
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                          : 'bg-[#3D3E40] text-[#A0A0A0]'
                      }`}>
                        {user.provider}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className={`px-2 lg:px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                        user.role === 'Admin'
                          ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                          : 'bg-[#3D3E40] text-[#A0A0A0]'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`relative inline-flex h-5 w-9 lg:h-6 lg:w-11 items-center rounded-full transition-colors ${
                            user.isActive ? 'bg-green-600' : 'bg-[#3D3E40]'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 lg:h-4 lg:w-4 transform rounded-full bg-white transition-transform ${
                              user.isActive ? 'translate-x-5 lg:translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`text-xs lg:text-sm whitespace-nowrap ${
                          user.isActive ? 'text-green-400' : 'text-[#A0A0A0]'
                        }`}>
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}