import React, { useState, useEffect, useRef } from 'react';
import { Upload, Download, Settings, FileSpreadsheet, CheckCircle, AlertCircle, Printer } from 'lucide-react';
import { generateContent } from '../lib/gemini';
import { marked } from 'marked';

declare global {
  interface Window {
    XlsxPopulate: any;
    XLSX: any;
  }
}

const defaultFeedbackData = {
  prim: {
    arabe: [
      { min: 0, max: 4, f1: 'نتائج غير مقبولة' },
      { min: 4, max: 5, f1: 'نتائج دون الوسط' },
      { min: 5, max: 6, f1: 'نتائج متوسطة' },
      { min: 6, max: 7, f1: 'نتائج حسنة' },
      { min: 7, max: 8, f1: 'نتائج جيدة' },
      { min: 8, max: 9, f1: 'نتائج جيدة جدا' },
      { min: 9, max: 11, f1: 'نتائج ممتازة' }
    ],
  },
  moy_lycee: {
    arabe: [
      { min: 0, max: 7, f1: 'نتائج غير مقبولة', f2: 'احذر التهاون' },
      { min: 7, max: 10, f1: 'نتائج دون الوسط', f2: 'ينقصك الحرص و التركيز' },
      { min: 10, max: 12, f1: 'نتائج متوسطة', f2: 'بمقدورك تحقيق نتائج افضل' },
      { min: 12, max: 14, f1: 'نتائج حسنة', f2: 'نتائج مقبولة بامكانك تحسينها' },
      { min: 14, max: 16, f1: 'نتائج جيدة', f2: 'واصل الاجتهاد و المثابرة' },
      { min: 16, max: 18, f1: 'نتائج جيدة جدا', f2: 'نتائج جيدة ومشجعة واصل' },
      { min: 18, max: 21, f1: 'نتائج ممتازة', f2: 'نتائج ممتازة ومرضية واصل' }
    ],
  }
};

export default function NotesTab() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState(() => localStorage.getItem('notesLevel') || 'moy');
  const [lang, setLang] = useState(() => localStorage.getItem('notesLang') || 'arabe');
  const [hasPractical, setHasPractical] = useState(() => localStorage.getItem('notesPractical') === 'true');

  useEffect(() => {
    localStorage.setItem('notesLevel', level);
    localStorage.setItem('notesLang', lang);
    localStorage.setItem('notesPractical', String(hasPractical));
  }, [level, lang, hasPractical]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [sheetsData, setSheetsData] = useState<any>({});
  const [selectedSheetIdx, setSelectedSheetIdx] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  // Correction Tool State
  const [allErrors, setAllErrors] = useState<any[]>([]);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [currentTeacher, setCurrentTeacher] = useState('—');
  const [subjectsDisplay, setSubjectsDisplay] = useState('—');
  const [filterSheet, setFilterSheet] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [specialCases, setSpecialCases] = useState<any[]>([]);
  const [specialCasesTitle, setSpecialCasesTitle] = useState('');
  const [showSpecialCases, setShowSpecialCases] = useState(false);

  useEffect(() => {
    // Load scripts dynamically to avoid build issues with xlsx-populate
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/xlsx-populate@1.21.0/browser/xlsx-populate.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js')
    ]).catch(console.error);
  }, []);

  useEffect(() => {
    const category = level === 'prim' ? 'prim' : 'moy_lycee';
    // @ts-ignore
    setRules(JSON.parse(JSON.stringify(defaultFeedbackData[category][lang] || defaultFeedbackData[category]['arabe'])));
  }, [level, lang]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setDownloadUrl(null);
      setSheetsData({});
      setSelectedSheetIdx(null);
      
      // Reset correction state
      setAllErrors([]);
      setCorrections([]);
      setAllStudents([]);
      setCurrentTeacher(selectedFile.name.replace(/\.xlsx?$/i, '').replace(/-الفصل.*$/i, '').trim());
      setSubjectsDisplay('—');
    }
  };

  const handleRuleChange = (index: number, field: string, value: string) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  const isZeroValue = (val: any) => {
    if (val === null || val === undefined) return false;
    const strVal = String(val).trim();
    const zeroPatterns = ['0', '0.0', '0.00', '.0', '0.', 'صفر', 'zero', '', '-', '—'];
    if (zeroPatterns.includes(strVal)) return true;
    const num = parseFloat(strVal);
    if (!isNaN(num) && num === 0) return true;
    return false;
  };

  const isAbsentValue = (val: any) => {
    if (val === null || val === undefined) return false;
    const strVal = String(val).trim();
    const absentPatterns = ['غ م', 'غم', 'غ.م', 'غ-م', 'غياب', 'غياب مبرر', 'غ', 'g.m', 'gm', 'absent'];
    return absentPatterns.includes(strVal) || (strVal.includes('غ') && strVal.includes('م'));
  };

  const isExemptValue = (val: any) => {
    if (val === null || val === undefined) return false;
    const strVal = String(val).trim();
    const exemptPatterns = ['معفى', 'معفي', 'عفى', 'إعفاء', 'اعفاء', 'exempt', 'معفى من المادة'];
    return exemptPatterns.includes(strVal) || strVal.includes('عف') || strVal.includes('عفى');
  };

  const isValidMark = (val: any) => {
    if (val === '' || val === null || val === undefined) return false;
    const strVal = String(val).trim();
    if (strVal === '') return false;
    if (isAbsentValue(strVal) || isExemptValue(strVal) || isZeroValue(strVal)) return true;
    const num = parseFloat(strVal);
    if (isNaN(num)) return false;
    if (num < 0 || num > 20) return false;
    const multiplied = num * 4;
    if (Math.abs(multiplied - Math.round(multiplied)) > 0.000001) return false;
    return true;
  };

  const getMarkType = (val: any) => {
    if (isZeroValue(val)) return 'zero';
    if (isAbsentValue(val)) return 'absent';
    if (isExemptValue(val)) return 'exempt';
    return 'normal';
  };

  const markDisplay = (val: any, isCorrected = false) => {
    if (val === null || val === undefined) return <span className="text-red-600 font-bold bg-red-100 px-2 py-1 rounded">فارغ</span>;
    const strVal = String(val).trim();
    if (strVal === '') return <span className="text-red-600 font-bold bg-red-100 px-2 py-1 rounded">فارغ</span>;
    if (isCorrected) return <span>{strVal}</span>;
    if (isAbsentValue(strVal)) return <span className="text-gray-700 font-bold bg-gray-200 px-2 py-1 rounded">غ م</span>;
    if (isExemptValue(strVal)) return <span className="text-teal-700 font-bold bg-teal-100 px-2 py-1 rounded">معفى</span>;
    if (isZeroValue(strVal)) return <span className="text-red-700 font-bold bg-red-100 px-2 py-1 rounded">0</span>;
    if (!isValidMark(strVal)) return <span className="text-red-600 font-bold bg-red-100 px-2 py-1 rounded">{strVal}</span>;
    return <span>{strVal}</span>;
  };

  const parseSheetName = (name: string) => {
    if (!name) return "—";
    name = String(name).trim();
    const base = name.split(/\s+/)[0];
    if (!/^\d{7}$/.test(base)) return name;
    const levelChar = base[1];
    const cls = base[6];
    const levels: any = { '1':'أولى', '2':'ثانية', '3':'ثالثة', '4':'رابعة' };
    const levelName = levels[levelChar] || levelChar;
    return `${levelName} متوسط ${cls}`;
  };

  const extractSubjectFromSheet = (json: any[]) => {
    if (!json || !Array.isArray(json)) return "غير محدد";
    for (let i = 0; i < Math.min(30, json.length); i++) {
      const row = json[i];
      if (!row) continue;
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (cell && typeof cell === 'string') {
          const text = cell.trim();
          const match = text.match(/مادة\s*:\s*(.+)/i) || text.match(/المادة\s*:\s*(.+)/i);
          if (match && match[1]) return match[1].trim();
          if (text.includes('مادة')) {
            const parts = text.split(/مادة\s*/i);
            if (parts.length > 1 && parts[1].trim()) return parts[1].trim();
          }
        }
      }
    }
    return "غير محدد";
  };

  const processExcel = async () => {
    if (!file) {
      alert('يرجى اختيار ملف Excel أولاً');
      return;
    }
    if (!window.XlsxPopulate || !window.XLSX) {
      alert('جاري تحميل المكتبات، يرجى الانتظار قليلاً والمحاولة مرة أخرى.');
      return;
    }

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = await window.XlsxPopulate.fromDataAsync(data);
      const newSheetsData: any = {};
      let totalProcessed = 0;
      
      const newAllErrors: any[] = [];
      const newAllStudents: any[] = [];
      const subjectsSet = new Set<string>();

      for (let s = 0; s < workbook.sheets().length; s++) {
        const sheet = workbook.sheet(s);
        const usedRange = sheet.usedRange();
        if (!usedRange) continue;

        const numRows = usedRange.endCell().rowNumber();
        const numCols = usedRange.endCell().columnNumber();

        // Extract raw JSON for correction tool
        const rawJson: any[][] = [];
        for(let r=1; r<=numRows; r++) {
          const row: any[] = [];
          for(let c=1; c<=numCols; c++) {
            row.push(sheet.cell(r, c).value());
          }
          rawJson.push(row);
        }
        
        const subject = extractSubjectFromSheet(rawJson);
        if (subject !== "غير محدد") subjectsSet.add(subject);
        const groupName = parseSheetName(sheet.name());

        let headerRowIdx = -1;
        let nameColIdx = -1;

        for (let r = 1; r <= Math.min(20, numRows); r++) {
          let hasName = false;
          let hasGrade = false;
          for (let c = 1; c <= numCols; c++) {
            const cellVal = sheet.cell(r, c).value();
            if (typeof cellVal === 'string') {
              const val = cellVal.trim().replace(/[أإآ]/g, 'ا');
              if (val.includes('الاسم') || val.includes('اللقب')) {
                hasName = true;
                nameColIdx = c;
              }
              if (val.includes('المعدل') || val.includes('العلامة') || val.includes('التقديرات') || val.includes('الاختبار')) {
                hasGrade = true;
              }
            }
          }
          if (hasName && hasGrade) {
            headerRowIdx = r;
            break;
          }
        }

        if (headerRowIdx === -1) continue;

        let taqwimColIdx = -1, examColIdx = -1, averageColIdx = -1, feedback1ColIdx = -1, feedback2ColIdx = -1, practicalColIdx = -1;
        let fardCols: number[] = [];

        for (let c = 1; c <= numCols; c++) {
          const cellVal = sheet.cell(headerRowIdx, c).value();
          if (typeof cellVal === 'string') {
            const val = cellVal.trim().replace(/[أإآ]/g, 'ا');
            if (val.includes('تقويم') || val.includes('مراقبة')) taqwimColIdx = c;
            else if (val.includes('فرض')) fardCols.push(c);
            else if (val.includes('اختبار')) examColIdx = c;
            else if (val.includes('معدل') && !val.includes('تقويم')) averageColIdx = c;
            else if (val.includes('تقديرات') || val.includes('ملاحظات')) feedback1ColIdx = c;
            else if (val.includes('ارشادات')) feedback2ColIdx = c;
            else if (val.includes('تطبيقية') || val.includes('تعبير')) practicalColIdx = c;
          }
        }

        if (feedback1ColIdx === -1) continue;

        const sheetStudents = [];
        const startRow = headerRowIdx + 1;

        for (let r = startRow; r <= numRows; r++) {
          const pupilId = sheet.cell(r, 1).value() || '';
          const studentName = sheet.cell(r, nameColIdx).value() || `تلميذ ${r - headerRowIdx}`;
          
          const getNum = (cIdx: number) => {
            if (cIdx === -1) return null;
            const val = sheet.cell(r, cIdx).value();
            if (typeof val === 'number') return val;
            if (typeof val === 'string' && !isNaN(parseFloat(val))) return parseFloat(val);
            return null;
          };

          const getRaw = (cIdx: number) => {
            if (cIdx === -1) return '';
            return sheet.cell(r, cIdx).value() || '';
          };

          let taqwim = getNum(taqwimColIdx);
          let exam = getNum(examColIdx);
          let fard1 = fardCols.length > 0 ? getNum(fardCols[0]) : null;
          let fard2 = fardCols.length > 1 ? getNum(fardCols[1]) : null;
          let practical = getNum(practicalColIdx);
          let avgCell = getNum(averageColIdx);

          let rawTaqwim = getRaw(taqwimColIdx);
          let rawExam = getRaw(examColIdx);
          let rawFard1 = fardCols.length > 0 ? getRaw(fardCols[0]) : '';

          const studentData = {
            id: `${sheet.name()}_${r}`,
            sheetName: sheet.name(),
            group: groupName,
            subject: subject,
            pupilId: pupilId,
            pupilName: studentName,
            activities: rawTaqwim,
            devoir: rawFard1,
            exam: rawExam,
            rowIndex: r,
          };
          newAllStudents.push(studentData);

          if (!isValidMark(rawTaqwim) || !isValidMark(rawFard1) || !isValidMark(rawExam)) {
            newAllErrors.push({ ...studentData, corrected: false });
          }

          let calculatedAverage = null;

          if (exam !== null) {
            if (hasPractical && practical !== null) {
              let fardSum = fard1 !== null ? fard1 : 0;
              let taqwimVal = taqwim !== null ? taqwim : 0;
              let continuousAvg = (taqwimVal + fardSum + practical) / 3;
              calculatedAverage = (continuousAvg + (exam * 2)) / 3;
            } else if (taqwim !== null && fard1 !== null && fard2 !== null) {
              calculatedAverage = (((taqwim + fard1 + fard2) * 2 / 3) + (exam * 3)) / 5;
            } else if (taqwim !== null && fard1 !== null) {
              calculatedAverage = (taqwim + fard1 + (exam * 2)) / 4;
            } else if (fard1 !== null) {
              calculatedAverage = (fard1 + exam * 2) / 3;
            } else {
              calculatedAverage = exam;
            }
          } else if (avgCell !== null) {
            calculatedAverage = avgCell;
          }

          if (calculatedAverage !== null) {
            calculatedAverage = Math.round(calculatedAverage * 100) / 100;
            if (averageColIdx !== -1) sheet.cell(r, averageColIdx).value(calculatedAverage);

            let f1 = '', f2 = '';
            for (const range of rules) {
              if (calculatedAverage >= range.min && (calculatedAverage <= range.max || (range.max === 20 && calculatedAverage >= 20))) {
                f1 = range.f1;
                f2 = range.f2 || '';
                break;
              }
            }

            if (f1) sheet.cell(r, feedback1ColIdx).value(f1);
            if (f2 && feedback2ColIdx !== -1 && level !== 'prim') sheet.cell(r, feedback2ColIdx).value(f2);
            
            sheetStudents.push({
              id: sheetStudents.length + 1,
              name: studentName,
              average: calculatedAverage,
              f1, f2
            });
          }
        }

        if (sheetStudents.length > 0) {
          newSheetsData[s] = { name: sheet.name(), students: sheetStudents };
          totalProcessed++;
        }
      }

      if (totalProcessed === 0) {
        throw new Error("لم يتم العثور على بيانات صالحة في أي ورقة.");
      }

      setSheetsData(newSheetsData);
      setAllErrors(newAllErrors);
      setAllStudents(newAllStudents);
      setSubjectsDisplay(Array.from(subjectsSet).join(' / ') || '—');
      
      const firstIdx = Object.keys(newSheetsData)[0];
      setSelectedSheetIdx(firstIdx);

      const outBlob = await workbook.outputAsync();
      const url = URL.createObjectURL(outBlob);
      setDownloadUrl(url);

      alert(`تمت معالجة ${totalProcessed} أقسام بنجاح!`);

    } catch (error: any) {
      alert("حدث خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSheetIdx && sheetsData[selectedSheetIdx]) {
      analyzeSheetAI(selectedSheetIdx);
    }
  }, [selectedSheetIdx]);

  const analyzeSheetAI = async (idx: string) => {
    const sheetData = sheetsData[idx];
    if (!sheetData || !sheetData.students.length) return;

    setAnalyzing(true);
    try {
      const students = sheetData.students;
      const totalStudents = students.length;
      const sumAverages = students.reduce((sum: number, s: any) => sum + s.average, 0);
      const classAverage = (sumAverages / totalStudents).toFixed(2);
      const passedStudents = students.filter((s: any) => s.average >= 10).length;
      const successRate = ((passedStudents / totalStudents) * 100).toFixed(2);
      
      const sorted = [...students].sort((a, b) => b.average - a.average);
      const topStudents = sorted.slice(0, 3).map(s => `${s.name} (${s.average})`).join('، ');
      const weakStudents = sorted.slice(-3).reverse().map(s => `${s.name} (${s.average})`).join('، ');

      const prompt = `أنت خبير تربوي ومفتش تعليم في الجزائر.
قم بتحليل نتائج هذا القسم (${sheetData.name}) بناءً على المعطيات التالية:
- عدد التلاميذ: ${totalStudents}
- معدل القسم: ${classAverage} / 20
- نسبة النجاح: ${successRate}%
- المتفوقون: ${topStudents}
- التلاميذ الذين يحتاجون مرافقة: ${weakStudents}

المطلوب:
1. قدم تحليلاً بيداغوجياً دقيقاً لمستوى هذا القسم تحديداً.
2. حدد نقاط القوة والضعف.
3. قدم نصائح عملية للأستاذ للتعامل مع هذا القسم.
4. اكتب التحليل بلغة عربية تربوية سليمة واحترافية.
5. نسق الإجابة باستخدام Markdown.`;

      const responseText = await generateContent(prompt, 'text/plain');
      setAiAnalysis(marked.parse(responseText) as string);
    } catch (error: any) {
      setAiAnalysis(`<p class="text-red-500 font-bold">حدث خطأ أثناء تحليل النتائج: ${error.message}</p>`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCellEdit = (errorId: string, field: string, oldVal: any, newVal: string) => {
    if (!isValidMark(newVal)) {
      alert('⚠️ القيمة غير صحيحة. يجب أن تكون:\n- رقماً بين 0 و20 (بمضاعفات 0.25)\n- أو "غ م"\n- أو "معفى"');
      return;
    }

    const newCorrections = corrections.filter(c => !(c.errorId === errorId && c.field === field));
    const error = allErrors.find(e => e.id === errorId);
    
    newCorrections.push({
      errorId,
      field,
      pupilName: error.pupilName,
      group: error.group,
      subject: error.subject,
      fieldName: field === 'activities' ? 'تقويم' : (field === 'devoir' ? 'فرض' : 'اختبار'),
      old: oldVal,
      new: newVal,
      reason: correctionReason || 'تصحيح خطأ في العلامة'
    });
    
    setCorrections(newCorrections);
  };

  const handleShowSpecialCases = (type: string, title: string) => {
    const filtered = allStudents.filter(s => 
      getMarkType(s.activities) === type ||
      getMarkType(s.devoir) === type ||
      getMarkType(s.exam) === type
    );

    if (filtered.length === 0) {
      alert('لا يوجد تلاميذ في هذه الفئة.');
      return;
    }

    setSpecialCases(filtered);
    setSpecialCasesTitle(`${title} (${filtered.length} تلميذ)`);
    setShowSpecialCases(true);
  };

  const handlePrintCorrection = () => {
    window.print();
  };

  const filteredErrors = allErrors.filter(err => {
    if (filterSheet !== 'all' && err.sheetName !== filterSheet) return false;
    if (searchQuery && !err.pupilName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const zeroTotal = allStudents.filter(s => getMarkType(s.activities) === 'zero' || getMarkType(s.devoir) === 'zero' || getMarkType(s.exam) === 'zero').length;
  const absentTotal = allStudents.filter(s => getMarkType(s.activities) === 'absent' || getMarkType(s.devoir) === 'absent' || getMarkType(s.exam) === 'absent').length;
  const exemptTotal = allStudents.filter(s => getMarkType(s.activities) === 'exempt' || getMarkType(s.devoir) === 'exempt' || getMarkType(s.exam) === 'exempt').length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">حجز الملاحظات في ملفات الرقمنة</h2>
          <p className="text-gray-500">قم برفع ملف الإكسل الخاص بالرقمنة، وسيقوم النظام بملء الملاحظات والتقديرات تلقائياً.</p>
        </div>

        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">1. اختر ملف Excel (الرقمنة)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">اضغط لرفع الملف</span></p>
                  <p className="text-xs text-gray-500">صيغة .xlsx فقط</p>
                </div>
                <input type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            {file && <p className="text-sm text-emerald-600 mt-2 font-medium">الملف المحدد: {file.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">2. الطور التعليمي</label>
              <select 
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 bg-gray-50 border p-3 outline-none"
              >
                <option value="prim">التعليم الابتدائي</option>
                <option value="moy">التعليم المتوسط</option>
                <option value="lycee">التعليم الثانوي</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">3. لغة الملاحظات</label>
              <select 
                value={lang}
                onChange={e => setLang(e.target.value)}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 bg-gray-50 border p-3 outline-none"
              >
                <option value="arabe">اللغة العربية</option>
                <option value="francais">اللغة الفرنسية</option>
                <option value="english">اللغة الإنجليزية</option>
              </select>
            </div>
          </div>

          {level !== 'prim' && (
            <div>
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={hasPractical}
                  onChange={e => setHasPractical(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" 
                />
                <span className="text-sm font-bold text-blue-800">توجد أعمال تطبيقية أو تعبير لم تظهر</span>
              </label>
            </div>
          )}

          {/* Rules Table */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">4. تخصيص الملاحظات (يمكنك التعديل عليها)</label>
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-sm text-right">
                <thead className="text-xs text-gray-700 bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">مجال العلامة</th>
                    <th className="px-4 py-3">التقديرات (الملاحظة 1)</th>
                    {level !== 'prim' && <th className="px-4 py-3">الإرشادات (الملاحظة 2)</th>}
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-600" dir="ltr">
                        [{rule.min} - {rule.max}[
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="text" 
                          value={rule.f1}
                          onChange={e => handleRuleChange(idx, 'f1', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 focus:border-blue-500 outline-none" 
                        />
                      </td>
                      {level !== 'prim' && (
                        <td className="px-4 py-2">
                          <input 
                            type="text" 
                            value={rule.f2 || ''}
                            onChange={e => handleRuleChange(idx, 'f2', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 focus:border-blue-500 outline-none" 
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={processExcel}
              disabled={loading || !file}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'جاري المعالجة...' : <><Settings className="w-5 h-5" /> معالجة الملف</>}
            </button>
            {downloadUrl && (
              <a 
                href={downloadUrl}
                download={`ملاحظات_معدلة_${file?.name}`}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" /> تحميل الملف المعدل
              </a>
            )}
          </div>

          {/* Preview Section */}
          {Object.keys(sheetsData).length > 0 && (
            <div className="mt-8 space-y-6">
              {/* Correction Tool Section */}
              <div className="border-t-2 border-dashed border-gray-300 pt-8 print:hidden">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">✏️ تحقق وتصويب العلامات</h2>
                  <p className="text-gray-500">فحص الملف المرفوع لاكتشاف الأخطاء (أصفار، غياب، إعفاء، أخطاء حجز) وتصويبها وطباعة تقرير للإدارة.</p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex flex-wrap gap-4 justify-center text-blue-800 font-bold">
                  <div>👤 الأستاذ: <span>{currentTeacher}</span></div>
                  <div>|</div>
                  <div>📘 المواد: <span>{subjectsDisplay}</span></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-red-600">{zeroTotal}</div>
                    <div className="text-sm text-red-800 font-medium">الصفر والفراغ</div>
                  </div>
                  <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-gray-600">{absentTotal}</div>
                    <div className="text-sm text-gray-800 font-medium">غياب مبرر (غ م)</div>
                  </div>
                  <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-teal-600">{exemptTotal}</div>
                    <div className="text-sm text-teal-800 font-medium">معفون</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">{allErrors.length}</div>
                    <div className="text-sm text-orange-800 font-medium">إجمالي الأخطاء</div>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">{corrections.length}</div>
                    <div className="text-sm text-green-800 font-medium">تم التصحيح</div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 mb-6 items-start lg:items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
                    <select 
                      value={filterSheet}
                      onChange={e => setFilterSheet(e.target.value)}
                      className="w-full sm:w-auto flex-1 rounded-lg border-gray-300 p-2 outline-none"
                    >
                      <option value="all">جميع الأفواج</option>
                      {Object.keys(sheetsData).map(idx => (
                        <option key={idx} value={sheetsData[idx].name}>{sheetsData[idx].name}</option>
                      ))}
                    </select>
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full sm:w-auto flex-1 rounded-lg border-gray-300 p-2 outline-none" 
                      placeholder="بحث بالاسم..." 
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center w-full lg:w-auto">
                    <button onClick={() => handleShowSpecialCases('zero', 'علامات بها صفر أو فراغ')} className="flex-1 sm:flex-none bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-red-200">🔴 الأصفار والفراغ</button>
                    <button onClick={() => handleShowSpecialCases('absent', 'التلاميذ بغياب مبرر (غ م)')} className="flex-1 sm:flex-none bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-gray-300">⚪ غياب مبرر</button>
                    <button onClick={() => handleShowSpecialCases('exempt', 'التلاميذ المعفيون')} className="flex-1 sm:flex-none bg-teal-100 text-teal-700 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-teal-200">🔵 المعفيون</button>
                  </div>
                </div>

                {showSpecialCases && (
                  <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800">{specialCasesTitle}</h3>
                      <button onClick={() => setShowSpecialCases(false)} className="text-gray-500 hover:text-red-500">✖ إغلاق</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 text-gray-700">
                          <tr><th className="p-2">الفوج</th><th className="p-2">المادة</th><th className="p-2">التلميذ</th><th className="p-2">تقويم</th><th className="p-2">فرض</th><th className="p-2">اختبار</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {specialCases.map((s, i) => (
                            <tr key={i}>
                              <td className="p-2 border-b border-gray-100">{s.group}</td>
                              <td className="p-2 border-b border-gray-100">{s.subject}</td>
                              <td className="p-2 border-b border-gray-100">{s.pupilName}</td>
                              <td className="p-2 border-b border-gray-100">{markDisplay(s.activities)}</td>
                              <td className="p-2 border-b border-gray-100">{markDisplay(s.devoir)}</td>
                              <td className="p-2 border-b border-gray-100">{markDisplay(s.exam)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">جدول الأخطاء (انقر على الخلية لتصحيحها)</h3>
                  <p className="text-sm text-gray-500 mb-4">الخلايا القابلة للتعديل ستظهر بلون مختلف عند النقر عليها. يمكنك إدخال رقم (0-20 بمضاعفات 0.25) أو "غ م" أو "معفى".</p>
                  <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-96">
                    <table className="w-full text-sm text-right">
                      <thead className="bg-gray-50 text-gray-700 sticky top-0">
                        <tr>
                          <th className="p-3">الفوج</th>
                          <th className="p-3">المادة</th>
                          <th className="p-3">رقم التعريف</th>
                          <th className="p-3">اللقب والاسم</th>
                          <th className="p-3">تقويم /20</th>
                          <th className="p-3">فرض /20</th>
                          <th className="p-3">اختبار /20</th>
                          <th className="p-3">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredErrors.map((err, i) => {
                          const cAct = corrections.find(c => c.errorId === err.id && c.field === 'activities');
                          const cDev = corrections.find(c => c.errorId === err.id && c.field === 'devoir');
                          const cExm = corrections.find(c => c.errorId === err.id && c.field === 'exam');
                          const hasCorr = cAct || cDev || cExm;

                          return (
                            <tr key={i}>
                              <td className="p-3 border-b border-gray-100">{err.group}</td>
                              <td className="p-3 border-b border-gray-100">{err.subject}</td>
                              <td className="p-3 border-b border-gray-100">{err.pupilId}</td>
                              <td className="p-3 border-b border-gray-100">{err.pupilName}</td>
                              <td 
                                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-yellow-50 transition-colors rounded ${cAct ? 'bg-green-50 font-bold' : ''}`}
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleCellEdit(err.id, 'activities', err.activities, e.currentTarget.innerText)}
                              >
                                {cAct ? cAct.new : (err.activities || '')}
                              </td>
                              <td 
                                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-yellow-50 transition-colors rounded ${cDev ? 'bg-green-50 font-bold' : ''}`}
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleCellEdit(err.id, 'devoir', err.devoir, e.currentTarget.innerText)}
                              >
                                {cDev ? cDev.new : (err.devoir || '')}
                              </td>
                              <td 
                                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-yellow-50 transition-colors rounded ${cExm ? 'bg-green-50 font-bold' : ''}`}
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleCellEdit(err.id, 'exam', err.exam, e.currentTarget.innerText)}
                              >
                                {cExm ? cExm.new : (err.exam || '')}
                              </td>
                              <td className="p-3 border-b border-gray-100">
                                {hasCorr ? <span className="text-green-600 font-bold">✅ مصحح</span> : <span className="text-orange-500">⏳ بانتظار</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="block text-sm font-bold text-gray-700 mb-2">سبب عام للتعديلات (يظهر في تقرير الطباعة):</label>
                  <textarea 
                    value={correctionReason}
                    onChange={e => setCorrectionReason(e.target.value)}
                    className="w-full rounded-lg border-gray-300 p-2 outline-none mb-4" 
                    placeholder="مثال: خطأ في الحجز..." 
                    rows={2}
                  />
                  <button 
                    onClick={handlePrintCorrection}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="w-5 h-5" /> طباعة وثيقة تصويب العلامات
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 print:hidden">
                <label className="block text-sm font-bold text-gray-700 mb-2">5. اختر القسم للمعاينة والتحليل</label>
                <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-xl">
                  {Object.keys(sheetsData).map(idx => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSheetIdx(idx)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                        selectedSheetIdx === idx ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {sheetsData[idx].name}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSheetIdx && (
                <>
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                      <span>🤖</span> تحليل الذكاء الاصطناعي للقسم: <span className="text-blue-600">{sheetsData[selectedSheetIdx].name}</span>
                    </h3>
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-gray-700 leading-relaxed text-right">
                      {analyzing ? (
                        <p className="text-center text-gray-500">جاري تحليل النتائج...</p>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: aiAnalysis }} />
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span>📊</span> معاينة حية للتلاميذ والتقديرات
                    </h3>
                    <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-96">
                      <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 bg-gray-50 border-b border-gray-200 sticky top-0">
                          <tr>
                            <th className="px-4 py-3">الرقم</th>
                            <th className="px-4 py-3">الاسم واللقب</th>
                            <th className="px-4 py-3">المعدل</th>
                            <th className="px-4 py-3">التقدير المولد</th>
                            {level !== 'prim' && <th className="px-4 py-3">الإرشاد المولد</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {sheetsData[selectedSheetIdx].students.map((s: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-gray-500">{s.id}</td>
                              <td className="px-4 py-2 font-bold text-gray-800">{s.name}</td>
                              <td className={`px-4 py-2 font-bold ${s.average >= 10 ? 'text-emerald-600' : 'text-red-600'}`} dir="ltr">{s.average.toFixed(2)}</td>
                              <td className="px-4 py-2 text-gray-700">{s.f1}</td>
                              {level !== 'prim' && <td className="px-4 py-2 text-gray-700">{s.f2}</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Print Section for Correction */}
      <div className="hidden print:block" dir="rtl">
        <div style={{ maxWidth: '100%', margin: '0 auto', fontFamily: 'Tahoma, Arial, sans-serif' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '1.6rem', margin: '0', fontWeight: 'bold' }}>الجمهورية الجزائرية الديمقراطية الشعبية</h1>
            <h2 style={{ fontSize: '1.4rem', margin: '5px 0', fontWeight: 'bold' }}>وزارة التربية الوطنية</h2>
          </div>
          <div style={{ textAlign: 'right', margin: '15px 0' }}>
            <div style={{ fontSize: '1.2rem' }}>مديرية التربية لولاية ....................................</div>
            <div style={{ fontSize: '1.2rem' }}>المؤسسة ..............................................................</div>
          </div>
          <div style={{ fontSize: '1.2rem', margin: '20px 0', fontWeight: 'bold', textAlign: 'right' }}>
            أنا الممضي أسفله، الأستاذ(ة): <strong>{currentTeacher}</strong>، أقر بوجود خطأ في رصد العلامات على أن تصحح على النحو الآتي:
          </div>
          <table border={1} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', marginBottom: '40px' }}>
            <thead style={{ backgroundColor: '#f3f4f6' }}>
              <tr>
                <th rowSpan={2} style={{ padding: '8px', border: '1px solid black' }}>التلميذ</th>
                <th rowSpan={2} style={{ padding: '8px', border: '1px solid black' }}>الفوج</th>
                <th rowSpan={2} style={{ padding: '8px', border: '1px solid black' }}>المادة</th>
                <th colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>العلامة السابقة</th>
                <th colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>العلامة بعد التصحيح</th>
                <th rowSpan={2} style={{ padding: '8px', border: '1px solid black' }}>السبب</th>
              </tr>
              <tr>
                <th style={{ padding: '8px', border: '1px solid black' }}>تقويم</th>
                <th style={{ padding: '8px', border: '1px solid black' }}>فرض</th>
                <th style={{ padding: '8px', border: '1px solid black' }}>اختبار</th>
                <th style={{ padding: '8px', border: '1px solid black' }}>تقويم</th>
                <th style={{ padding: '8px', border: '1px solid black' }}>فرض</th>
                <th style={{ padding: '8px', border: '1px solid black' }}>اختبار</th>
              </tr>
            </thead>
            <tbody>
              {corrections.map((c, i) => {
                const err = allErrors.find(e => e.id === c.errorId);
                return (
                  <tr key={i}>
                    <td style={{ padding: '8px', border: '1px solid black' }}>{c.pupilName}</td>
                    <td style={{ padding: '8px', border: '1px solid black' }}>{c.group}</td>
                    <td style={{ padding: '8px', border: '1px solid black' }}>{c.subject}</td>
                    <td style={{ padding: '8px', border: '1px solid black' }}>{err?.activities || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid black' }}>{err?.devoir || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid black' }}>{err?.exam || '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid black' }}>{c.field === 'activities' ? c.new : '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid black' }}>{c.field === 'devoir' ? c.new : '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid black' }}>{c.field === 'exam' ? c.new : '-'}</td>
                    <td style={{ padding: '8px', border: '1px solid black' }}>{c.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', marginTop: '50px' }}>
            <div style={{ textAlign: 'center', width: '45%' }}>إمضاء الأستاذ<br />........................</div>
            <div style={{ textAlign: 'center', width: '45%' }}>مدير المؤسسة<br />........................<br />الختم</div>
          </div>
        </div>
      </div>
    </div>
  );
}
