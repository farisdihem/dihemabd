import { useState, useEffect } from 'react';
import { Key, X } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-3-flash-preview');

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    const storedModel = localStorage.getItem('gemini_model');
    if (storedKey) setApiKey(storedKey);
    if (storedModel) setModel(storedModel);
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      localStorage.setItem('gemini_model', model);
      onClose();
    } else {
      alert('يرجى إدخال مفتاح صحيح');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <Key className="w-5 h-5 text-blue-600" /> إعدادات الذكاء الاصطناعي
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">نموذج الذكاء الاصطناعي</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="gemini-3-flash-preview">Gemini 3 Flash (سريع - افتراضي)</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (أكثر دقة - أبطأ)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">إذا واجهت رسالة "ضغط كبير" (High Demand)، جرب التبديل إلى نموذج Pro.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">مفتاح Gemini API الخاص بك</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              dir="ltr"
              className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 text-left focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <div className="text-sm text-gray-600 mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <strong>كيف أحصل على المفتاح مجاناً؟</strong><br />
              1. اضغط على <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">هذا الرابط (Google AI Studio)</a>.<br />
              2. قم بتسجيل الدخول بحساب Google الخاص بك.<br />
              3. اضغط على زر <strong>Create API Key</strong> وانسخ المفتاح والصقه هنا.
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              إلغاء
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              حفظ المفتاح
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
