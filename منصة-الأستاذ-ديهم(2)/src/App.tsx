import { useState, useEffect, useCallback, MouseEvent as ReactMouseEvent } from 'react';
import { Book, FileText, BarChart2, Target, Settings, Heart } from 'lucide-react';
import ExamTab from './components/ExamTab';
import LessonTab from './components/LessonTab';
import NotesTab from './components/NotesTab';
import GuidedTab from './components/GuidedTab';
import DonateTab from './components/DonateTab';
import SettingsModal from './components/SettingsModal';
import Footer from './components/Footer';
import PageModal from './components/PageModal';
import ContextMenu from './components/ContextMenu';

export default function App() {
  const [activeTab, setActiveTab] = useState('exam');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activePage, setActivePage] = useState<'about' | 'privacy' | 'contact' | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  // Initialize API key from local storage
  useEffect(() => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      setIsSettingsOpen(true);
    }
  }, []);

  const handleContextMenu = useCallback((e: ReactMouseEvent) => {
    // Only show custom menu if we're not in a native Electron environment 
    // or if the user explicitly wants it.
    // For the web preview, this is essential.
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div 
      className="min-h-screen bg-[#f5f5f0] font-sans" 
      dir="rtl"
      onContextMenu={handleContextMenu}
    >
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:h-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 text-2xl">📚</span>
              <h1 className="text-xl font-bold text-gray-800">منصة الأستاذ ديهم</h1>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors sm:hidden"
              title="الإعدادات"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto hide-scrollbar pb-2 sm:pb-0">
            <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('exam')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'exam' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <FileText className="w-4 h-4" /> الاختبارات
              </button>
              <button
                onClick={() => setActiveTab('lesson')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'lesson' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                <Book className="w-4 h-4" /> المذكرات
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'notes' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                }`}
              >
                <BarChart2 className="w-4 h-4" /> الملاحظات
              </button>
              <button
                onClick={() => setActiveTab('guided')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'guided' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                <Target className="w-4 h-4" /> مذكرة الترسيم
              </button>
              <button
                onClick={() => setActiveTab('donate')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'donate' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                <Heart className="w-4 h-4" /> ادعمنا
              </button>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors hidden sm:flex"
              title="الإعدادات"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div style={{ display: activeTab === 'exam' ? 'block' : 'none' }}><ExamTab /></div>
        <div style={{ display: activeTab === 'lesson' ? 'block' : 'none' }}><LessonTab /></div>
        <div style={{ display: activeTab === 'notes' ? 'block' : 'none' }}><NotesTab /></div>
        <div style={{ display: activeTab === 'guided' ? 'block' : 'none' }}><GuidedTab /></div>
        <div style={{ display: activeTab === 'donate' ? 'block' : 'none' }}><DonateTab /></div>
      </main>

      <Footer onOpenPage={setActivePage} />

      {/* Settings Modal */}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
      
      <PageModal pageId={activePage} onClose={() => setActivePage(null)} />

      {/* Custom Context Menu */}
      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onClose={() => setContextMenu(null)} 
        />
      )}
    </div>
  );
}
