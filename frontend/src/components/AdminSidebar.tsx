import { useState } from 'react';
import { LayoutDashboard, FileText, Users, Activity, ChevronDown, ChevronRight, ArrowLeft, BookOpen, CheckCircle } from 'lucide-react';
import logoImage from '../assets/logo.jpg';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onBackToStudent: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({
  activeSection,
  onSectionChange,
  onBackToStudent,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  isCollapsed = false,
  onToggleCollapse
}: AdminSidebarProps) {
  // Track if Content Management submenu is open
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'content',
      label: 'Content Management',
      icon: FileText,
      hasSubmenu: true,
      submenu: [
        { id: 'syllabus', label: 'Syllabus Repository', icon: BookOpen },
        { id: 'approved', label: 'Approved Notes Repository', icon: CheckCircle }
      ]
    },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'system', label: 'System Status', icon: Activity },
  ];

  // Handle clicking on a navigation item
  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.hasSubmenu) {
      // Toggle submenu open/closed
      setIsSubmenuOpen(!isSubmenuOpen);
    } else {
      // Go to that section
      onSectionChange(item.id);
    }
  };

  // Determine if a button should be highlighted
  const isActive = (id: string) => activeSection === id;

  return (
    <div className={`
      bg-[#1E1F20] h-full flex flex-col border-r border-[#2D2E30]
      fixed lg:relative z-40 transition-all duration-300
      ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      ${isCollapsed ? 'lg:w-16' : 'w-72'}
    `}>
      {/* Header with Logo */}
      <div className="p-4 border-b border-[#2D2E30]">
        {!isCollapsed ? (
          <div
            onClick={onToggleCollapse}
            className="flex items-center gap-3 cursor-pointer"
            title="Collapse sidebar"
          >
            <img src={logoImage} alt="Ask-M Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl">Ask-M Admin</span>
          </div>
        ) : (
          <img
            src={logoImage}
            alt="Ask-M Logo"
            className="w-8 h-8 object-contain mx-auto cursor-pointer"
            onClick={onToggleCollapse}
            title="Expand sidebar"
          />
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <div key={item.id}>
              {/* Main Navigation Button */}
              <button
                onClick={() => handleNavClick(item)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  ${isActive(item.id) ? 'bg-[#3D3E40] text-white' : 'text-[#A0A0A0] hover:bg-[#2D2E30] hover:text-white'}
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.hasSubmenu && (
                      isSubmenuOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    )}
                  </>
                )}
              </button>

              {/* Submenu Items (when expanded) */}
              {item.hasSubmenu && isSubmenuOpen && !isCollapsed && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.submenu?.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => onSectionChange(subItem.id)}
                      className={`
                        w-full text-left px-4 py-2 rounded-lg text-sm
                        ${isActive(subItem.id) ? 'bg-[#3D3E40] text-white' : 'text-[#A0A0A0] hover:bg-[#2D2E30] hover:text-white'}
                      `}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Submenu Icons (when collapsed) */}
              {item.hasSubmenu && isSubmenuOpen && isCollapsed && (
                <div className="mt-1 space-y-1">
                  {item.submenu?.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => onSectionChange(subItem.id)}
                      className={`
                        w-full flex items-center justify-center px-4 py-3 rounded-lg
                        ${isActive(subItem.id) ? 'bg-[#3D3E40] text-white' : 'text-[#A0A0A0] hover:bg-[#2D2E30] hover:text-white'}
                      `}
                      title={subItem.label}
                    >
                      <subItem.icon className="w-5 h-5 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Back to Student View Button */}
      <div className="p-4 border-t border-[#2D2E30]">
        {!isCollapsed ? (
          <button
            onClick={onBackToStudent}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#3D3E40] hover:bg-[#4D4E50] text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Student View</span>
          </button>
        ) : (
          <button
            onClick={onBackToStudent}
            className="w-full flex items-center justify-center p-3 rounded-lg bg-[#3D3E40] hover:bg-[#4D4E50] text-white"
            title="Back to Student View"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}