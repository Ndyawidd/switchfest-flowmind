/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, FileText, Download, Trash2, Send, File, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inter, Poppins } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Load fonts
const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins'
});

// Extend Window interface for PDF.js
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

// Keyframes for the background gradient animation
const gradientKeyframes = `
  @keyframes gradient-animation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

// Inject keyframes into a style tag
// This is a simple way to add global keyframes if not using a CSS file
// For a larger project, consider a dedicated CSS file or styled-components
if (typeof window !== 'undefined' && !document.getElementById('gradient-keyframes-style')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'gradient-keyframes-style';
  styleTag.textContent = gradientKeyframes;
  document.head.appendChild(styleTag);
}

const glassCardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.7)', // More opaque white
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '24px', // Rounded more, slightly less than 32px to match example
  border: '1px solid rgba(255, 255, 255, 0.8)', // Thicker, more visible white border
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' // Softer, wider shadow
};

const aiThinkingVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const summaryVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const buttonVariants = {
  hover: { scale: 1.02, boxShadow: '0 0 16px 4px rgba(59, 130, 246, 0.3)' }, // Blue glow
  tap: { scale: 0.98 }
};

export default function SummarizePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

   const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/auth/login');
      } else {
        setUser(user);
      }
      setLoading(false);
    };

  const goBack = () => {
    window.location.href = '/notes';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploadedFile(file);
    setIsProcessing(true);
    setUploadProgress(0);

    const updateProgress = (progress: number) => {
      setUploadProgress(progress);
    };
    
    setInputText('⏳ Processing file...');

    try {
      const fileType = file.type;
      const fileNameLower = file.name.toLowerCase();

      if (fileType === 'text/plain' || fileNameLower.endsWith('.txt')) {
        const text = await file.text();
        setInputText(text);
        setIsProcessing(false);
        setUploadProgress(100);
        return;
      }

      if (fileType === 'application/pdf' || fileNameLower.endsWith('.pdf')) {
        try {
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
            const pageText = textContent.items.map((item: { str: string }) => item.str).join(' ');
            fullText += pageText + '\n\n';
            updateProgress(Math.min(100, Math.floor((i / pdf.numPages) * 100)));
          }
          
          setInputText(fullText.trim());
          setIsProcessing(false);
          setUploadProgress(100);
          return;
        } catch (pdfError) {
          console.error('PDF error:', pdfError);
          setInputText('');
          alert('Failed to process PDF. Try converting to TXT first.');
          setIsProcessing(false);
          setUploadProgress(0);
          return;
        }
      }

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
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/parse-file', true);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            updateProgress(progress);
          }
        };

        xhr.onload = async () => {
          if (xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
              setInputText(result.text);
            } else {
              setInputText('');
              alert(result.error || 'Failed to process file.');
            }
          } else {
            setInputText('');
            alert('An error occurred while processing the file.');
          }
          setIsProcessing(false);
          setUploadProgress(100);
        };

        xhr.onerror = () => {
          setInputText('');
          alert('A network error occurred while uploading the file.');
          setIsProcessing(false);
          setUploadProgress(0);
        };

        xhr.send(formData);
        return;
      }

      setInputText('');
      alert('File format not supported. Use: PDF, DOCX, DOC, PPTX, or TXT');
      setIsProcessing(false);
      setUploadProgress(0);

    } catch (error) {
      console.error('Error processing file:', error);
      setInputText('');
      alert('An error occurred while processing the file.');
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setFileName('');
    setInputText('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      alert('Please enter text to summarize.');
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
        alert(data.error || 'Failed to create summary.');
      }
    } catch (error) {
      console.error('Error summarizing:', error);
      alert('An error occurred while creating the summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const downloadSummary = () => {
    if (!summary) {
      alert('No summary available to download.');
      return;
    }

    const content = `DOCUMENT SUMMARY
==================

File: ${fileName || 'Manual Input'}
Date: ${new Date().toLocaleDateString('en-US')}
Original Text Length: ${inputText.length} characters
Summary Length: ${summary.length} characters

SUMMARY:
${summary}

---
Generated by Notes App - Summarize Feature`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary_${fileName.replace(/\.[^/.]+$/, "") || 'document'}_${new Date().getTime()}.txt`;
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
    <div
      className={`min-h-screen flex flex-col bg-white`}

    >
      <div className="container mx-auto md:p-8 lg:p-12 relative z-10 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <header className="mb-8">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-between p-4"
          >
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {/* <ArrowLeft className="w-5 h-5 text-blue-500" />
              <span className="text-sm md:text-base font-medium">Back to Notes</span> */}
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors"
            >
              {/* <Trash2 className="w-5 h-5" />
              <span className="text-sm md:text-base font-medium">Clear All</span> */}
            </button>
          </motion.div>

          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mt-4 mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold font-montserrat-alt text-center mb-10">
          <span className="text-blue-600">Summa</span>
          <span className="text-gray-900">rizer</span>
        </h1>

          </motion.div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Input */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={glassCardStyle}
            className="p-8 flex flex-col"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Input Text or Document</h2>
            
            {/* File Upload Area */}
            <div className="mb-6">
              <div className="relative border-2 border-dashed border-blue-200 rounded-[24px] p-6 hover:border-blue-400 transition-colors">
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
                  <Upload className="w-12 h-12 text-blue-400" />
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-700">
                      Upload File
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF, DOCX, DOC, PPTX, or TXT
                    </p>
                  </div>
                </label>
                <AnimatePresence>
                  {isProcessing && uploadProgress > 0 && uploadProgress < 100 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-4 left-4 right-4"
                    >
                      <div className="w-full h-1.5 rounded-full bg-blue-100 overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500"
                          initial={{ width: '0%' }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-1">{uploadProgress}%</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {uploadedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200"
                  >
                    <div className="flex items-center gap-2">
                      <File className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {fileName}
                      </span>
                    </div>
                    <button
                      onClick={clearFile}
                      className="text-red-500 hover:text-red-700 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="text-center text-gray-400 my-4">or</div>

            <div className="flex-grow flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type or Paste Text Manually
              </label>
              <textarea
                value={inputText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)}
                placeholder="Paste the text you want to summarize here..."
                className="w-full flex-grow p-4 border border-blue-200 bg-white/50 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none text-gray-800 text-sm leading-relaxed placeholder:text-gray-400 transition-colors"
                disabled={isProcessing}
              />
              
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{inputText.length} characters</span>
                <span>{inputText.split(/\s+/).filter(word => word.length > 0).length} words</span>
              </div>
            </div>

            <motion.button
              onClick={handleSummarize}
              disabled={isSummarizing || !inputText.trim() || isProcessing}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className={`w-full flex items-center justify-center gap-2 px-6 py-4 mt-6 rounded-2xl text-white font-semibold transition-all duration-300 relative overflow-hidden group
                ${
                  isSummarizing || !inputText.trim() || isProcessing
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                }
              `}
            >
              <AnimatePresence mode="wait">
                {isSummarizing ? (
                  <motion.div
                    key="thinking"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Summarizing...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="summarize"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                    <span>Create Summary</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

          {/* Right Panel - Output */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={glassCardStyle}
            className="p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Summary Result</h2>
              <AnimatePresence>
                {summary && (
                  <motion.button
                    onClick={downloadSummary}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium hidden md:block">Download</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {isSummarizing ? (
                <motion.div
                  key="thinking-state"
                  variants={aiThinkingVariants}
                  initial="initial"
                  animate="animate"
                  className="flex flex-col items-center justify-center flex-grow text-gray-700"
                >
                  <Zap className="w-16 h-16 text-blue-400 mb-4 animate-pulse" />
                  <p className="text-lg font-medium mb-1">AI Thinking...</p>
                  <p className="text-sm text-center text-gray-500">
                    Processing your summary.
                  </p>
                </motion.div>
              ) : summary ? (
                <motion.div
                  key="summary-state"
                  variants={summaryVariants}
                  initial="initial"
                  animate="animate"
                  className="flex-grow flex flex-col justify-between"
                >
                  <div className="bg-blue-50 p-5 rounded-2xl flex-grow overflow-y-auto custom-scrollbar border border-blue-100">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{summary}</p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, ease: "easeOut" }}
                    className="mt-4 flex items-center justify-between text-xs text-gray-500 bg-blue-50 p-3 rounded-xl border border-blue-100"
                  >
                    <span>Summary: {summary.length} characters</span>
                    <span>Ratio: {((summary.length / inputText.length) * 100).toFixed(1)}% of original</span>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex flex-col items-center justify-center flex-grow text-gray-500"
                >
                  <FileText className="w-16 h-16 text-blue-200 mb-4" />
                  <p className="text-lg font-medium">No summary yet</p>
                  <p className="text-sm text-center">
                    Your summary will appear here <br /> after processing is complete.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Stats Footer */}
        <AnimatePresence>
        {(inputText || summary) && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 p-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div style={glassCardStyle} className="p-4">
                <div className="text-2xl font-bold text-blue-600">{inputText.length}</div>
                <div className="text-sm text-gray-600">Input Characters</div>
              </div>
              <div style={glassCardStyle} className="p-4">
                <div className="text-2xl font-bold text-green-600">{summary.length}</div>
                <div className="text-sm text-gray-600">Summary Characters</div>
              </div>
              <div style={glassCardStyle} className="p-4">
                <div className="text-2xl font-bold text-indigo-600">
                  {inputText.split(/\s+/).filter(word => word.length > 0).length}
                </div>
                <div className="text-sm text-gray-600">Input Words</div>
              </div>
              <div style={glassCardStyle} className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {summary ? `${((summary.length / inputText.length) * 100).toFixed(1)}%` : '0%'}
                </div>
                <div className="text-sm text-gray-600">Summary Ratio</div>
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}