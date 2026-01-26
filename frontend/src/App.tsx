import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { SearchInput } from './components/SearchInput';
import { ProfileSettings } from './components/ProfileSettings';
import { AdminPanel } from './components/AdminPanel';
import { LogoutModal } from './components/LogoutModal';
import { LoginPage } from './components/LoginPage';
import { SearchProgressBar } from './components/SearchProgressBar';
import { Menu } from 'lucide-react';

export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeSearch, setActiveSearch] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [searchHistory, setSearchHistory] = useState([
    { id: 1, title: 'Data Structures: Trees Summary', timestamp: '2 hours ago' },
    { id: 2, title: 'KU Syllabus Topic 3.2', timestamp: '5 hours ago' },
    { id: 3, title: 'Lecture 5 Notes OCR', timestamp: 'Yesterday' },
    { id: 4, title: 'Algorithms: Dynamic Programming', timestamp: '2 days ago' },
  ]);

  const handleNewSearch = () => {
    setActiveSearch(null);
  };

  const handleSearch = (query: string) => {
    setActiveSearch(query);
    setIsSearching(true);

    // Reset searching state after simulated loading time
    setTimeout(() => {
      setIsSearching(false);
    }, 4000); // Match the total loading + streaming time

    // Add to history
    const newHistoryItem = {
      id: searchHistory.length + 1,
      title: query.length > 40 ? query.substring(0, 40) + '...' : query,
      timestamp: 'Just now',
    };
    setSearchHistory([newHistoryItem, ...searchHistory]);
  };

  const handleHistoryClick = (item: any) => {
    setActiveSearch(item.title);
  };

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name);
    // Handle OCR processing here
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    setIsLoggedIn(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      {showAdminPanel ? (
        <AdminPanel onBackToStudent={() => setShowAdminPanel(false)} />
      ) : (
        <div className="flex h-screen bg-[#121212] text-white overflow-hidden">
          {/* Search Progress Bar */}
          <SearchProgressBar isSearching={isSearching} />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden fixed top-4 left-4 z-40 p-2 bg-[#1E1F20] rounded-lg border border-[#2D2E30]"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          {/* Mobile Sidebar Overlay */}
          {isMobileSidebarOpen && (
            <div
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/70 z-30"
            />
          )}

          {/* Sidebar */}
          <div className={`
            fixed md:relative z-40 h-full
            transition-transform duration-300
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              onNewSearch={handleNewSearch}
              searchHistory={searchHistory}
              onHistoryClick={handleHistoryClick}
              onOpenProfileSettings={() => setShowProfileSettings(true)}
              onMobileClose={() => setIsMobileSidebarOpen(false)}
              onOpenAdminPanel={() => setShowAdminPanel(true)}
              onLogout={() => setShowLogoutModal(true)}
            />
          </div>

          <div className="flex-1 flex flex-col relative w-full">
            <MainContent
              activeSearch={activeSearch}
              onQuickStart={handleSearch}
            />

            <SearchInput
              onSearch={handleSearch}
              onFileUpload={handleFileUpload}
              isSearching={isSearching}
            />
          </div>

          {showProfileSettings && (
            <ProfileSettings onClose={() => setShowProfileSettings(false)} />
          )}

          {showLogoutModal && (
            <LogoutModal
              onConfirm={handleLogoutConfirm}
              onCancel={() => setShowLogoutModal(false)}
            />
          )}
        </div>
      )}
    </>
  );
}
