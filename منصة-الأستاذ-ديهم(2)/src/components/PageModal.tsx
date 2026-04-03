import React, { useEffect, useState } from 'react';
import { STATIC_PAGES } from '../constants';
import { X } from 'lucide-react';

interface PageModalProps {
  pageId: 'about' | 'privacy' | 'contact' | null;
  onClose: () => void;
}

const PageModal: React.FC<PageModalProps> = ({ pageId, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (pageId) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [pageId]);

  if (!pageId) return null;

  const page = STATIC_PAGES[pageId];

  return (
    <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] no-print transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}>
      <div 
        className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden transform transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* macOS Window Header */}
        <div className="bg-gray-100/80 px-4 py-3 border-b border-gray-200 flex items-center justify-between select-none">
          <div className="flex gap-2">
            <button 
              className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center group"
              onClick={onClose}
            >
              <X className="w-2 h-2 text-red-900 opacity-0 group-hover:opacity-100" />
            </button>
            <div className="w-3.5 h-3.5 rounded-full bg-yellow-400" />
            <div className="w-3.5 h-3.5 rounded-full bg-green-500" />
          </div>
          <div className="text-sm font-medium text-gray-600">{page.title}</div>
          <div className="w-16" /> {/* Spacer for balance */}
        </div>
        {/* Content Body */}
        <div 
          className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-right"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
};

export default PageModal;
