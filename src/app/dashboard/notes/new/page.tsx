/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Mic, MicOff, FileText, Volume2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: ISpeechRecognition, ev: Event) => unknown) | null;
  onaudioend: ((this: ISpeechRecognition, ev: Event) => unknown) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => unknown) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null;
  onnomatch: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
  onsoundstart: ((this: ISpeechRecognition, ev: Event) => unknown) | null;
  onsoundend: ((this: ISpeechRecognition, ev: Event) => unknown) | null;
  onspeechstart: ((this: ISpeechRecognition, ev: Event) => unknown) | null;
  onspeechend: ((this: ISpeechRecognition, ev: Event) => unknown) | null;
  onstart: ((this: ISpeechRecognition, ev: Event) => unknown) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// @ts-ignore - Speech Recognition types conflict
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export default function NewNotePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  // const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [saving, setSaving] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSpeechSupported(true);
      initializeSpeechRecognition();
    }
  }, []);

  const initializeSpeechRecognition = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'id-ID';

    recognition.onstart = () => {
      setIsRecording(true);
      setIsProcessing(false);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);
      if (final) {
        setFinalTranscript(prev => prev + final);
        setContent(prev => prev + final);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsProcessing(false);
      setInterimTranscript('');
    };

    setRecognition(recognition);
  };
  
  const startVoiceRecording = async () => {
    try {
      // Start speech recognition
      if (recognition && isSpeechSupported) {
        recognition.start();
      }

      // Start audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);

    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }

    if (recognition && isRecording) {
      recognition.stop();
    }

    setIsProcessing(true);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setContent('');
    setFinalTranscript('');
    setInterimTranscript('');
  };

  const saveNote = async () => {
    if (!title.trim() && !content.trim()) {
      alert('Please add a title or content to save the note.');
      return;
    }

    setSaving(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        alert('Please log in to save notes.');
        setSaving(false);
        return;
      }

      // Save note to database with user_id
      const { data, error } = await supabase
        .from('notes')
        .insert({
          title: title.trim() || 'Untitled Note',
          content: content.trim(),
          user_id: user.id
        })
        .select();

      if (error) {
        console.error('Error saving note:', error.message);
        alert('Failed to save note. Please try again.');
      } else {
        alert('Note saved successfully!');
        window.location.href = '/dashboard/notes';
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    if (content.trim() || title.trim()) {
      if (confirm('You have unsaved changes. Are you sure you want to go back?')) {
        window.location.href = '/dashboard/notes';
      }
    } else {
      window.location.href = '/dashboard/notes';
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Notes
            </button>

            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                Text Note with Voice Input
              </span>
            </div>
          </div>
        </div>

        {/* Note Editor */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {/* Title Section */}
          <div className="p-6 border-b border-gray-200/50">
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder-gray-400 text-gray-800"
            />
          </div>

          {/* Content Section */}
          <div className="p-6 min-h-[500px] flex flex-col">
            <textarea
              ref={textareaRef}
              placeholder="Start writing your thoughts... Or use the microphone below to speak and convert to text."
              value={content + interimTranscript}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full bg-transparent border-none outline-none resize-none text-gray-700 leading-relaxed text-lg min-h-[400px] placeholder-gray-400"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            />

            {/* Interim transcript indicator */}
            {interimTranscript && (
              <div className="text-gray-400 italic text-sm mt-2">
                Processing: &quot;{interimTranscript}&quot;
              </div>
            )}
          </div>

          {/* Audio Player (if voice recorded) */}
          {audioUrl && (
            <div className="px-6 pb-4">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Voice Input Preview
                  </h3>
                  <button
                    onClick={clearRecording}
                    className="p-2 hover:bg-blue-200 rounded-xl transition-colors"
                    title="Clear Recording"
                  >
                    <Trash2 className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  className="w-full"
                />
                <p className="text-sm text-blue-700 mt-2">
                  This audio is converted to text and added to your note content above.
                </p>
              </div>
            </div>
          )}

          {/* Bottom Toolbar */}
          <div className="p-6 bg-gray-50/50 border-t border-gray-200/50">
            <div className="flex items-center justify-between">
              {/* Voice Recording Controls */}
              {isSpeechSupported ? (
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleRecording}
                    disabled={isProcessing}
                    className={`relative p-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg ${isRecording
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : isProcessing
                          ? 'bg-yellow-500 animate-pulse cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                      } text-white`}
                  >
                    {isProcessing ? (
                      <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                    ) : isRecording ? (
                      <MicOff className="w-6 h-6" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}

                    {isRecording && (
                      <div className="absolute -inset-2 rounded-full bg-red-500/30 animate-ping" />
                    )}
                  </button>

                  <div className="text-sm text-gray-600">
                    {isProcessing ? 'Processing speech...' :
                      isRecording ? 'Recording... Click to stop' :
                        'Click microphone to start voice input'}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  {content.length} characters
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={saveNote}
                disabled={saving || (!title.trim() && !content.trim())}
                className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Note
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}