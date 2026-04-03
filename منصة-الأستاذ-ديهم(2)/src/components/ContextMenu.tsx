import { useState, useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export default function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });

  const handleAction = (action: string) => {
    document.execCommand(action);
    onClose();
  };

  useEffect(() => {
    if (menuRef.current) {
      const menuWidth = menuRef.current.offsetWidth;
      const menuHeight = menuRef.current.offsetHeight;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      let newX = x;
      let newY = y;

      if (x + menuWidth > screenWidth) {
        newX = screenWidth - menuWidth - 10;
      }
      if (y + menuHeight > screenHeight) {
        newY = screenHeight - menuHeight - 10;
      }

      setPos({ x: newX, y: newY });
    }
  }, [x, y]);

  useEffect(() => {
    const handleClick = () => onClose();
    const handleScroll = () => onClose();
    window.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [onClose]);

  return (
    <div 
      ref={menuRef}
      className="fixed z-[9999] bg-white border border-gray-200 shadow-2xl rounded-xl py-1.5 w-52 text-right font-sans animate-in fade-in zoom-in duration-100"
      style={{ top: pos.y, left: pos.x }}
      dir="rtl"
    >
      <button 
        onClick={() => handleAction('cut')}
        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex justify-between items-center transition-colors"
      >
        <span className="font-medium">قص</span>
        <span className="text-gray-400 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">Ctrl+X</span>
      </button>
      <button 
        onClick={() => handleAction('copy')}
        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex justify-between items-center transition-colors"
      >
        <span className="font-medium">نسخ</span>
        <span className="text-gray-400 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">Ctrl+C</span>
      </button>
      <button 
        onClick={() => handleAction('paste')}
        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex justify-between items-center transition-colors"
      >
        <span className="font-medium">لصق</span>
        <span className="text-gray-400 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">Ctrl+V</span>
      </button>
      <div className="h-px bg-gray-100 my-1.5 mx-2" />
      <button 
        onClick={() => handleAction('selectAll')}
        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex justify-between items-center transition-colors"
      >
        <span className="font-medium">تحديد الكل</span>
        <span className="text-gray-400 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">Ctrl+A</span>
      </button>
    </div>
  );
}
