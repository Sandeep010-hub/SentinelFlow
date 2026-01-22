
import React from 'react';

export const Logo = ({ className = "w-6 h-6" }: { className?: string }) => (
    <div className={`relative flex items-center justify-center ${className}`}>
        <div className="absolute inset-0 bg-emerald-500 rounded-full blur-sm opacity-50 animate-pulse"></div>
        <div className="relative z-10 font-bold font-mono text-emerald-500 flex items-center justify-center border-2 border-emerald-500 rounded-lg w-full h-full bg-black/50 backdrop-blur-sm">
            SF
        </div>
    </div>
);
