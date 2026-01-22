"use client";

import { useState } from "react";
import { UploadCloud, FileCode2, Shield } from "lucide-react";
import ScannerView from "@/components/ScannerView";
import { Logo } from "@/components/Logo";
import { calculateCosineSimilarity } from "@/lib/similarity";
import { supabase } from "@/lib/supabaseClient";
import { parseFile } from "@/app/actions/parse-file";

export default function Home() {
  const [isScanning, setIsScanning] = useState(false);
  const [similarity, setSimilarity] = useState(0);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [matchedTitle, setMatchedTitle] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Setup Scanning State
    setFileName(file.name);
    setIsScanning(true);

    // Reset previous results
    setSimilarity(0);
    setIsDuplicate(false);
    setMatchedTitle("");

    try {
      // 2. Parse File
      const formData = new FormData();
      formData.append("file", file);

      const { text, error } = await parseFile(formData);

      if (error || !text) {
        console.error("Parse error:", error);
        // In a real app, handle error UI here
        return;
      }

      // 3. Fetch all existing projects from Supabase
      const { data: projects, error: dbError } = await supabase
        .from('projects')
        .select('title, abstract');

      if (dbError) {
        console.error("Error fetching projects:", dbError);
        return;
      }

      if (!projects || projects.length === 0) {
        return;
      }

      // 4. Compare extracted text against all fetched abstracts
      let maxSimilarity = 0;
      let currentMatchedTitle = "";

      for (const project of projects) {
        if (project.abstract) {
          const score = calculateCosineSimilarity(text, project.abstract);
          if (score > maxSimilarity) {
            maxSimilarity = score;
            currentMatchedTitle = project.title;
          }
        }
      }

      // 5. Update State with Results
      setSimilarity(maxSimilarity);
      setIsDuplicate(maxSimilarity > 0.6); // Threshold for duplication
      setMatchedTitle(currentMatchedTitle);

    } catch (err) {
      console.error("Unexpected error during scan:", err);
    }
  };

  const handleReset = () => {
    setIsScanning(false);
    setSimilarity(0);
    setIsDuplicate(false);
    setMatchedTitle("");
    setFileName("");
  };

  return (
    <main className="min-h-screen bg-black text-zinc-100 selection:bg-emerald-500/30">

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-zinc-900 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-bold tracking-tight">SentinelFlow</span>
          </div>
          <div className="text-xs font-mono text-zinc-500">
            v1.0.0_STABLE
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-12">

        {/* Hero Text */}
        {!isScanning && (
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              Secure Project Submission
            </h1>
            <p className="text-zinc-400 max-w-lg mx-auto">
              Upload your project abstract or document (.pdf, .docx) for immediate similarity analysis.
            </p>
          </div>
        )}

        {/* Dynamic Zone */}
        <div className="w-full">
          {isScanning ? (
            <div className="flex flex-col gap-8">
              <ScannerView
                isDuplicate={isDuplicate}
                similarityScore={similarity}
                matchedProjectTitle={matchedTitle}
                fileName={fileName}
                onScanComplete={() => { }}
              />
              <button
                onClick={handleReset}
                className="mx-auto text-sm text-zinc-500 hover:text-white underline decoration-zinc-800 underline-offset-4 transition-colors"
              >
                Analyze Another Project
              </button>
            </div>
          ) : (
            <div className="relative group w-full h-[400px]">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 z-50 cursor-pointer"
              />
              <div className="w-full h-full border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-6 group-hover:border-emerald-500/50 group-hover:bg-zinc-900/30 transition-all duration-300">
                <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:scale-110 group-hover:border-emerald-500/50 transition-all duration-300 shadow-2xl">
                  <UploadCloud className="w-10 h-10 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-zinc-300 group-hover:text-white">
                    SentinelFlow Dropzone
                  </h3>
                  <p className="text-sm text-zinc-500 font-mono">
                    Drop .pdf or .docx to scan
                  </p>
                </div>

                {/* Decorative File Icons */}
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <FileCode2 className="w-6 h-6 text-zinc-700 absolute -top-12 -left-16 rotate-12" />
                  <FileCode2 className="w-6 h-6 text-zinc-700 absolute -top-8 left-16 -rotate-12" />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
      <footer className="w-full py-6 text-center text-xs text-zinc-600 font-mono">
        © 2026 SentinelFlow | Final Year B.Tech CSE Project
      </footer>
    </main>
  );
}
