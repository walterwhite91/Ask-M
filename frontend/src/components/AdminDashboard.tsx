import { FileText, FileCheck, Users, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  accentColor: string;
}

function StatCard({ title, value, icon, accentColor }: StatCardProps) {
  return (
    <div className="bg-[#2D2E30] rounded-xl p-5 flex items-center gap-4 border border-[#3D3E40]">
      <div className={`p-2.5 rounded-lg ${accentColor} flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[#A0A0A0] text-xs mb-1 whitespace-nowrap overflow-hidden text-ellipsis">{title}</p>
        <p className="text-2xl text-white font-medium">{value}</p>
      </div>
    </div>
  );
}

interface ActivityItem {
  id: number;
  timestamp: string;
  actionType: string;
  details: string;
  status: 'success' | 'pending' | 'failed';
}

export function AdminDashboard() {
  const stats = [
    {
      title: 'Total Syllabus Documents',
      value: '145',
      icon: <FileText className="w-6 h-6 text-white" />,
      accentColor: 'bg-blue-600/20'
    },
    {
      title: 'Notes Processed (OCR)',
      value: '1,200',
      icon: <FileCheck className="w-6 h-6 text-white" />,
      accentColor: 'bg-green-600/20'
    },
    {
      title: 'Active Students',
      value: '350',
      icon: <Users className="w-6 h-6 text-white" />,
      accentColor: 'bg-purple-600/20'
    },
    {
      title: 'Queries This Month',
      value: '12,500',
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      accentColor: 'bg-orange-600/20'
    }
  ];

  const recentActivity: ActivityItem[] = [
    { id: 1, timestamp: '10 mins ago', actionType: 'Syllabus Upload', details: 'CS205 - Data Structures uploaded by Admin', status: 'success' },
    { id: 2, timestamp: '25 mins ago', actionType: 'Note Vectorization', details: 'MTH101 - Calculus lecture notes processing', status: 'pending' },
    { id: 3, timestamp: '1 hour ago', actionType: 'User Registration', details: 'New student: johndoe@ku.edu.np', status: 'success' },
    { id: 4, timestamp: '2 hours ago', actionType: 'Syllabus Update', details: 'PHY202 - Modern Physics updated', status: 'success' },
    { id: 5, timestamp: '3 hours ago', actionType: 'OCR Failed', details: 'Handwritten notes: Low quality scan', status: 'failed' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-600/20 text-green-400';
      case 'pending': return 'bg-yellow-600/20 text-yellow-400';
      case 'failed': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-[#121212] p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl mb-2">Admin Dashboard</h1>
          <p className="text-[#A0A0A0] text-sm lg:text-base">Manage your Ask-M AI academic assistant</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-[#2D2E30] rounded-xl border border-[#3D3E40] overflow-hidden">
          <div className="p-6 border-b border-[#3D3E40]">
            <h2 className="text-xl text-white">Recent Activity</h2>
            <p className="text-[#A0A0A0] text-sm mt-1">Latest system actions and events</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#3D3E40]">
                  <th className="text-left px-6 py-4 text-[#A0A0A0] text-sm">Timestamp</th>
                  <th className="text-left px-6 py-4 text-[#A0A0A0] text-sm">Action Type</th>
                  <th className="text-left px-6 py-4 text-[#A0A0A0] text-sm">Details</th>
                  <th className="text-left px-6 py-4 text-[#A0A0A0] text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="border-b border-[#3D3E40] hover:bg-[#3D3E40]/30 transition-colors">
                    <td className="px-6 py-4 text-white text-sm">{activity.timestamp}</td>
                    <td className="px-6 py-4 text-white text-sm">{activity.actionType}</td>
                    <td className="px-6 py-4 text-[#A0A0A0] text-sm">{activity.details}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(activity.status)}`}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
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