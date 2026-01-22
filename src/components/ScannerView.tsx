"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, Fingerprint, Activity, Terminal } from "lucide-react";

interface ScannerViewProps {
    onScanComplete?: () => void;
    similarityScore?: number;
    isDuplicate?: boolean;
    matchedProjectTitle?: string;
    fileName?: string;
}

const STEPS = [
    "Initializing Lidar Scan...",
    "Extracting Keywords...",
    "Analyzing Abstracts...",
    "Evaluating Architecture...",
    "Comparing Digital DNA...",
    "Finalizing Report..."
];

export default function ScannerView({ similarityScore = 0, isDuplicate = false, matchedProjectTitle = "", fileName = "Project.pdf", onScanComplete }: ScannerViewProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        if (completed) return;

        // Custom steps including the filename
        const dynamicSteps = [
            `Analyzing [${fileName}]...`,
            ...STEPS.slice(1)
        ];

        const interval = setInterval(() => {
            if (currentStep < dynamicSteps.length) {
                setLogs(prev => [...prev, dynamicSteps[currentStep]]);
                setCurrentStep(prev => prev + 1);
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    setCompleted(true);
                    onScanComplete?.();
                }, 1000);
            }
        }, 800); // 800ms per step

        return () => clearInterval(interval);
    }, [currentStep, completed, onScanComplete, fileName]);

    // Status Color Logic
    const statusColor = completed
        ? isDuplicate
            ? "text-red-500"
            : "text-emerald-500"
        : "text-emerald-500";

    const borderColor = completed
        ? isDuplicate
            ? "border-red-500/50"
            : "border-emerald-500/50"
        : "border-emerald-500/30";

    return (
        <div className="relative w-full h-[600px] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col lg:flex-row p-4 md:p-8 gap-8">
            {/* Background Grid */}
            <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: `linear-gradient(to right, #3f3f46 1px, transparent 1px), linear-gradient(to bottom, #3f3f46 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Radial Vignette */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-zinc-950/80 pointer-events-none" />

            {/* Main Scanner / Result Area */}
            <div className="z-10 w-full lg:w-2/3 flex flex-col items-center gap-8 min-h-[300px] justify-center">

                {!completed ? (
                    /* ACTIVE SCANNING STATE */
                    <div className="relative w-full aspect-video border border-zinc-800 bg-black/50 rounded-lg overflow-hidden backdrop-blur-sm">
                        {/* Scanning Grid Textures */}
                        <div className="absolute inset-0 opacity-30 flex items-center justify-center">
                            <Fingerprint className="w-48 h-48 md:w-64 md:h-64 text-emerald-900/40 animate-pulse" />
                        </div>

                        {/* Laser Sweep Line */}
                        <motion.div
                            className="absolute top-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] z-20"
                            initial={{ top: "0%" }}
                            animate={{ top: "100%" }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                                repeatType: "reverse"
                            }}
                        />

                        {/* Scanning Overlay Text */}
                        <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-mono text-emerald-500/70">
                            <Activity className="w-3 h-3 animate-spin" />
                            SCANNING_ACTIVE
                        </div>
                    </div>
                ) : (
                    /* RESULT REVEAL CARD */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={`w-full p-6 md:p-8 rounded-lg border-2 ${borderColor} bg-zinc-900/90 backdrop-blur-xl flex flex-col items-center gap-6`}
                    >
                        <div className="flex flex-col items-center gap-2 text-center">
                            {isDuplicate ? (
                                <ShieldAlert className="w-16 h-16 text-red-500 mb-2" />
                            ) : (
                                <ShieldCheck className="w-16 h-16 text-emerald-500 mb-2" />
                            )}

                            <h2 className="text-xl md:text-2xl font-bold text-white tracking-widest uppercase">
                                Security Clearance: {isDuplicate ? "DENIED" : "GRANTED"}
                            </h2>

                            <div className={`text-xs md:text-sm font-mono tracking-widest px-3 py-1 rounded-full border ${isDuplicate ? "border-red-900 bg-red-950/30 text-red-400" : "border-emerald-900 bg-emerald-950/30 text-emerald-400"}`}>
                                STATUS: {isDuplicate ? "DUPLICATE DETECTED" : "UNIQUE PROJECT"}
                            </div>
                        </div>

                        <div className="w-full h-px bg-zinc-800" />

                        <div className="flex justify-between w-full font-mono text-xs md:text-sm px-4 md:px-8">
                            <div className="flex flex-col items-center">
                                <span className="text-zinc-500 mb-1">SIMILARITY</span>
                                <span className={`text-xl md:text-2xl font-bold ${isDuplicate ? "text-red-400" : "text-emerald-400"}`}>
                                    {(similarityScore * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-px h-12 bg-zinc-800" />
                            <div className="flex flex-col items-center">
                                <span className="text-zinc-500 mb-1">TIME</span>
                                <span className="text-xl md:text-2xl font-bold text-white">0.84s</span>
                            </div>
                        </div>

                        {/* Recommendation Box */}
                        {similarityScore > 0.5 && (
                            <div className="w-full mt-2 p-4 rounded bg-zinc-950/50 border border-zinc-800 text-xs md:text-sm font-mono text-zinc-400">
                                <strong className="text-emerald-500 block mb-1">RECOMMENDATION:</strong>
                                <p>
                                    This project is too similar to <span className="text-white">"{matchedProjectTitle || 'Unknown Project'}"</span>.
                                    We suggest focusing on <span className="text-white">unique architectural patterns</span> or <span className="text-white">novel datasets</span> to improve innovation score.
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Digital DNA Log - Sidebar on Desktop, Bottom on Mobile */}
            <div className="z-10 w-full lg:w-1/3 h-full border-t lg:border-t-0 lg:border-l border-zinc-800 pt-6 lg:pt-0 lg:pl-6 flex flex-col">
                <div className="w-full font-mono text-xs h-full">
                    <div className="flex items-center gap-2 text-zinc-500 mb-4 pb-2 border-b border-zinc-800">
                        <Terminal className="w-4 h-4" />
                        <span>SYSTEM_LOGS</span>
                    </div>
                    <div className="flex flex-col gap-2 h-48 lg:h-[400px] overflow-y-auto mask-linear-gradient-to-t scrollbar-hide">
                        <AnimatePresence>
                            {logs.map((log, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-emerald-500/80 font-mono text-xs"
                                >
                                    {`> [${new Date().toLocaleTimeString()}] ${log}`}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {completed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-white font-mono text-xs"
                            >
                                {`> [${new Date().toLocaleTimeString()}] PROCESS_COMPLETE`}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
