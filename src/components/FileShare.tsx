'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Upload, FileText, Image, File, X, Copy, Check, Link2, QrCode,
  Download, Share2, Trash2, Clock, Eye, Lock, Globe, Shield,
  Sparkles, Zap, AlertCircle, ChevronDown, ChevronUp, History,
  ExternalLink, MoreVertical, Heart, BarChart3, Users
} from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';

// Uploadcare config
const UPLOADCARE_PUBLIC_KEY = 'cd36361088f525c26903';

interface SharedFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  shortLink: string;
  createdAt: Date;
  downloads: number;
  isPasswordProtected?: boolean;
  password?: string;
  expiresAt?: Date;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.includes('pdf')) return FileText;
  return File;
};

const generateShortCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export default function FileShare() {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SharedFile | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'myfiles'>('upload');
  const [password, setPassword] = useState('');
  const [enablePassword, setEnablePassword] = useState(false);
  const [expiryDays, setExpiryDays] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Upload to Uploadcare
  const uploadToUploadcare = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('UPLOADCARE_PUB_KEY', UPLOADCARE_PUBLIC_KEY);
    formData.append('UPLOADCARE_STORE', '1');
    formData.append('file', file);

    const response = await fetch('https://upload.uploadcare.com/base/', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return `https://ucarecdn.com/${data.file}/`;
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadToUploadcare(file);
      const shortCode = generateShortCode();

      const newFile: SharedFile = {
        id: Date.now().toString(),
        name: file.name,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: url,
        shortLink: url, // Use the actual Uploadcare URL as the shareable link
        createdAt: new Date(),
        downloads: 0,
        isPasswordProtected: enablePassword && password.length > 0,
        password: enablePassword ? password : undefined,
        expiresAt: expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : undefined,
      };

      setFiles(prev => [newFile, ...prev]);
      setSelectedFile(newFile);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#8b5cf6', '#10b981']
      });

      // Reset password
      setPassword('');
      setEnablePassword(false);
      setExpiryDays(null);
    } catch (error) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };

  const deleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFile?.id === id) {
      setSelectedFile(null);
      setShowQR(false);
    }
  };

  const downloadFile = (file: SharedFile) => {
    setFiles(prev => prev.map(f =>
      f.id === file.id ? { ...f, downloads: f.downloads + 1 } : f
    ));
    window.open(file.url, '_blank');
  };

  const totalDownloads = files.reduce((acc, f) => acc + f.downloads, 0);
  const storageUsed = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/20">
            <Share2 size={20} className="text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              File Share
            </h2>
            <p className="text-xs text-white/40">
              Upload, share, and generate QR codes for your files
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-xs text-white/40">Files Shared</span>
            <p className="text-lg font-bold text-white">{files.length}</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-xs text-white/40">Downloads</span>
            <p className="text-lg font-bold text-white">{totalDownloads}</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-xs text-white/40">Storage Used</span>
            <p className="text-lg font-bold text-white">{formatFileSize(storageUsed)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'upload'
            ? 'bg-violet-500/10 text-violet-400'
            : 'text-white/40 hover:text-white/70'
            }`}
        >
          <Upload size={16} />
          Upload & Share
        </button>
        <button
          onClick={() => setActiveTab('myfiles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'myfiles'
            ? 'bg-violet-500/10 text-violet-400'
            : 'text-white/40 hover:text-white/70'
            }`}
        >
          <History size={16} />
          My Files ({files.length})
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'upload' ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Upload Area */}
            <div className="space-y-4">
              <motion.div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => inputRef.current?.click()}
                className={`relative h-[300px] rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${dragActive
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                  className="hidden"
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <motion.div
                    animate={{ y: dragActive ? -10 : 0, scale: dragActive ? 1.1 : 1 }}
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${dragActive ? 'bg-violet-500/20' : 'bg-white/5'
                      }`}
                  >
                    {uploading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Zap size={32} className="text-violet-400" />
                      </motion.div>
                    ) : (
                      <Upload size={32} className={dragActive ? 'text-violet-400' : 'text-white/40'} />
                    )}
                  </motion.div>

                  <p className="text-lg font-medium text-white/80 mb-2">
                    {uploading ? 'Uploading...' : dragActive ? 'Drop file here' : 'Drop files or click to upload'}
                  </p>
                  <p className="text-sm text-white/40 text-center">
                    Supports PDF, Images, Documents up to 100MB
                  </p>
                </div>

                {/* Background decoration */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-violet-500/5 blur-xl" />
                  <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-pink-500/5 blur-xl" />
                </div>
              </motion.div>

              {/* Options */}
              <div className="space-y-4 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Shield size={16} className="text-violet-400" />
                  Sharing Options
                </h3>

                {/* Password Protection */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${enablePassword ? 'bg-violet-500/10' : 'bg-white/5'}`}>
                      <Lock size={16} className={enablePassword ? 'text-violet-400' : 'text-white/40'} />
                    </div>
                    <div>
                      <p className="text-sm text-white/80">Password Protection</p>
                      <p className="text-xs text-white/40">Require password to download</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEnablePassword(!enablePassword)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${enablePassword ? 'bg-violet-500' : 'bg-white/10'
                      }`}
                  >
                    <motion.div
                      animate={{ x: enablePassword ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white"
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {enablePassword && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-violet-500/30"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expiry */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5">
                      <Clock size={16} className="text-white/40" />
                    </div>
                    <div>
                      <p className="text-sm text-white/80">Auto Expire</p>
                      <p className="text-xs text-white/40">Link expires after</p>
                    </div>
                  </div>
                  <select
                    value={expiryDays || ''}
                    onChange={(e) => setExpiryDays(e.target.value ? parseInt(e.target.value) : null)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none"
                  >
                    <option value="">Never</option>
                    <option value="1">1 day</option>
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Result / Preview */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {selectedFile ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    {/* Success Card */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                          <Sparkles size={24} className="text-violet-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">File Ready!</h3>
                          <p className="text-sm text-white/50">Your file is uploaded and ready to share</p>
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 mb-4">
                        {(() => {
                          const Icon = getFileIcon(selectedFile.type);
                          return (
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                              <Icon size={20} className="text-white/60" />
                            </div>
                          );
                        })()}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white/80 truncate">{selectedFile.originalName}</p>
                          <p className="text-xs text-white/40">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>

                      {/* Direct Download Button */}
                      <a
                        href={selectedFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => downloadFile(selectedFile)}
                        className="flex items-center justify-center gap-2 w-full py-3 mb-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                      >
                        <Download size={18} />
                        <span className="font-medium">Download File</span>
                      </a>

                      {/* Short Link */}
                      <div className="space-y-2 mb-4">
                        <label className="text-xs text-white/40 uppercase tracking-wider">Direct Link (Copy to share)</label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 overflow-hidden">
                            <Link2 size={16} className="text-violet-400 shrink-0" />
                            <span className="text-sm text-white/60 truncate">{selectedFile.url}</span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => copyToClipboard(selectedFile.url)}
                            className="px-4 py-3 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 hover:bg-violet-500/30 transition-all"
                            title="Copy direct link"
                          >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                          </motion.button>
                        </div>
                      </div>

                      {/* QR Toggle */}
                      <button
                        onClick={() => setShowQR(!showQR)}
                        className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm text-white/70"
                      >
                        <QrCode size={18} />
                        {showQR ? 'Hide QR Code' : 'Show QR Code'}
                      </button>

                      {/* QR Code */}
                      <AnimatePresence>
                        {showQR && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 p-6 rounded-xl bg-white flex flex-col items-center">
                              <QRCodeSVG
                                value={selectedFile.url}
                                size={200}
                                level="H"
                                includeMargin={true}
                                imageSettings={{
                                  src: "https://ucarecdn.com/favicon.ico",
                                  x: undefined,
                                  y: undefined,
                                  height: 24,
                                  width: 24,
                                  excavate: true,
                                }}
                              />
                              <p className="mt-3 text-xs text-slate-500">Scan to download</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] border-dashed"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                      <Link2 size={28} className="text-white/20" />
                    </div>
                    <p className="text-white/40 text-center">Upload a file to generate a shareable link and QR code</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="myfiles"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <History size={32} className="text-white/20" />
                </div>
                <p className="text-lg font-medium text-white/60 mb-2">No files shared yet</p>
                <p className="text-sm text-white/40">Upload your first file to get started</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="mt-6 px-6 py-3 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 hover:bg-violet-500/30 transition-all"
                >
                  Upload File
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-violet-500/30 hover:bg-white/[0.05] transition-all"
                  >
                    {/* File Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const Icon = getFileIcon(file.type);
                          return (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
                              <Icon size={24} className="text-violet-400" />
                            </div>
                          );
                        })()}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white/80 truncate">{file.originalName}</p>
                          <p className="text-xs text-white/40">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => downloadFile(file)}
                          className="p-2 rounded-lg hover:bg-emerald-500/10 text-white/40 hover:text-emerald-400"
                          title="Download"
                        >
                          <Download size={16} />
                        </a>
                        <button
                          onClick={() => copyToClipboard(file.url)}
                          className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white"
                          title="Copy link"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Link */}
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => downloadFile(file)}
                      className="flex items-center gap-2 p-3 rounded-xl bg-white/5 mb-4 hover:bg-white/10 transition-colors group/link"
                    >
                      <Link2 size={14} className="text-violet-400 shrink-0" />
                      <span className="text-sm text-white/60 truncate flex-1">Click to download</span>
                      <ExternalLink size={14} className="text-white/20 group-hover/link:text-white/40 shrink-0" />
                      {file.isPasswordProtected && <Lock size={14} className="text-amber-400 shrink-0" />}
                    </a>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Download size={12} />
                          {file.downloads}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(file.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(file);
                          setShowQR(false);
                          setActiveTab('upload');
                        }}
                        className="text-violet-400 hover:text-violet-300"
                      >
                        View
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {[
          { icon: Zap, title: 'Lightning Fast', desc: 'Upload and share in seconds' },
          { icon: Shield, title: 'Secure', desc: 'Optional password protection' },
          { icon: QrCode, title: 'QR Codes', desc: 'Easy mobile downloads' },
        ].map((feature) => (
          <div key={feature.title} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <feature.icon size={24} className="text-violet-400" />
            </div>
            <div>
              <p className="font-medium text-white/80">{feature.title}</p>
              <p className="text-xs text-white/40">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
