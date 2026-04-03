import { useState, useRef, useEffect, useMemo } from 'react';
import { Printer, Download, Edit3, Square, Circle, Type, Trash2, X } from 'lucide-react';
import { generateContent, generateImage } from '../lib/gemini';
import { marked } from 'marked';
import renderMathInElement from 'katex/contrib/auto-render';
import 'katex/dist/katex.min.css';
import DrawingModal from './DrawingModal';
import { PROVINCES, SUBJECTS, ALL_LEVELS, EXAM_TYPES } from '../constants';

export default function ExamTab() {
  const [loading, setLoading] = useState(false);
  const [examData, setExamData] = useState<any>(() => {
    const saved = localStorage.getItem('examData');
    return saved ? JSON.parse(saved) : null;
  });
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('examFormData');
    return saved ? JSON.parse(saved) : {
      province: 'الجزائر شرق',
      subject: 'الرياضيات',
      school: '',
      level: 'السنة الرابعة متوسط',
      type: 'اختبار الفصل الأول',
      year: '2024/2025',
      duration: 'ساعتين',
      topics: ''
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('examFormData', JSON.stringify(formData));
    }, 500);
    return () => clearTimeout(timer);
  }, [formData]);

  useEffect(() => {
    if (examData) {
      localStorage.setItem('examData', JSON.stringify(examData));
    }
  }, [examData]);
  const [fontSize, setFontSize] = useState(20);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);

  const handleGenerate = async () => {
    if (!formData.school || !formData.topics) {
      alert("يرجى إدخال اسم المؤسسة والمواضيع");
      return;
    }

    setLoading(true);
    try {
      const prompt = `الدور: أنت "أستاذ الرياضيات الذكي" المتخصص في المنهاج الجزائري (الجيل الثاني). مهمتك هي توليد مذكرات واختبارات احترافية بصيغة JSON و LaTeX.

المعطيات:
- المادة: ${formData.subject}
- المستوى: ${formData.level}
- المواضيع: ${formData.topics}

تعليمات توليد الصور والأشكال الهندسية (تحديث):
عند طلب تمرين أو درس يتطلب شكلاً هندسياً (مثل: مستقيم مدرج، معلم متعامد ومتجانس، مثلث، دائرة محيطة، أو تمثيل بياني)، يجب عليك تضمين حقل إضافي في الاستجابة يسمى image_prompt.

قواعد توليد وصف الشكل (Nano/Imagen/Gemini):
1. الدقة الرياضية: صف الشكل بدقة متناهية (مثلاً: "مثلث ABC قائم في A حيث AB=3cm و AC=4cm").
2. التفاصيل الفنية: يجب أن يكون الوصف باللغة الإنجليزية. اطلب رسماً واقعياً جداً (Highly Realistic)، بألوان زاهية وتفاصيل دقيقة (Fine details). إذا كان الشكل مركباً، اطلب إضافة عناصر توضيحية بسيطة واحترافية (Professional illustrative elements) لربط الرياضيات بالواقع.
3. التسميات: اطلب وضع الحروف (A, B, C...) والزوايا القائمة والترميزات (التشفير) بشكل واضح جداً.
4. الأهمية: يجب أن يكون الشكل مرتبطاً مباشرة بالمعطيات، بحيث لا يمكن حل التمرين بدونه (سند أساسي).
5. النوع: اطلب رسومات هندسية عالية الجودة تدمج بين الدقة الرياضية والجمال الفني.

قواعد توليد التصحيح النموذجي (هام جداً):
يجب أن تولد تصحيحاً نموذجياً دقيقاً في جدول HTML يطابق التنسيق الرسمي للبكالوريا الجزائرية.
هيكل الجدول المطلوب (يجب الالتزام به حرفياً في حقل answer_key.html):
<table style="width: 100%; border-collapse: collapse; border: 2px solid black; text-align: center; direction: rtl; font-family: Tahoma, 'Segoe UI', 'Simplified Arabic', Arial, sans-serif;">
    <thead>
        <tr>
            <th colspan="2" style="border: 1px solid black; padding: 8px; width: 20%; font-weight: bold;">العلامة</th>
            <th rowspan="2" style="border: 1px solid black; padding: 8px; width: 80%; font-weight: bold;">عناصر الإجابة</th>
        </tr>
        <tr>
            <th style="border: 1px solid black; padding: 8px; font-weight: bold;">المجموع</th>
            <th style="border: 1px solid black; padding: 8px; font-weight: bold;">مجزأة</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="3" style="border: 1px solid black; padding: 8px; background-color: #f3f4f6; font-weight: bold;">التمرين الأول ( 04 نقاط )</td>
        </tr>
        <!-- استخدم rowspan لدمج خلايا 'المجموع' عندما يكون هناك عدة أجزاء للسؤال -->
        <tr>
            <td rowspan="2" style="border: 1px solid black; padding: 8px; vertical-align: middle;">2</td>
            <td style="border: 1px solid black; padding: 8px;">1</td>
            <td style="border: 1px solid black; padding: 8px; text-align: right;">إجابة الجزء الأول</td>
        </tr>
        <tr>
            <td style="border: 1px solid black; padding: 8px;">1</td>
            <td style="border: 1px solid black; padding: 8px; text-align: right;">إجابة الجزء الثاني</td>
        </tr>
    </tbody>
</table>

هيكل الاستجابة المطلوبة (JSON Structure):
يجب أن تكون المخرجات دائماً بتنسيق JSON لضمان عدم تعطل الموقع:
{
"subject": "${formData.subject}",
"level": "${formData.level}",
"content": {
"text": "[محتوى الاختبار بتنسيق HTML و LaTeX. قسم الاختبار إلى تمارين ووضعية إدماجية. ابدأ مباشرة بـ 'التمرين الأول:'. لا تكتب أي مقدمات أو ترويسة.]",
"visuals": [
{
"target_exercise": "التمرين الثاني مثلاً",
"image_description": "[وصف تفصيلي جداً باللغة الإنجليزية لنموذج توليد الصور ليرسم الشكل الهندسي بدقة]",
"educational_purpose": "شرح خاصية فيثاغورس أو حساب مساحة"
}
]
},
"answer_key": {
"html": "[جدول التصحيح النموذجي بتنسيق HTML كما هو موضح في القواعد أعلاه. استخدم LaTeX للمعادلات.]"
}
}

ملاحظة صارمة: لا تضف أي نص خارج إطار الـ JSON. استخدم LaTeX لكتابة الكسور والجذور والعمليات الحسابية. استخدم حصراً الرمز $ للمعادلات المضمنة (inline) والرمز $$ للمعادلات المستقلة (display). لا تستخدم \\( أو \\).`;

      const responseText = await generateContent(prompt, 'application/json');
      const cleanText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsedData = JSON.parse(cleanText);
      
      if (!parsedData) {
        throw new Error("فشل في توليد بيانات الاختبار.");
      }

      // Fix LaTeX delimiters
      if (parsedData.content?.text) {
        parsedData.content.text = parsedData.content.text.replace(/\\\(/g, '$').replace(/\\\)/g, '$').replace(/\\\[/g, '$$$').replace(/\\\]/g, '$$$');
      }
      if (parsedData.answer_key?.html) {
        parsedData.answer_key.html = parsedData.answer_key.html.replace(/\\\(/g, '$').replace(/\\\)/g, '$').replace(/\\\[/g, '$$$').replace(/\\\]/g, '$$$');
      }

      setExamData({ ...parsedData, meta: formData });
      setLoading(false); // Stop loading immediately after text is ready

      // Generate images if any asynchronously
      if (parsedData.content?.visuals && parsedData.content.visuals.length > 0) {
        Promise.all(
          parsedData.content.visuals.map(async (v: any) => {
            const img = await generateImage(v.image_description);
            return { ...v, imgData: img };
          })
        ).then(visualsWithImages => {
          setExamData((prev: any) => ({
            ...prev,
            content: { ...prev.content, visuals: visualsWithImages }
          }));
        }).catch(err => console.error("Failed to load images", err));
      }

    } catch (error: any) {
      alert("حدث خطأ: " + error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (examData && contentRef.current) {
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
  }, [examData]);

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
      <title>اختبار ${examData.meta.subject}</title>
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
    link.download = `اختبار_${examData.meta.subject}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleInsertDrawing = (dataUrl: string) => {
    if (contentRef.current) {
      const imgHtml = `<br><img src="${dataUrl}" width="400" height="212" style="width: 400px; height: auto; display: block; margin: 10px auto; border: 1px solid #eee;" alt="شكل هندسي" /><br>`;
      contentRef.current.focus();
      document.execCommand('insertHTML', false, imgHtml);
    }
    setIsDrawingOpen(false);
  };

  const previewContent = useMemo(() => {
    if (!examData) {
      return (
        <div className="h-full flex items-center justify-center text-gray-400 text-center p-20 border-2 border-dashed rounded-3xl bg-white min-h-[400px]">
          <div>
            <div className="text-6xl mb-4">✨</div>
            <p>املأ البيانات واضغط على توليد الاختبار للمعاينة</p>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={handlePrint} className="flex-1 sm:flex-none bg-white border px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50">
              <Printer className="w-4 h-4" /> طباعة PDF
            </button>
            <button onClick={handleExportWord} className="flex-1 sm:flex-none bg-white border px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50">
              <Download className="w-4 h-4" /> تنزيل Word
            </button>
          </div>
          <div className="text-xs sm:text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg flex items-center gap-2 border border-emerald-200">
            <span>✏️</span> يمكنك النقر على أي مكان في الورقة للتعديل عليها مباشرة
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="mb-4 bg-white border border-gray-200 rounded-lg p-2 flex flex-wrap gap-2 items-center print:hidden shadow-sm">
          <span className="text-sm text-gray-500 font-bold ml-2">أدوات التعديل:</span>
          <button onClick={() => document.execCommand('bold')} className="p-2 hover:bg-gray-100 rounded font-bold" title="عريض">B</button>
          <button onClick={() => document.execCommand('italic')} className="p-2 hover:bg-gray-100 rounded font-serif italic font-bold" title="مائل">I</button>
          <button onClick={() => document.execCommand('underline')} className="p-2 hover:bg-gray-100 rounded font-serif underline font-bold" title="تسطير">U</button>
          <div className="h-6 w-px bg-gray-300 mx-1" />
          <button onClick={() => setFontSize(f => f + 2)} className="p-2 hover:bg-gray-100 rounded font-bold" title="تكبير">A+</button>
          <button onClick={() => setFontSize(f => Math.max(12, f - 2))} className="p-2 hover:bg-gray-100 rounded font-bold text-sm" title="تصغير">A-</button>
          <div className="h-6 w-px bg-gray-300 mx-1" />
          <button onClick={() => setIsDrawingOpen(true)} className="p-2 hover:bg-blue-50 text-blue-700 rounded font-bold text-sm border border-blue-200 flex items-center gap-1">
            <Edit3 className="w-4 h-4" /> رسم هندسي
          </button>
        </div>
        
        {/* Exam Sheet */}
        <div 
          ref={contentRef}
          className="bg-white shadow-lg min-h-[29.7cm] p-[2cm] font-sans outline-none focus:ring-2 focus:ring-emerald-200 print:shadow-none print:p-0" 
          contentEditable 
          suppressContentEditableWarning
          style={{ fontSize: `${fontSize}px` }}
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">الجمهورية الجزائرية الديمقراطية الشعبية</h1>
          </div>
          
          <div className="text-xl mb-8">
            <div className="flex justify-between">
              <div>مديرية التربية لولاية {examData.meta.province}</div>
              <div>متوسطة: {examData.meta.school}</div>
            </div>
            <div className="flex justify-between">
              <div>{examData.meta.type}</div>
              <div>السنة الدراسية: {examData.meta.year}</div>
            </div>
            <div className="flex justify-between">
              <div className="font-bold">اختبار في مادة: {examData.meta.subject}</div>
              <div>المدة: {examData.meta.duration}</div>
            </div>
            <div className="border-b-2 border-black mt-2" />
          </div>

          <div 
            className="exam-content leading-relaxed text-right"
            dangerouslySetInnerHTML={{ __html: examData.content?.text ? marked.parse(examData.content.text) : '' }}
          />

          {examData.content?.visuals?.map((v: any, idx: number) => (
            <div key={idx} className="my-4 text-center">
              {v.imgData ? (
                <img src={v.imgData} alt={v.educational_purpose} className="max-w-[250px] mx-auto border border-gray-300 p-2" />
              ) : (
                <div className="p-4 border border-dashed border-gray-300 text-gray-500 text-sm">
                  فشل توليد الصورة لـ {v.target_exercise}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1 print:hidden">{v.educational_purpose}</p>
            </div>
          ))}

          {examData.answer_key?.html && (
            <>
              <div className="page-break" style={{ pageBreakBefore: 'always', marginTop: '2rem', borderTop: '2px dashed #ccc', paddingTop: '2rem' }}>
                <div className="text-center text-gray-400 text-sm my-4 print:hidden">--- بداية صفحة التصحيح النموذجي ---</div>
              </div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold border-b-2 border-black inline-block pb-1">الإجابة النموذجية وسلّم التنقيط</h2>
              </div>
              <div 
                className="answer-key-content leading-relaxed text-right"
                dangerouslySetInnerHTML={{ __html: examData.answer_key.html }}
              />
            </>
          )}
        </div>
      </div>
    );
  }, [examData, fontSize]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar Form */}
      <div className="lg:col-span-4 print:hidden space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-700">
            <span>📝</span> معلومات الاختبار
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">الولاية</label>
              <select 
                value={formData.province}
                onChange={e => setFormData({...formData, province: e.target.value})}
                className="w-full border rounded-lg p-2 bg-gray-50"
              >
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المادة</label>
              <select 
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                className="w-full border rounded-lg p-2 bg-gray-50"
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">اسم المؤسسة</label>
              <input 
                type="text" 
                value={formData.school}
                onChange={e => setFormData({...formData, school: e.target.value})}
                className="w-full border rounded-lg p-2 bg-gray-50" 
                placeholder="مثال: متوسطة خديجة أم المؤمنين" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المستوى</label>
              <select 
                value={formData.level}
                onChange={e => setFormData({...formData, level: e.target.value})}
                className="w-full border rounded-lg p-2 bg-gray-50"
              >
                {ALL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">نوع التقييم</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full border rounded-lg p-2 bg-gray-50"
              >
                {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">السنة الدراسية</label>
                <input 
                  type="text" 
                  value={formData.year}
                  onChange={e => setFormData({...formData, year: e.target.value})}
                  className="w-full border rounded-lg p-2 bg-gray-50 text-center" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">المدة</label>
                <input 
                  type="text" 
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: e.target.value})}
                  className="w-full border rounded-lg p-2 bg-gray-50 text-center" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المواضيع</label>
              <textarea 
                value={formData.topics}
                onChange={e => setFormData({...formData, topics: e.target.value})}
                className="w-full border rounded-lg p-2 bg-gray-50" 
                placeholder="اكتب الدروس هنا..." 
                rows={4}
              />
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? 'جاري التوليد...' : 'توليد الاختبار'}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="lg:col-span-8">
        {previewContent}
      </div>

      {/* Drawing Modal */}
      {isDrawingOpen && (
        <DrawingModal 
          onClose={() => setIsDrawingOpen(false)} 
          onInsert={handleInsertDrawing} 
        />
      )}
    </div>
  );
}
