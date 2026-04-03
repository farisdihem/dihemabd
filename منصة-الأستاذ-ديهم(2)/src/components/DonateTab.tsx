import React from 'react';
import { Heart, Coffee, CreditCard, Gift } from 'lucide-react';

export default function DonateTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">دعم وتبرع للمنصة</h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          هذه المنصة مجانية تماماً ومفتوحة المصدر، تهدف إلى مساعدة الأساتذة في الجزائر على أداء مهامهم النبيلة بسهولة واحترافية. 
          دعمكم لنا، مهما كان بسيطاً، يساعدنا على تغطية تكاليف الاستضافة وتطوير ميزات جديدة وتحديث المنصة باستمرار.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BaridiMob / CCP */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">بريد الجزائر (CCP / BaridiMob)</h3>
              <p className="text-sm text-gray-500">للتبرع من داخل الجزائر</p>
            </div>
          </div>
          
          <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm text-gray-500 mb-1">رقم الحساب البريدي (CCP):</p>
              <p className="font-mono text-lg font-bold text-gray-800 text-left" dir="ltr">0029203458 38</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">الاسم واللقب:</p>
              <p className="font-bold text-gray-800">DIHEM ABDELATIF</p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-1">رقم الحساب البنكي (RIP) لـ BaridiMob:</p>
              <p className="font-mono text-lg font-bold text-gray-800 text-left" dir="ltr">00799999002920345838</p>
            </div>
          </div>
        </div>

        {/* Other Methods */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">طرق أخرى للدعم</h3>
                <p className="text-sm text-gray-500">للتبرع من خارج الجزائر أو عبر الإنترنت</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              إذا كنت تفضل استخدام طرق دفع أخرى مثل PayPal أو بطاقات الائتمان، يمكنك التواصل معنا مباشرة لتزويدك بالمعلومات اللازمة.
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
            <Gift className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-orange-800 font-medium">
              شكراً جزيلاً لكل من يساهم في دعم هذا المشروع التعليمي!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
