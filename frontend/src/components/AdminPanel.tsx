import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { SyllabusRepository } from './SyllabusRepository';
import { UserManagement } from './UserManagement';
import { SystemStatus } from './SystemStatus';
import { ApprovedNotesRepository } from './ApprovedNotesRepository';
import { Menu } from 'lucide-react';

interface AdminPanelProps {
  onBackToStudent: () => void;
}

export function AdminPanel({ onBackToStudent }: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // Close mobile sidebar when a section is selected
    setIsMobileSidebarOpen(false);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'syllabus':
        return <SyllabusRepository />;
      case 'approved':
        return <ApprovedNotesRepository />;
      case 'users':
        return <UserManagement />;
      case 'system':
        return <SystemStatus />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#121212] text-white overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1E1F20] rounded-lg border border-[#2D2E30]"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/70 z-30"
        />
      )}

      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onBackToStudent={onBackToStudent}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      
      <div className="flex-1 w-full overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}