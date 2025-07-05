'use client';

import React, { useState, memo, ReactNode, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Send, FileText, Image, Video, Music, Archive, X, Bot, User, Paperclip } from 'lucide-react';
import ConnectWalletButton from '../components/ConnectWallet';

// ==================== Utils ====================
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Format timestamp safely for hydration
function formatTimestamp(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleTimeString();
  } catch {
    return '';
  }
}

// ==================== BoxReveal Component ====================
type BoxRevealProps = {
  children: ReactNode;
  width?: string;
  boxColor?: string;
  duration?: number;
  overflow?: string;
  position?: string;
  className?: string;
};

const BoxReveal = memo(function BoxReveal({
  children,
  width = 'fit-content',
  duration,
  overflow = 'hidden',
  position = 'relative',
  className,
}: BoxRevealProps) {
  const mainControls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      mainControls.start('visible');
    } else {
      mainControls.start('hidden');
    }
  }, [isInView, mainControls]);

  return (
    <section
      ref={ref}
      style={{
        position: position as 'relative' | 'absolute' | 'fixed' | 'sticky' | 'static',
        width,
        overflow,
      }}
      className={className}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial='hidden'
        animate={mainControls}
        transition={{ duration: duration ?? 0.5, delay: 0.25 }}
      >
        {children}
      </motion.div>
    </section>
  );
});

// ==================== BackgroundBeams Component ====================
const BackgroundBeams = memo(function BackgroundBeams({ className }: { className?: string }) {
  const paths = [
    "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
    "M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867",
    "M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859",
    "M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851",
    "M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843",
  ];

  return (
    <div
      className={cn(
        "absolute h-full w-full inset-0 flex items-center justify-center",
        className,
      )}
    >
      <svg
        className="z-0 h-full w-full pointer-events-none absolute"
        width="100%"
        height="100%"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map((path, index) => (
          <motion.path
            key={`path-${index}`}
            d={path}
            stroke={`url(#linearGradient-${index})`}
            strokeOpacity="0.4"
            strokeWidth="0.5"
          />
        ))}
        <defs>
          {paths.map((path, index) => (
            <motion.linearGradient
              id={`linearGradient-${index}`}
              key={`gradient-${index}`}
              initial={{
                x1: "0%",
                x2: "0%",
                y1: "0%",
                y2: "0%",
              }}
              animate={{
                x1: ["0%", "100%"],
                x2: ["0%", "95%"],
                y1: ["0%", "100%"],
                y2: ["0%", `${93 + Math.random() * 8}%`],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                ease: "easeInOut",
                repeat: Infinity,
                delay: Math.random() * 10,
              }}
            >
              <stop stopColor="#18CCFC" stopOpacity="0" />
              <stop stopColor="#18CCFC" />
              <stop offset="32.5%" stopColor="#6344F5" />
              <stop offset="100%" stopColor="#AE48FF" stopOpacity="0" />
            </motion.linearGradient>
          ))}
        </defs>
      </svg>
    </div>
  );
});

// ==================== Message Types ====================
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string; // Store as string to avoid SSR/CSR mismatch
  attachments?: UploadedFile[];
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

// ==================== Utility Functions ====================
const getFileIcon = (fileType: string) => {
  // eslint-disable-next-line jsx-a11y/alt-text
  if (fileType.startsWith('image/')) return <Image size={16} className="text-blue-400" />;
  if (fileType.startsWith('video/')) return <Video size={16} className="text-purple-400" />;
  if (fileType.startsWith('audio/')) return <Music size={16} className="text-green-400" />;
  if (fileType.includes('zip') || fileType.includes('rar')) return <Archive size={16} className="text-yellow-400" />;
  return <FileText size={16} className="text-gray-400" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ==================== AI Chat Component ====================
const AIChatPage = memo(function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your Exzek assistant. I can help you analyze documents, images, and answer questions. Feel free to upload files using the + button or just start chatting!",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = async (userMessage: string, files?: UploadedFile[]) => {
    setIsTyping(true);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    let aiResponse = '';
    
    if (files && files.length > 0) {
      const fileNames = files.map(f => f.name).join(', ');
      aiResponse = `I've received your file(s): ${fileNames}. I can see ${files.length} file(s) uploaded. Let me analyze them for you.\n\nBased on the files you've shared, I can help you with:\n• Document analysis and summarization\n• Image recognition and description\n• Data extraction\n• Content review\n\nWhat would you like me to focus on?`;
    } else {
      // Simple responses based on user input
      const lowerMessage = userMessage.toLowerCase();
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        aiResponse = "Hello! How can I assist you today? You can ask me questions or upload files for analysis.";
      } else if (lowerMessage.includes('help')) {
        aiResponse = "I'm here to help! I can:\n• Analyze documents and images\n• Answer questions\n• Summarize content\n• Extract information\n\nJust upload a file using the + button or ask me anything!";
      } else if (lowerMessage.includes('upload') || lowerMessage.includes('file')) {
        aiResponse = "To upload files, click the + button next to the message input. I can analyze various file types including images, documents, PDFs, and more!";
      } else {
        aiResponse = `I understand you're asking about "${userMessage}". While I'd love to give you a detailed response, this is a demo interface. In a real implementation, I would process your request and provide comprehensive assistance!`;
      }
    }
    
    const aiMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && uploadedFiles.length === 0) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim() || 'Uploaded files',
      timestamp: new Date().toISOString(),
      attachments: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setUploadedFiles([]);
    setShowFileUpload(false);
    
    // Simulate AI response
    await simulateAIResponse(userMessage.content, userMessage.attachments);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setShowFileUpload(true);
    e.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (uploadedFiles.length === 1) {
      setShowFileUpload(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      <BackgroundBeams className="opacity-30" />
      
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <BoxReveal boxColor="#3b82f6" duration={0.5}>
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Exzek Assistant</h1>
                <p className="text-white/60 text-sm">Powered by advanced ASI</p>
              </div>
            </div>
          </div>
        </BoxReveal>

        {/* Connect Wallet Button */}
        <ConnectWalletButton />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                message.type === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                message.type === 'user' 
                  ? "bg-gradient-to-r from-green-600 to-blue-600" 
                  : "bg-gradient-to-r from-blue-600 to-purple-600"
              )}>
                {message.type === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
              </div>
              
              <div className={cn(
                "max-w-[70%] rounded-2xl p-4",
                message.type === 'user' 
                  ? "bg-gradient-to-r from-green-600 to-blue-600 text-white" 
                  : "bg-white/10 backdrop-blur-md border border-white/20 text-white"
              )}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                
                {/* File attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.attachments.map((file) => (
                      <div key={file.id} className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                        {getFileIcon(file.type)}
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-white/60">({formatFileSize(file.size)})</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-white/60 mt-2">
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-white/60 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    className="w-2 h-2 bg-white/60 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                    className="w-2 h-2 bg-white/60 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* File Upload Preview */}
        {showFileUpload && uploadedFiles.length > 0 && (
          <div className="p-4 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <h4 className="text-white font-medium mb-2">Files to send:</h4>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                    {getFileIcon(file.type)}
                    <span className="text-white text-sm flex-1">{file.name}</span>
                    <span className="text-white/60 text-xs">({formatFileSize(file.size)})</span>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <BoxReveal boxColor="#3b82f6" duration={0.3}>
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-3 items-end">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center gap-2 transition-all duration-300 flex-shrink-0 whitespace-nowrap"
              >
                <Paperclip size={16} className="text-white" />
                <span className="text-white text-sm font-medium">Prove your identity</span>
              </button>
              
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 pr-12 text-white placeholder-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() && uploadedFiles.length === 0}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </BoxReveal>
      </div>
    </div>
  );
});

export default AIChatPage;
