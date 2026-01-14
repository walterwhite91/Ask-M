import { Database, Zap, HardDrive, Activity } from 'lucide-react';

interface LogEntry {
  id: number;
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  timestamp: string;
  message: string;
}

export function SystemStatus() {
  const logs: LogEntry[] = [
    { id: 1, level: 'INFO', timestamp: '14:32:15', message: 'User 2045 connected from 103.10.29.45' },
    { id: 2, level: 'SUCCESS', timestamp: '14:32:08', message: 'Syllabus_DS_2024.pdf parsed successfully' },
    { id: 3, level: 'INFO', timestamp: '14:31:42', message: 'OCR batch processing initiated for 12 documents' },
    { id: 4, level: 'SUCCESS', timestamp: '14:31:15', message: 'Database backup completed (2.3 GB)' },
    { id: 5, level: 'INFO', timestamp: '14:30:58', message: 'AI inference request processed in 145ms' },
    { id: 6, level: 'SUCCESS', timestamp: '14:30:33', message: 'Vector embeddings updated for 45 documents' },
    { id: 7, level: 'WARNING', timestamp: '14:29:12', message: 'High memory usage detected: 78%' },
    { id: 8, level: 'INFO', timestamp: '14:28:45', message: 'Student search query: "binary search trees"' },
    { id: 9, level: 'SUCCESS', timestamp: '14:28:22', message: 'MongoDB connection pool refreshed' },
    { id: 10, level: 'INFO', timestamp: '14:27:58', message: 'System health check completed' }
  ];

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'SUCCESS':
        return 'text-green-400';
      case 'WARNING':
        return 'text-yellow-400';
      case 'ERROR':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  // Mock sparkline data for AI engine
  const sparklineData = [20, 35, 28, 45, 38, 52, 48, 42, 55, 48, 42, 38, 45, 40, 38];

  return (
    <div className="flex-1 overflow-y-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl text-white mb-2">System Status</h1>
        <p className="text-[#A0A0A0]">Real-time monitoring of Ask-M infrastructure</p>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Database Health (Postgres) */}
        <div className="bg-[#2D2E30] rounded-xl p-6 border border-[#3D3E40]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-white text-lg mb-1">Supabase Postgres Instance</h3>
              <p className="text-[#A0A0A0] text-sm">Primary Database</p>
            </div>
            <Database className="w-8 h-8 text-green-400" />
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400">Healthy</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#A0A0A0]">Region</span>
              <span className="text-white">ap-southeast (Singapore)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#A0A0A0]">Pool Mode</span>
              <span className="text-white">Transaction</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#A0A0A0]">Active Connections</span>
              <span className="text-white">14/60</span>
            </div>
          </div>
        </div>

        {/* Card 2: Storage Buckets */}
        <div className="bg-[#2D2E30] rounded-xl p-6 border border-[#3D3E40]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-white text-lg mb-1">Object Storage</h3>
              <p className="text-[#A0A0A0] text-sm">Supabase Storage Buckets</p>
            </div>
            <HardDrive className="w-8 h-8 text-blue-400" />
          </div>

          {/* Raw Uploads Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white">Raw Uploads</span>
              <span className="text-[#A0A0A0]">45GB</span>
            </div>
            <div className="w-full bg-[#3D3E40] rounded-full h-2.5 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '68%' }} />
            </div>
            <p className="text-[#A0A0A0] text-xs mt-1">Bucket: ku-notes-raw</p>
          </div>

          {/* Processed Assets Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white">Processed Assets</span>
              <span className="text-[#A0A0A0]">12GB</span>
            </div>
            <div className="w-full bg-[#3D3E40] rounded-full h-2.5 overflow-hidden">
              <div className="bg-green-500 h-full rounded-full" style={{ width: '18%' }} />
            </div>
            <p className="text-[#A0A0A0] text-xs mt-1">Bucket: ocr-results</p>
          </div>
        </div>

        {/* Card 3: AI & Vectors */}
        <div className="bg-[#2D2E30] rounded-xl p-6 border border-[#3D3E40]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-white text-lg mb-1">Vector Embeddings</h3>
              <p className="text-[#A0A0A0] text-sm">pgvector Extension</p>
            </div>
            <Zap className="w-8 h-8 text-purple-400" />
          </div>

          {/* Large Counter */}
          <div className="mb-4">
            <div className="text-4xl text-white mb-1">14,200</div>
            <p className="text-[#A0A0A0] text-sm">Total Vectors</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#A0A0A0]">Extension</span>
              <span className="text-green-400">pgvector Active</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#A0A0A0]">Embedding Dim</span>
              <span className="text-white">1536</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Logs Console */}
      <div className="bg-[#1E1F20] rounded-xl border border-[#3D3E40] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#3D3E40] flex items-center justify-between">
          <div>
            <h2 className="text-white text-lg">System Logs</h2>
            <p className="text-[#A0A0A0] text-sm mt-1">Real-time system activity stream</p>
          </div>
          <Activity className="w-5 h-5 text-[#A0A0A0]" />
        </div>
        
        <div className="p-6 font-mono text-sm overflow-y-auto" style={{ maxHeight: '400px' }}>
          <div className="space-y-1">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 text-[#A0A0A0] hover:bg-[#2D2E30]/50 px-2 py-1 rounded transition-colors">
                <span className="text-[#666]">{log.timestamp}</span>
                <span className={`${getLevelColor(log.level)} min-w-[70px]`}>[{log.level}]</span>
                <span className="flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}