import React, { useState, useRef, useEffect } from 'react';
import { Printer, Download } from 'lucide-react';
import { generateContent } from '../lib/gemini';
import renderMathInElement from 'katex/contrib/auto-render';
import { SUBJECTS, ALL_LEVELS } from '../constants';

export default function GuidedTab() {
  const [loading, setLoading] = useState(false);
  const [guidedData, setGuidedData] = useState<string | null>(() => {
    const saved = localStorage.getItem('guidedData');
    return saved || null;
  });
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('guidedFormData');
    return saved ? JSON.parse(saved) : {
      level: 'السنة الرابعة متوسط',
      subject: 'الرياضيات',
      domain: '',
      topic: '',
      competence: '',
      focus: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('guidedFormData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (guidedData) {
      localStorage.setItem('guidedData', guidedData);
    }
  }, [guidedData]);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.domain || !formData.topic) {
      alert('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    setLoading(true);
    try {
      const prompt = `أنت أستاذ ومفتش خبير في مادة ${formData.subject} في الجزائر.
المطلوب: إعداد "مذكرة أعمال موجهة" (جذاذة) احترافية ومفصلة.

المعلومات الأساسية:
- المستوى: ${formData.level}
- الميدان المعرفي: ${formData.domain}
- موضوع الحصة: ${formData.topic}
${formData.competence ? `- الكفاءة المستهدفة: ${formData.competence}` : ''}
${formData.focus ? `- التركيز الأساسي (الصعوبات المراد معالجتها): ${formData.focus}` : ''}

يجب أن تكون المذكرة مصممة وفق المقاربة بالكفاءات للجيل الثاني في الجزائر.
قم بتوليد كود HTML نقي (بدون Markdown) يحتوي على المذكرة كاملة بالتنسيق التالي:

<div style="font-family: Tahoma, 'Segoe UI', 'Simplified Arabic', Arial, sans-serif; direction: rtl;">
    <h2 style="text-align: center; font-weight: bold; text-decoration: underline; margin-bottom: 20px;">مذكرة أعمال موجهة</h2>
    
    <table style="width: 100%; border-collapse: collapse; border: 2px solid black; margin-bottom: 20px;">
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>المادة:</strong> ${formData.subject}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>المستوى:</strong> ${formData.level}</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>الميدان:</strong> ${formData.domain}</td>
            <td style="border: 1px solid black; padding: 8px;"><strong>الموضوع:</strong> ${formData.topic}</td>
        </tr>
        <tr>
            <td colspan="2" style="border: 1px solid black; padding: 8px;"><strong>الكفاءة المستهدفة:</strong> [اكتب الكفاءة المستهدفة هنا بدقة]</td>
        </tr>
    </table>

    <table style="width: 100%; border-collapse: collapse; border: 2px solid black; text-align: right;">
        <thead>
            <tr style="background-color: #f3f4f6;">
                <th style="border: 1px solid black; padding: 8px; width: 10%; text-align: center;">المراحل</th>
                <th style="border: 1px solid black; padding: 8px; width: 10%; text-align: center;">المدة</th>
                <th style="border: 1px solid black; padding: 8px; width: 35%; text-align: center;">أنشطة الأستاذ (الوضعيات والتمارين)</th>
                <th style="border: 1px solid black; padding: 8px; width: 35%; text-align: center;">أنشطة المتعلم (الحل النموذجي)</th>
                <th style="border: 1px solid black; padding: 8px; width: 10%; text-align: center;">التقويم</th>
            </tr>
        </thead>
        <tbody>
            <!-- أضف صفوف المرحلة التمهيدية، مرحلة الإنجاز (التدريب)، ومرحلة الحوصلة هنا -->
        </tbody>
    </table>
</div>

قواعد هامة:
- التزم بالهيكل أعلاه حرفياً، وقم بتعبئة البيانات والصفوف اللازمة.
- اجعل المحتوى غنياً ومفصلاً (تمارين متدرجة الصعوبة، حلول مفصلة).
- استخدم LaTeX للمعادلات الرياضية (بين $ $).
- لا تستخدم Tailwind classes.
- أخرج HTML فقط بدون أي نصوص إضافية أو علامات Markdown (\`\`\`html).`;

      const responseText = await generateContent(prompt, 'text/plain');
      const cleanHtml = responseText.replace(/```html/gi, '').replace(/```/g, '').trim();
      setGuidedData(cleanHtml);
    } catch (error: any) {
      alert("حدث خطأ أثناء التوليد: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (guidedData && contentRef.current) {
      renderMathInElement(contentRef.current, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '\\[', right: '\\]', display: true},
          {left: '$', right: '$', display: false},
          {left: '\\(', right: '\\)', display: false}
        ],
        throwOnError: false
      });
    }
  }, [guidedData]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    if (!contentRef.current) return;
    const clone = contentRef.current.cloneNode(true) as HTMLElement;
    
    // Fix page breaks for Word
    const pageBreaks = clone.querySelectorAll('.page-break');
    pageBreaks.forEach(pb => {
        const br = document.createElement('br');
        br.setAttribute('clear', 'all');
        br.setAttribute('style', 'page-break-before:always; mso-break-type:page-break;');
        if (pb.parentNode) pb.parentNode.replaceChild(br, pb);
    });

    // Convert grid and flex layouts to tables for Word
    const gridElements = clone.querySelectorAll('[class*="grid-cols-"], .flex.justify-between');
    gridElements.forEach(el => {
        const table = document.createElement('table');
        table.className = 'layout-table';
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginBottom = '10pt';
        table.setAttribute('dir', 'rtl');
        
        let cols = 2;
        if (el.className.includes('grid-cols-3')) cols = 3;
        if (el.className.includes('grid-cols-4')) cols = 4;
        
        const children = Array.from(el.children);
        let tr = document.createElement('tr');
        
        children.forEach((child, index) => {
            const td = document.createElement('td');
            td.style.border = 'none';
            td.style.padding = '4pt';
            td.style.verticalAlign = 'top';
            td.style.width = `${100 / cols}%`;
            
            if (el.classList.contains('justify-between') && cols === 2) {
                td.style.textAlign = index === 0 ? 'right' : 'left';
            } else {
                td.style.textAlign = 'right';
            }
            
            td.innerHTML = child.innerHTML;
            tr.appendChild(td);
            
            if ((index + 1) % cols === 0 || index === children.length - 1) {
                table.appendChild(tr);
                tr = document.createElement('tr');
            }
        });
        
        if (el.parentNode) el.parentNode.replaceChild(table, el);
    });

    // Fix text alignment and colors for Word using inline styles and attributes
    const allElements = clone.querySelectorAll('*');
    allElements.forEach(el => {
        const htmlEl = el as HTMLElement;
        // Apply base styles to text elements
        if (['P', 'H1', 'H2', 'H3', 'LI', 'TD', 'TH', 'DIV', 'SPAN'].includes(htmlEl.tagName)) {
            htmlEl.style.fontFamily = "Tahoma, 'Segoe UI', 'Simplified Arabic', Arial, sans-serif";
            htmlEl.style.color = "#000000";
            if (!htmlEl.getAttribute('dir') && htmlEl.tagName !== 'SPAN') htmlEl.setAttribute('dir', 'rtl');
        }
        
        if (['P', 'H1', 'H2', 'H3', 'DIV'].includes(htmlEl.tagName) && !htmlEl.classList.contains('layout-table')) {
            if (!htmlEl.style.textAlign) htmlEl.style.textAlign = 'right';
            if (!htmlEl.getAttribute('align')) htmlEl.setAttribute('align', 'right');
        }

        if (htmlEl.tagName === 'H1') { htmlEl.style.fontSize = '18pt'; htmlEl.style.fontWeight = 'bold'; htmlEl.style.textAlign = 'center'; htmlEl.setAttribute('align', 'center'); }
        if (htmlEl.tagName === 'H2' || htmlEl.tagName === 'H3') { htmlEl.style.fontSize = '16pt'; htmlEl.style.fontWeight = 'bold'; }
        if (htmlEl.tagName === 'P' || htmlEl.tagName === 'LI') { htmlEl.style.fontSize = '14pt'; htmlEl.style.lineHeight = '1.6'; }

        if (htmlEl.tagName === 'TABLE' && !htmlEl.classList.contains('layout-table')) {
            htmlEl.style.borderCollapse = 'collapse';
            htmlEl.style.width = '100%';
            htmlEl.style.marginBottom = '12pt';
            htmlEl.setAttribute('border', '1');
        }
        if ((htmlEl.tagName === 'TH' || htmlEl.tagName === 'TD') && !htmlEl.closest('.layout-table')) {
            htmlEl.style.border = '1pt solid #000000';
            htmlEl.style.padding = '6pt';
            if (!htmlEl.style.textAlign) htmlEl.style.textAlign = 'center';
        }
        if (htmlEl.tagName === 'IMG') {
            htmlEl.style.maxWidth = '100%';
            htmlEl.style.height = 'auto';
            htmlEl.style.display = 'block';
            htmlEl.style.margin = '10pt auto';
        }

        if (htmlEl.classList) {
            if (htmlEl.classList.contains('text-center')) { htmlEl.style.textAlign = 'center'; htmlEl.setAttribute('align', 'center'); }
            if (htmlEl.classList.contains('text-right')) { htmlEl.style.textAlign = 'right'; htmlEl.setAttribute('align', 'right'); }
            if (htmlEl.classList.contains('text-left')) { htmlEl.style.textAlign = 'left'; htmlEl.setAttribute('align', 'left'); }
            if (htmlEl.classList.contains('font-bold')) htmlEl.style.fontWeight = 'bold';
            if (htmlEl.classList.contains('underline')) htmlEl.style.textDecoration = 'underline';
            if (htmlEl.classList.contains('text-red-600')) htmlEl.style.color = '#dc2626';
            if (htmlEl.classList.contains('text-blue-600')) htmlEl.style.color = '#2563eb';
        }
    });

    const katexElements = clone.querySelectorAll('.katex');
    katexElements.forEach(el => {
        const isBlock = el.parentElement?.classList.contains('katex-display');
        const mathml = el.querySelector('.katex-mathml math');
        if (mathml) {
            const semantics = mathml.querySelector('semantics');
            if (semantics) {
                const annotation = semantics.querySelector('annotation');
                if (annotation) annotation.remove();
                while (semantics.firstChild) mathml.appendChild(semantics.firstChild);
                semantics.remove();
            }
            mathml.setAttribute('dir', 'ltr');
            mathml.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');
            mathml.setAttribute('display', isBlock ? 'block' : 'inline');
            (mathml as HTMLElement).style.fontFamily = "'Cambria Math', serif";
            
            const wrapper = document.createElement(isBlock ? 'div' : 'span');
            wrapper.setAttribute('dir', 'ltr');
            wrapper.style.direction = 'ltr';
            wrapper.style.display = isBlock ? 'block' : 'inline-block';
            wrapper.style.fontFamily = "'Cambria Math', serif";
            if (isBlock) {
                wrapper.style.textAlign = 'center';
                wrapper.setAttribute('align', 'center');
                wrapper.style.margin = '10pt 0';
            }
            
            wrapper.appendChild(mathml);
            
            if (isBlock && el.parentElement) {
                el.parentElement.replaceWith(wrapper);
            } else if (el.parentNode) {
                el.parentNode.replaceChild(wrapper, el);
            }
        } else {
            const text = el.textContent || '';
            const wrapper = document.createElement('span');
            wrapper.setAttribute('dir', 'ltr');
            wrapper.style.direction = 'ltr';
            wrapper.textContent = text;
            if (el.parentNode) el.parentNode.replaceChild(wrapper, el);
        }
    });

    const html = `
      <html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <title>مذكرة أعمال موجهة</title>
      <!--[if gte mso 9]>
      <xml>
          <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
              <w:RightToLeft/>
          </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
          @page WordSection1 {
              size: 595.3pt 841.9pt;
              margin: 36.0pt 36.0pt 36.0pt 36.0pt;
              mso-header-margin: 35.4pt;
              mso-footer-margin: 35.4pt;
              mso-paper-source: 0;
          }
          div.WordSection1 { page: WordSection1; }
          body { font-family: Tahoma, 'Segoe UI', 'Simplified Arabic', Arial, sans-serif; direction: rtl; text-align: right; font-size: 14pt; color: #000000; }
          table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
          th, td { border: 1pt solid #000000; padding: 6pt; text-align: center; }
          img { max-width: 100%; height: auto; border: 1pt solid #dddddd; margin: 10pt auto; display: block; }
      </style>
      </head>
      <body dir="rtl">
          <div class="WordSection1" dir="rtl">
              ${clone.innerHTML}
          </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `مذكرة_أعمال_موجهة.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 print:hidden">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">صانع مذكرات الأعمال الموجهة</h2>
          <p className="text-gray-500">قم بتوليد مذكرات الأعمال الموجهة (أنشطة، تمارين، معالجة) متوافقة مع المقاربة بالكفاءات.</p>
        </div>

        <form onSubmit={handleGenerate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">المستوى الدراسي</label>
              <select 
                value={formData.level}
                onChange={e => setFormData({...formData, level: e.target.value})}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5" 
                required
              >
                {ALL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">المادة</label>
              <select 
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5" 
                required 
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الميدان المعرفي</label>
              <input 
                type="text" 
                value={formData.domain}
                onChange={e => setFormData({...formData, domain: e.target.value})}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5" 
                placeholder="مثال: أنشطة عددية، أنشطة هندسية..." 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">موضوع الحصة</label>
              <input 
                type="text" 
                value={formData.topic}
                onChange={e => setFormData({...formData, topic: e.target.value})}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5" 
                placeholder="مثال: حل معادلات، نظرية طالس..." 
                required 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">الكفاءة المستهدفة (اختياري)</label>
              <input 
                type="text" 
                value={formData.competence}
                onChange={e => setFormData({...formData, competence: e.target.value})}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5" 
                placeholder="مثال: أن يكون التلميذ قادراً على توظيف خاصية طالس..." 
              />
              <p className="text-xs text-gray-500 mt-1">سيقوم الذكاء الاصطناعي باقتراحها إن تركت فارغة.</p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">التركيز الأساسي للحصة (الصعوبات المراد معالجتها)</label>
              <textarea 
                value={formData.focus}
                onChange={e => setFormData({...formData, focus: e.target.value})}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5" 
                placeholder="مثال: التركيز على توحيد المقامات، أو منهجية البرهان الهندسي..." 
                rows={2}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg disabled:opacity-50"
          >
            {loading ? 'جاري التوليد...' : '✨ توليد مذكرة الأعمال الموجهة'}
          </button>
        </form>
      </div>

      {guidedData && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4 print:hidden">
            <h3 className="text-xl font-bold text-gray-800">النتيجة:</h3>
            <div className="flex gap-2">
              <button onClick={handleExportWord} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm font-bold">
                <Download className="w-4 h-4" /> تنزيل Word
              </button>
              <button onClick={handlePrint} className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-2 text-sm font-bold">
                <Printer className="w-4 h-4" /> طباعة
              </button>
            </div>
          </div>
          
          <div 
            ref={contentRef}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 print:shadow-none print:border-none print:p-0"
            dangerouslySetInnerHTML={{ __html: guidedData }}
          />
        </div>
      )}
    </div>
  );
}
