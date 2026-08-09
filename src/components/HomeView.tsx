import React from "react";
import { ScanItem } from "../types";
import { LandingPage } from "./LandingPage";

interface HomeViewProps {
  onAnalyzeImage: (fileOrBase64: string, name?: string, customPrompt?: string) => void;
  recentScans: ScanItem[];
  onSelectScan: (scan: ScanItem) => void;
  isAnalyzing: boolean;
  analyzingStep: number;
  onViewAllHistory: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onAnalyzeImage,
  recentScans,
  onSelectScan,
  isAnalyzing,
  onViewAllHistory,
}) => {
  return (
    <LandingPage
      onAnalyzeImage={onAnalyzeImage}
      recentScans={recentScans}
      onSelectScan={onSelectScan}
      isAnalyzing={isAnalyzing}
      onViewAllHistory={onViewAllHistory}
    />
  );
};

