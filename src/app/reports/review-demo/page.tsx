'use client';

import React from 'react';
import ReviewWorkbench from '@/modules/review-management/components/ReviewWorkbench';

export default function ReviewDemoPage() {
  // Mock Data for Demo
  const mockReport = {
    id: "rec-12345",
    certificateNo: "KST-2026-0514-001",
    calDate: new Date(),
    nextCalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    gage: {
      id: "KST-VC-001",
      name: "游標卡尺",
      spec: "0-150mm / 0.01mm",
      precision: "±0.02mm",
      location: "Chennai Factory"
    },
    environment: {
      temperature: "22.5",
      humidity: "52"
    },
    masterGages: [
      { id: "STD-BLK-01", name: "塊規組 (Grade 0)" },
      { id: "STD-MIC-05", name: "標準外徑千分尺" }
    ],
    details: [
      { id: "1", category: "外徑 (OD)", point: "0 mm", standard: 0.00, actual: 0.00, error: 0.00, result: "PASS" },
      { id: "2", category: "外徑 (OD)", point: "50 mm", standard: 50.00, actual: 50.01, error: 0.01, result: "PASS" },
      { id: "3", category: "外徑 (OD)", point: "100 mm", standard: 100.00, actual: 100.02, error: 0.02, result: "PASS" },
      { id: "4", category: "內徑 (ID)", point: "10 mm", standard: 10.00, actual: 9.99, error: -0.01, result: "PASS" },
      { id: "5", category: "深徑 (Depth)", point: "20 mm", standard: 20.00, actual: 20.00, error: 0.00, result: "PASS" },
    ],
    result: "PASS" as const,
    inspector: "Chen Xiao Ming",
    reviewer: "Lee Da Long",
    status: "PENDING"
  };

  return <ReviewWorkbench data={mockReport} />;
}
