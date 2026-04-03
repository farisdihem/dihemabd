import { useState, useRef, useEffect, useMemo } from 'react';
import { Printer, Download, BookOpen } from 'lucide-react';
import { generateContent } from '../lib/gemini';
import { marked } from 'marked';
import renderMathInElement from 'katex/contrib/auto-render';
import { SUBJECTS, PRIMARY_LEVELS, MIDDLE_LEVELS, HIGH_LEVELS } from '../constants';

export default function LessonTab() {
  const [loading, setLoading] = useState(false);
  const [lessonData, setLessonData] = useState<any>(() => {
    const saved = localStorage.getItem('lessonData');
    return saved ? JSON.parse(saved) : null;
  });
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('lessonFormData');
    return saved ? JSON.parse(saved) : {
      eduLevel: 'middle_high',
      subject: 'الرياضيات',
      domain: 'أنشطة عددية',
      level: 'رابعة متوسط',
      duration: '1 ساعة',
      teacher: '',
      institution: '',
      topic: '',
      competency: '',
      primarySection: '',
      primaryWeek: '',
      primarySession: '',
      instructions: ''
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('lessonFormData', JSON.stringify(formData));
    }, 500);
    return () => clearTimeout(timer);
  }, [formData]);

  useEffect(() => {
    if (lessonData) {
      localStorage.setItem('lessonData', JSON.stringify(lessonData));
    }
  }, [lessonData]);
  const [templateType, setTemplateType] = useState('default');
  const contentRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!formData.teacher || !formData.institution || !formData.topic || !formData.competency) {
      alert('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    setLoading(true);
    try {
      let prompt = `الدور: أنت "أستاذ الرياضيات الذكي" المتخصص في المنهاج الجزائري (الجيل الثاني). مهمتك هي توليد مذكرات واختبارات احترافية بصيغة JSON و LaTeX.

المعطيات:
- الطور التعليمي: ${formData.eduLevel === 'primary' ? 'الابتدائي' : 'المتوسط / الثانوي'}
- المادة: ${formData.subject}
- المستوى: ${formData.level}
- الميدان: ${formData.domain}
- المورد المعرفي (الدرس): ${formData.topic}
- ${formData.eduLevel === 'primary' ? 'الهدف التعلمي' : 'الكفاءة المستهدفة (الأساسية)'}: ${formData.competency}
`;

      if (formData.eduLevel === 'primary') {
        prompt += `- المقطع: ${formData.primarySection}\n- الأسبوع: ${formData.primaryWeek}\n- الحصة: ${formData.primarySession}\n`;
      }

      prompt += `- تعليمات إضافية: ${formData.instructions || "لا توجد"}

هيكل الاستجابة المطلوبة (JSON Structure):
يجب أن تكون المخرجات دائماً بتنسيق JSON لضمان عدم تعطل الموقع:
{
"sectionNumber": "رقم المقطع التعلمي",
"globalCompetency": "الكفاءة الشاملة للميدان",
"levelCompetency": "مستوى من الكفاءة الشاملة",
"targetCompetency": "صياغة دقيقة للكفاءة المستهدفة",
"preparation": "[مرحلة الانطلاق (أستعد) - مكتوبة بتنسيق HTML]",
"discovery": "[مرحلة بناء التعلمات (أكتشف) - مكتوبة بتنسيق HTML]",
"synthesis": "[مرحلة الحوصلة (أحوصل) - مكتوبة بتنسيق HTML]",
"application": "[مرحلة الاستثمار (أستثمر) - مكتوبة بتنسيق HTML]"
}

تعليمات هامة جداً لتنسيق الـ HTML داخل المراحل:
- لا تجعل النص كتلة واحدة! استخدم <p style="margin-bottom: 8px;">، <ul>، <ol>، <li>، و <br>.
- استخدم <strong> للنصوص المهمة.
- اللون الأخضر للمراجع والتمارين: <span style="color: #16a34a; font-weight: bold;">...</span>
- اللون الأحمر للرموز الرياضية والأرقام: <span style="color: #dc2626; font-weight: bold;">...</span>
- في مرحلة "أحوصل"، ضع الخواص في صناديق ملونة:
  <div style="background-color: #e0f2fe; border: 1px solid #7dd3fc; padding: 8px; margin-bottom: 12px;"><strong style="color: #0ea5e9;">خاصية :</strong> ...</div>

ملاحظة صارمة: لا تضف أي نص خارج إطار الـ JSON. استخدم LaTeX لكتابة الكسور والجذور والعمليات الحسابية. استخدم حصراً الرمز $ للمعادلات المضمنة (inline) والرمز $$ للمعادلات المستقلة (display). لا تستخدم \\( أو \\). لا تستخدم Markdown داخل قيم الـ HTML، فقط HTML نقي.`;

      const responseText = await generateContent(prompt, 'application/json');
      const cleanText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsedData = JSON.parse(cleanText);

      const fixMath = (str: string) => str ? str.replace(/\\\(/g, '$').replace(/\\\)/g, '$').replace(/\\\[/g, '$$$').replace(/\\\]/g, '$$$') : '';
      parsedData.preparation = fixMath(parsedData.preparation);
      parsedData.discovery = fixMath(parsedData.discovery);
      parsedData.synthesis = fixMath(parsedData.synthesis);
      parsedData.application = fixMath(parsedData.application);

      setLessonData({ ...parsedData, meta: formData });
    } catch (error: any) {
      alert("حدث خطأ أثناء توليد المذكرة: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lessonData && contentRef.current) {
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
  }, [lessonData, templateType]);

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
      <title>مذكرة ${formData.topic}</title>
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
    link.download = `مذكرة_${formData.topic}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const previewContent = useMemo(() => {
    if (!lessonData) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full min-h-[600px] flex flex-col items-center justify-center text-gray-400 p-8 text-center print:hidden">
          <span className="text-6xl mb-4 opacity-50">✨</span>
          <h3 className="text-lg font-medium text-gray-600 mb-2">لا توجد مذكرة حالياً</h3>
          <p>قم بملء النموذج واضغط على "توليد المذكرة" لإنشاء محتوى الدرس باستخدام الذكاء الاصطناعي.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
          <h3 className="font-semibold text-gray-800">معاينة المذكرة</h3>
          <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
            <select 
              value={templateType}
              onChange={e => setTemplateType(e.target.value)}
              className="flex-1 sm:flex-none text-sm border border-gray-300 rounded-lg py-2 px-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white shadow-sm outline-none"
            >
              <option value="default">التنسيق الافتراضي</option>
              <option value="simple">تنسيق مبسط</option>
            </select>
            <button onClick={handlePrint} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Printer className="w-4 h-4" /> طباعة PDF
            </button>
            <button onClick={handleExportWord} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> تصدير Word
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-8 overflow-y-auto overflow-x-auto bg-white min-h-[600px]">
          <div ref={contentRef} className="font-sans">
            <div className="mb-6">
              <h2 className="text-center text-blue-600 font-bold text-2xl mb-4">مذكرة الموارد للمقطع التعلمي رقم : {lessonData.sectionNumber}</h2>
              <div className="border-2 border-orange-600 p-4 bg-white relative">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-base font-bold text-black mb-2">
                  <div><span className="text-red-600 underline decoration-red-600 underline-offset-4 ml-1">المادة:</span><span>{lessonData.meta.subject}</span></div>
                  <div><span className="text-red-600 underline decoration-red-600 underline-offset-4 ml-1">المستوى:</span><span>{lessonData.meta.level}</span></div>
                  <div><span className="text-red-600 underline decoration-red-600 underline-offset-4 ml-1">الميدان:</span><span>{lessonData.meta.domain}</span></div>
                  <div><span className="text-red-600 underline decoration-red-600 underline-offset-4 ml-1">المدة:</span><span>{lessonData.meta.duration}</span></div>
                  <div><span className="text-red-600 underline decoration-red-600 underline-offset-4 ml-1">الأستاذ:</span><span>{lessonData.meta.teacher}</span></div>
                  <div><span className="text-red-600 underline decoration-red-600 underline-offset-4 ml-1">المؤسسة:</span><span>{lessonData.meta.institution}</span></div>
                  <div><span className="text-red-600 underline decoration-red-600 underline-offset-4 ml-1">المورد:</span><span>{lessonData.meta.topic}</span></div>
                </div>
                <div className="space-y-1 text-base font-bold text-black mt-4">
                  <div><span className="text-red-600 underline decoration-red-600 underline-offset-4 ml-1">الكفاءة الشاملة:</span><span>{lessonData.globalCompetency}</span></div>
                  <div><span className="text-red-600 underline decoration-red-600 underline-offset-4 ml-1">مستوى من الكفاءة الشاملة :</span><span>{lessonData.levelCompetency}</span></div>
                  <div className="text-center mt-3">
                    <span className="text-red-600 underline decoration-red-600 underline-offset-4 ml-1">الكفاءة المستهدفة :</span>
                    <span className="text-purple-700">{lessonData.targetCompetency}</span>
                  </div>
                </div>
              </div>
            </div>

            <table className="w-full border-collapse border-2 border-black">
              <thead>
                <tr>
                  <th className="border-2 border-black p-3 bg-slate-50 text-teal-600 font-bold text-xl text-center">مراحل الحصة</th>
                  <th className="border-2 border-black p-3 bg-slate-50 text-teal-600 font-bold text-xl text-center">المحتوى</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-2 border-black p-3 font-bold text-center text-teal-600 text-xl w-[15%] align-top">أستعد</td>
                  <td className="border-2 border-black p-3 align-top" dangerouslySetInnerHTML={{ __html: lessonData.preparation }} />
                </tr>
                <tr>
                  <td className="border-2 border-black p-3 font-bold text-center text-teal-600 text-xl w-[15%] align-top">أكتشف</td>
                  <td className="border-2 border-black p-3 align-top" dangerouslySetInnerHTML={{ __html: lessonData.discovery }} />
                </tr>
                <tr>
                  <td className="border-2 border-black p-3 font-bold text-center text-teal-600 text-xl w-[15%] align-top">أحوصل</td>
                  <td className="border-2 border-black p-3 align-top" dangerouslySetInnerHTML={{ __html: lessonData.synthesis }} />
                </tr>
                <tr>
                  <td className="border-2 border-black p-3 font-bold text-center text-teal-600 text-xl w-[15%] align-top">أستثمر</td>
                  <td className="border-2 border-black p-3 align-top" dangerouslySetInnerHTML={{ __html: lessonData.application }} />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }, [lessonData, templateType]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar Form */}
      <div className="lg:col-span-4 space-y-6 print:hidden">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📋</span> معلومات المذكرة
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">الطور التعليمي</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="eduLevel" 
                  value="middle_high" 
                  checked={formData.eduLevel === 'middle_high'}
                  onChange={e => setFormData({...formData, eduLevel: e.target.value})}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-800">المتوسط / الثانوي</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="eduLevel" 
                  value="primary" 
                  checked={formData.eduLevel === 'primary'}
                  onChange={e => setFormData({...formData, eduLevel: e.target.value})}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-800">الابتدائي</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المادة</label>
              <select 
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5"
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الميدان</label>
              <input 
                type="text" 
                value={formData.domain}
                onChange={e => setFormData({...formData, domain: e.target.value})}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5" 
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المستوى</label>
                <select 
                  value={formData.level}
                  onChange={e => setFormData({...formData, level: e.target.value})}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5" 
                >
                  {formData.eduLevel === 'primary' 
                    ? PRIMARY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)
                    : [...MIDDLE_LEVELS, ...HIGH_LEVELS].map(l => <option key={l} value={l}>{l}</option>)
                  }
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المدة</label>
                <select 
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: e.target.value})}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5"
                >
                  <option value="1 ساعة">1 ساعة</option>
                  <option value="2 ساعتان">2 ساعتان</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الأستاذ</label>
                <input 
                  type="text" 
                  value={formData.teacher}
                  onChange={e => setFormData({...formData, teacher: e.target.value})}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5" 
                  placeholder="اسم الأستاذ" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المؤسسة</label>
                <input 
                  type="text" 
                  value={formData.institution}
                  onChange={e => setFormData({...formData, institution: e.target.value})}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5" 
                  placeholder="اسم المؤسسة" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المورد (الدرس)</label>
              <input 
                type="text" 
                value={formData.topic}
                onChange={e => setFormData({...formData, topic: e.target.value})}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5" 
                placeholder="مثال: إنشاء منصف زاوية" 
              />
            </div>

            {formData.eduLevel === 'primary' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المقطع</label>
                    <input type="text" value={formData.primarySection} onChange={e => setFormData({...formData, primarySection: e.target.value})} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الأسبوع</label>
                    <input type="text" value={formData.primaryWeek} onChange={e => setFormData({...formData, primaryWeek: e.target.value})} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحصة</label>
                    <input type="text" value={formData.primarySession} onChange={e => setFormData({...formData, primarySession: e.target.value})} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الهدف التعلمي</label>
                  <input type="text" value={formData.competency} onChange={e => setFormData({...formData, competency: e.target.value})} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5" />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الكفاءة المستهدفة</label>
                <input type="text" value={formData.competency} onChange={e => setFormData({...formData, competency: e.target.value})} className="w-full rounded-xl border-gray-300 shadow-sm focus:border-emerald-500 bg-gray-50 border p-2.5" />
              </div>
            )}

            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري التوليد...' : 'توليد المذكرة'}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="lg:col-span-8">
        {previewContent}
      </div>
    </div>
  );
}
