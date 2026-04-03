import React from 'react';

interface FooterProps {
  onOpenPage: (pageId: 'about' | 'privacy' | 'contact') => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenPage }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-12 py-8 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-gray-600 text-sm">
          {currentYear} جميع الحقوق محفوظة للأستاذ <strong>ديهم عبد اللطيف</strong>.
        </div>
        <div className="flex gap-6 text-sm font-medium text-gray-600">
          <button onClick={() => onOpenPage('about')} className="hover:text-emerald-600 transition-colors">من نحن</button>
          <button onClick={() => onOpenPage('privacy')} className="hover:text-emerald-600 transition-colors">سياسة الخصوصية</button>
          <button onClick={() => onOpenPage('contact')} className="hover:text-emerald-600 transition-colors">اتصل بنا</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
