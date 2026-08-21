'use client';

import * as React from 'react';
import { X, ArrowDownCircle, CheckCircle, XCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UploadCardProps {
  status: 'uploading' | 'success' | 'error';
  progress?: number; 
  title: string;
  description: string;
  primaryButtonText: string;
  onPrimaryButtonClick?: () => void;
  secondaryButtonText?: string;
  onSecondaryButtonClick?: () => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  status,
  progress,
  title,
  description,
  primaryButtonText,
  onPrimaryButtonClick,
  secondaryButtonText,
  onSecondaryButtonClick,
}) => {
  const renderIcon = () => {
    switch (status) {
      case 'uploading':
        return <ArrowDownCircle className="w-12 h-12 text-zinc-400 mb-4" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-zinc-100 mb-4" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-400 mb-4" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn(
        "relative flex flex-col items-center text-center p-6 rounded-2xl border bg-white/[0.03] backdrop-blur-xl transition-all duration-300 w-full max-w-sm",
        status === 'uploading' && "border-zinc-700/50",
        status === 'success' && "border-zinc-500/50",
        status === 'error' && "border-red-500/30 bg-red-500/5"
    )}>
      <button className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex flex-col items-center w-full mt-2">
        {renderIcon()}
        
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{description}</p>
        
        {status === 'uploading' && (
          <div className="w-full space-y-4">
            <div className="w-full">
              <div className="flex justify-between text-xs font-medium text-zinc-400 mb-2">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-zinc-200 transition-all duration-300 rounded-full" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
            
            <button 
              onClick={onPrimaryButtonClick}
              className="w-full py-2.5 rounded-lg text-sm font-medium border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              {primaryButtonText}
            </button>
          </div>
        )}
      </div>
      
      {(status === 'success' || status === 'error') && (
        <div className="w-full flex gap-3 mt-2">
          <button 
            onClick={onPrimaryButtonClick}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors",
              status === 'success' ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-800 text-white hover:bg-zinc-700"
            )}
          >
            {primaryButtonText}
          </button>
          {secondaryButtonText && (
            <button 
              onClick={onSecondaryButtonClick}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              {secondaryButtonText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
