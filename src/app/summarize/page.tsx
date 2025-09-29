'use client'

import { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileText, Download, Trash2, Send, File, FileImage } from 'lucide-react';

// Extend Window interface for PDF.js
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function SummarizePage() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const goBack = () => {
    window.location.href = '/notes';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploadedFile(file);
    setIsProcessing(true);
    setInputText('⏳ Sedang memproses file...');

    try {
      const fileType = file.type;
      const fileNameLower = file.name.toLowerCase();

      // TXT files - read directly in browser
      if (fileType === 'text/plain' || fileNameLower.endsWith('.txt')) {
        const text = await file.text();
        setInputText(text);
        setIsProcessing(false);
        return;
      }

      // PDF files - parse in browser using PDF.js from CDN
      if (fileType === 'application/pdf' || fileNameLower.endsWith('.pdf')) {
        try {
          // Load PDF.js from CDN if not already loaded
          if (!window.pdfjsLib) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            document.head.appendChild(script);
            
            await new Promise((resolve, reject) => {
              script.onload = resolve;
              script.onerror = reject;
            });
            
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          }

          const arrayBuffer = await file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n\n';
          }
          
          setInputText(fullText.trim());
          setIsProcessing(false);
          return;
        } catch (pdfError) {
          console.error('PDF error:', pdfError);
          setInputText('');
          alert('Gagal memproses PDF. Coba convert ke TXT terlebih dahulu.');
          setIsProcessing(false);
          return;
        }
      }

      // For DOCX, DOC, PPTX - use server API
      if (
        fileType.includes('word') || 
        fileType.includes('document') ||
        fileType.includes('presentation') ||
        fileNameLower.endsWith('.docx') ||
        fileNameLower.endsWith('.doc') ||
        fileNameLower.endsWith('.pptx')
      ) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/parse-file', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setInputText(result.text);
        } else {
          setInputText('');
          alert(result.error || 'Gagal memproses file.');
        }
        setIsProcessing(false);
        return;
      }

      // Unsupported file type
      setInputText('');
      alert('Format file tidak didukung. Gunakan: PDF, DOCX, DOC, PPTX, atau TXT');
      setIsProcessing(false);

    } catch (error) {
      console.error('Error processing file:', error);
      setInputText('');
      alert('Terjadi kesalahan saat memproses file.');
      setIsProcessing(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setFileName('');
    setInputText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      alert('Silakan masukkan teks yang ingin diringkas.');
      return;
    }

    setIsSummarizing(true);
    setSummary('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText.trim() }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSummary(data.summary);
      } else {
        alert(data.error || 'Gagal membuat ringkasan.');
      }
    } catch (error) {
      console.error('Error summarizing:', error);
      alert('Terjadi kesalahan saat membuat ringkasan.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const downloadSummary = () => {
    if (!summary) {
      alert('Belum ada ringkasan untuk didownload.');
      return;
    }

    const content = `RINGKASAN DOKUMEN
==================

File: ${fileName || 'Manual Input'}
Tanggal: ${new Date().toLocaleDateString('id-ID')}
Panjang Teks Asli: ${inputText.length} karakter
Panjang Ringkasan: ${summary.length} karakter

RINGKASAN:
${summary}

---
Generated by Notes App - Summarize Feature`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ringkasan_${fileName.replace(/\.[^/.]+$/, "") || 'dokumen'}_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInputText('');
    setSummary('');
    clearFile();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-100">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Kembali ke Notes
              </button>
              
              <div className="flex items-center gap-2">
                <FileText className="w-8 h-8 text-green-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">AI Summarizer</h1>
                  <p className="text-sm text-gray-600">Upload dokumen atau tulis teks untuk diringkas</p>
                </div>
              </div>
            </div>

            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-300"
            >
              <Trash2 className="w-5 h-5" />
              Clear All
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Left Panel - Input */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Input Dokumen</h2>
              
              {/* File Upload Area */}
              <div className="mb-4">
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-blue-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    accept=".txt,.pdf,.doc,.docx,.pptx"
                    className="hidden"
                    id="file-upload"
                    disabled={isProcessing}
                  />
                  <label 
                    htmlFor="file-upload" 
                    className={`cursor-pointer flex flex-col items-center gap-3 ${isProcessing ? 'opacity-50' : ''}`}
                  >
                    <Upload className="w-12 h-12 text-gray-400" />
                    <div className="text-center">
                      <p className="text-lg font-medium text-gray-700">
                        Upload File
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, DOCX, DOC, PPTX, atau TXT
                      </p>
                    </div>
                  </label>
                </div>

                {uploadedFile && (
                  <div className="mt-3 flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <File className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {fileName}
                      </span>
                    </div>
                    <button
                      onClick={clearFile}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="text-center text-gray-500 my-4">atau</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tulis atau Paste Teks Manual
                </label>
                <textarea
                  value={inputText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)}
                  placeholder="Paste teks yang ingin diringkas di sini..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm leading-relaxed"
                  disabled={isProcessing}
                />
                
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{inputText.length} karakter</span>
                  <span>{inputText.split(/\s+/).filter(word => word.length > 0).length} kata</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <button
                onClick={handleSummarize}
                disabled={isSummarizing || !inputText.trim() || isProcessing}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-white font-semibold transition-all duration-300 ${
                  isSummarizing || !inputText.trim() || isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSummarizing ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Sedang Meringkas...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Buat Ringkasan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Hasil Ringkasan</h2>
                {summary && (
                  <button
                    onClick={downloadSummary}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all duration-300"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {isSummarizing ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
                  <p className="text-gray-600 text-lg">Sedang memproses ringkasan...</p>
                  <p className="text-gray-500 text-sm mt-2">Mohon tunggu sebentar</p>
                </div>
              ) : summary ? (
                <div>
                  <div className="bg-green-50 p-4 rounded-2xl mb-4">
                    <div className="flex items-center gap-2 text-green-800 text-sm">
                      <FileText className="w-4 h-4" />
                      <span>Ringkasan berhasil dibuat</span>
                    </div>
                  </div>
                  
                  <div className="prose prose-lg max-w-none">
                    <div className="p-4 bg-gray-50 rounded-2xl text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {summary}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
                    <span>Ringkasan: {summary.length} karakter</span>
                    <span>Rasio: {((summary.length / inputText.length) * 100).toFixed(1)}% dari teks asli</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <FileImage className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium">Belum ada ringkasan</p>
                  <p className="text-sm text-center">
                    Upload file atau masukkan teks di panel kiri, <br />
                    lalu klik "Buat Ringkasan"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        {(inputText || summary) && (
          <div className="mt-6 bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-xl border border-white/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{inputText.length}</div>
                <div className="text-sm text-gray-600">Karakter Input</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{summary.length}</div>
                <div className="text-sm text-gray-600">Karakter Ringkasan</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {inputText.split(/\s+/).filter(word => word.length > 0).length}
                </div>
                <div className="text-sm text-gray-600">Kata Input</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {summary ? `${((summary.length / inputText.length) * 100).toFixed(1)}%` : '0%'}
                </div>
                <div className="text-sm text-gray-600">Rasio Ringkasan</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}