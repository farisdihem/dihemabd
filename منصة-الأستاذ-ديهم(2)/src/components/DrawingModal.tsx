import React, { useRef, useState, useEffect } from 'react';
import { X, Pencil, Minus, Square, Circle, Type, Trash2 } from 'lucide-react';

interface DrawingModalProps {
  onClose: () => void;
  onInsert: (dataUrl: string) => void;
}

export default function DrawingModal({ onClose, onInsert }: DrawingModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pencil' | 'line' | 'rect' | 'circle' | 'text'>('pencil');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    if (tool === 'text') {
      const text = prompt("أدخل النص:");
      if (text) {
        ctx.font = "bold 24px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(text, pos.x, pos.y);
        setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
      }
      return;
    }

    setIsDrawing(true);
    setStartPos(pos);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !snapshot) return;

    if (tool !== 'pencil') {
      ctx.putImageData(snapshot, 0, 0);
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    if (tool === 'pencil') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'rect') {
      ctx.beginPath();
      ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
    } else if (tool === 'circle') {
      ctx.beginPath();
      const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleInsert = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onInsert(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl p-4 w-[600px] max-w-full flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="font-bold text-lg">رسم شكل هندسي</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500"><X /></button>
        </div>
        
        <div className="flex gap-2 mb-2 bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto hide-scrollbar shrink-0">
          <button onClick={() => setTool('pencil')} className={`p-2 rounded flex items-center gap-1 transition whitespace-nowrap ${tool === 'pencil' ? 'bg-gray-200' : 'hover:bg-gray-200'}`} title="قلم حر"><Pencil className="w-4 h-4"/> حر</button>
          <button onClick={() => setTool('line')} className={`p-2 rounded flex items-center gap-1 transition whitespace-nowrap ${tool === 'line' ? 'bg-gray-200' : 'hover:bg-gray-200'}`} title="مستقيم"><Minus className="w-4 h-4"/> مستقيم</button>
          <button onClick={() => setTool('rect')} className={`p-2 rounded flex items-center gap-1 transition whitespace-nowrap ${tool === 'rect' ? 'bg-gray-200' : 'hover:bg-gray-200'}`} title="مستطيل"><Square className="w-4 h-4"/> مستطيل</button>
          <button onClick={() => setTool('circle')} className={`p-2 rounded flex items-center gap-1 transition whitespace-nowrap ${tool === 'circle' ? 'bg-gray-200' : 'hover:bg-gray-200'}`} title="دائرة"><Circle className="w-4 h-4"/> دائرة</button>
          <button onClick={() => setTool('text')} className={`p-2 rounded flex items-center gap-1 transition whitespace-nowrap ${tool === 'text' ? 'bg-gray-200' : 'hover:bg-gray-200'}`} title="نص"><Type className="w-4 h-4"/> نص</button>
          <div className="w-px bg-gray-300 mx-1 shrink-0" />
          <button onClick={clearCanvas} className="p-2 rounded hover:bg-red-100 text-red-600 transition mr-auto flex items-center gap-1 whitespace-nowrap" title="مسح الكل"><Trash2 className="w-4 h-4"/> مسح</button>
        </div>

        <div className="border-2 border-gray-300 rounded cursor-crosshair overflow-x-auto bg-white flex-1 min-h-0">
          <canvas 
            ref={canvasRef}
            width={564} 
            height={300}
            className="touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseOut={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4 shrink-0">
          <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50 transition">إلغاء</button>
          <button onClick={handleInsert} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">إدراج في الاختبار</button>
        </div>
      </div>
    </div>
  );
}
