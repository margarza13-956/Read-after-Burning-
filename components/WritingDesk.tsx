import React, { useState, useRef, useEffect } from 'react';
import { Emotion, Letter, Attachment } from '../types';
import { Button } from './Button';
import { generateReflectivePrompt, detectEmotionFromText, poetifyText } from '../services/geminiService';
import { Sparkles, X, Paperclip, Image as ImageIcon, Video as VideoIcon, Trash2, Wand2, ScanEye } from 'lucide-react';

interface WritingDeskProps {
  onBurn: (letter: Letter) => void;
  onCancel: () => void;
  initialEmotion?: Emotion | null;
}

export const WritingDesk: React.FC<WritingDeskProps> = ({ onBurn, onCancel, initialEmotion }) => {
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState<Emotion | null>(initialEmotion || null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isDetectingEmotion, setIsDetectingEmotion] = useState(false);
  const [isPoetifying, setIsPoetifying] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialEmotion) {
        setEmotion(initialEmotion);
    }
  }, [initialEmotion]);

  const handleGetPrompt = async () => {
    if (!emotion) return;
    setIsGeneratingPrompt(true);
    const newPrompt = await generateReflectivePrompt(emotion, content);
    setPrompt(newPrompt);
    setIsGeneratingPrompt(false);
  };

  const handleDetectEmotion = async () => {
    if (!content.trim()) return;
    setIsDetectingEmotion(true);
    const detected = await detectEmotionFromText(content);
    if (detected) {
      setEmotion(detected);
    }
    setIsDetectingEmotion(false);
  };

  const handlePoetify = async () => {
    if (!content.trim()) return;
    setIsPoetifying(true);
    const poetic = await poetifyText(content);
    setContent(poetic);
    setIsPoetifying(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("Attachment is too large. Please select a file under 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setAttachment({ type, url: result });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const handleBurn = () => {
    if (!content.trim() || !emotion) return;
    const letter: Letter = {
      id: crypto.randomUUID(),
      content,
      emotion,
      createdAt: Date.now(),
      attachment: attachment || undefined
    };
    onBurn(letter);
  };

  return (
    <div className="relative z-10 max-w-4xl mx-auto p-6 h-full flex flex-col justify-center min-h-screen">
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 p-6 md:p-10 transform transition-all animate-in fade-in zoom-in duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-serif-display text-slate-100">Write a Letter</h2>
            <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Emotion Selector */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-3">
             <label className="block text-slate-400 text-sm uppercase tracking-wider">What are you feeling?</label>
             {content.length > 20 && !emotion && (
                 <button 
                    onClick={handleDetectEmotion}
                    disabled={isDetectingEmotion}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                 >
                    <ScanEye size={12} />
                    {isDetectingEmotion ? 'Sensing...' : 'Detect from text'}
                 </button>
             )}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.values(Emotion).map((e) => (
              <button
                key={e}
                onClick={() => setEmotion(e)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  emotion === e 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30 scale-105' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar: AI Prompt & Attachments */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            {/* Left: AI Prompt */}
            <div className="flex-1 min-w-[200px]">
              {emotion && (
                <div className="transition-all duration-500 ease-in-out">
                  {!prompt ? (
                    <button 
                      onClick={handleGetPrompt}
                      disabled={isGeneratingPrompt}
                      className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <Sparkles size={16} />
                      {isGeneratingPrompt ? 'Listening to the stars...' : 'Need a spark? Ask the stars.'}
                    </button>
                  ) : (
                      <div className="bg-indigo-900/20 border-l-4 border-indigo-500 p-3 rounded-r-lg animate-in fade-in slide-in-from-left-2">
                          <p className="text-indigo-200 italic font-body-text text-sm">"{prompt}"</p>
                      </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Tools */}
            <div className="flex items-center gap-4">
               {content.length > 10 && (
                 <button 
                    onClick={handlePoetify}
                    disabled={isPoetifying}
                    className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors disabled:opacity-50"
                    title="Rewrite text to be more poetic"
                  >
                    <Wand2 size={16} />
                    {isPoetifying ? 'Weaving...' : 'Poetify'}
                  </button>
               )}
              
              <div className="h-4 w-px bg-slate-700 mx-2"></div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/*,video/*"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
                title="Attach photo or video"
              >
                <Paperclip size={18} />
                Attach Memory
              </button>
            </div>
        </div>

        {/* Writing Area */}
        <div className="mb-6 relative group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Pour your heart out here... Once burnt, these words will turn to ash."
            className="w-full h-56 bg-slate-50 text-slate-900 rounded-lg p-6 font-body-text text-lg shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 placeholder:text-slate-400 leading-relaxed"
          />
          <div className="absolute bottom-4 right-4 text-slate-400 text-xs pointer-events-none">
             {content.length} chars
          </div>
        </div>

        {/* Attachment Preview */}
        {attachment && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-2">
            <div className="relative inline-block group">
              {attachment.type === 'image' ? (
                <div className="relative overflow-hidden rounded-lg border border-slate-600">
                  <img src={attachment.url} alt="Attachment" className="h-32 w-auto object-cover" />
                  <div className="absolute top-2 left-2 bg-black/50 p-1 rounded-md text-white/80">
                    <ImageIcon size={14} />
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-lg border border-slate-600 bg-black flex items-center justify-center h-32 w-48">
                  <video src={attachment.url} className="h-full w-full object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VideoIcon size={24} className="text-white opacity-80" />
                  </div>
                </div>
              )}
              
              <button 
                onClick={removeAttachment}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                title="Remove attachment"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">Attached memories will burn with the letter.</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-4">
            <Button variant="ghost" onClick={onCancel}>
                Save for later
            </Button>
            <Button 
                variant="primary" 
                size="lg" 
                onClick={handleBurn}
                disabled={!content.trim() || !emotion}
                className="group"
            >
                <span className="flex items-center gap-2">
                    Burn Letter
                    <span className="group-hover:translate-x-1 transition-transform">🔥</span>
                </span>
            </Button>
        </div>
      </div>
    </div>
  );
};