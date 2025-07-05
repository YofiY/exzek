'use client';

import React, { useState, useCallback, memo, ReactNode, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Upload, FileText, Image, Video, Music, Archive, X, Check, AlertCircle } from 'lucide-react';

// ==================== Utils ====================
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
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
  boxColor,
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
const BackgroundBeams = memo(({ className }: { className?: string }) => {
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

// ==================== File Upload Component ====================
interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <Image size={20} className="text-blue-400" />;
  if (fileType.startsWith('video/')) return <Video size={20} className="text-purple-400" />;
  if (fileType.startsWith('audio/')) return <Music size={20} className="text-green-400" />;
  if (fileType.includes('zip') || fileType.includes('rar')) return <Archive size={20} className="text-yellow-400" />;
  return <FileText size={20} className="text-gray-400" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileUploadPage = memo(function FileUploadPage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const simulateUpload = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const fileId = Math.random().toString(36).substr(2, 9);
      const newFile: UploadedFile = {
        file,
        id: fileId,
        progress: 0,
        status: 'uploading'
      };

      setUploadedFiles(prev => [...prev, newFile]);

      const interval = setInterval(() => {
        setUploadedFiles(prev => 
          prev.map(f => {
            if (f.id === fileId) {
              const newProgress = Math.min(f.progress + Math.random() * 30, 100);
              if (newProgress >= 100) {
                clearInterval(interval);
                setTimeout(() => resolve(), 500);
                return { ...f, progress: 100, status: 'completed' as const };
              }
              return { ...f, progress: newProgress };
            }
            return f;
          })
        );
      }, 200);
    });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    
    setIsUploading(true);
    setIsDragOver(false);

    const fileArray = Array.from(files);
    
    try {
      await Promise.all(fileArray.map(file => simulateUpload(file)));
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    e.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      <BackgroundBeams className="opacity-30" />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <BoxReveal boxColor="#3b82f6" duration={0.5}>
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-white mb-4">upload a proof</h1>
              <p className="text-white/70 text-lg">
                Drag and drop your files here or click to browse
              </p>
            </div>
          </BoxReveal>

          {/* Upload Area */}
          <BoxReveal boxColor="#3b82f6" duration={0.3}>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300",
                  isDragOver
                    ? "border-blue-400 bg-blue-500/10"
                    : "border-white/30 hover:border-white/50 hover:bg-white/5"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                
                <motion.div
                  animate={{
                    scale: isDragOver ? 1.1 : 1,
                    rotateY: isDragOver ? 180 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="mb-4"
                >
                  <Upload size={64} className="mx-auto text-white/70" />
                </motion.div>
                
                <h3 className="text-xl font-semibold text-white mb-2">
                  {isDragOver ? "Drop proofs here" : "Choose proofs to upload"}
                </h3>
                <p className="text-white/60 mb-4">
                  Support for any file type • Max 100MB per file
                </p>
                
                <button
                  disabled={isUploading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? "Uploading..." : "Browse Files"}
                </button>
              </div>
            </div>
          </BoxReveal>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <BoxReveal boxColor="#3b82f6" duration={0.3}>
              <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Uploaded Files ({uploadedFiles.length})
                </h3>
                
                <div className="space-y-3">
                  {uploadedFiles.map((uploadedFile) => (
                    <motion.div
                      key={uploadedFile.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex-shrink-0">
                        {getFileIcon(uploadedFile.file.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {uploadedFile.file.name}
                        </p>
                        <p className="text-white/60 text-sm">
                          {formatFileSize(uploadedFile.file.size)}
                        </p>
                        
                        {uploadedFile.status === 'uploading' && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-white/70 mb-1">
                              <span>Uploading...</span>
                              <span>{Math.round(uploadedFile.progress)}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-1.5">
                              <motion.div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadedFile.progress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {uploadedFile.status === 'completed' && (
                          <Check size={20} className="text-green-400" />
                        )}
                        {uploadedFile.status === 'error' && (
                          <AlertCircle size={20} className="text-red-400" />
                        )}
                        <button
                          onClick={() => removeFile(uploadedFile.id)}
                          className="text-white/60 hover:text-white transition-colors"
                          disabled={uploadedFile.status === 'uploading'}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </BoxReveal>
          )}

          {/* Action Buttons */}
          <BoxReveal boxColor="#3b82f6" duration={0.3}>
            <div className="mt-6 flex gap-4 justify-center">
              
              
              {uploadedFiles.length > 0 && (
                <button
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300"
                >
                  Process Files ({uploadedFiles.filter(f => f.status === 'completed').length})
                </button>
              )}
            </div>
          </BoxReveal>
        </div>
      </div>
    </div>
  );
});

export default FileUploadPage;
