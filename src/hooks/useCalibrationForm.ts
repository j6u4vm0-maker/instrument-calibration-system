"use client";

import { useState, useEffect } from "react";
import { getDefaultInspectorAction } from "@/app/actions/org-actions";

interface UseCalibrationFormProps {
  gageInfo: {
    id: string;
    calPoints: string;
    acceptanceStandard?: any;
  };
  initialData?: any;
}

export function useCalibrationForm({ gageInfo, initialData }: UseCalibrationFormProps) {
  const [calDate, setCalDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspector, setInspector] = useState("");
  const [notes, setNotes] = useState("");
  
  const [temperature, setTemperature] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('daily_temp') || "20";
    return "20";
  });
  const [humidity, setHumidity] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('daily_humidity') || "50";
    return "50";
  });
  
  const [selectedMasterIds, setSelectedMasterIds] = useState<string[]>([]);
  const [details, setDetails] = useState<any[]>([]);

  useEffect(() => {
    if (initialData?.details && initialData.details.length > 0) {
      setDetails(initialData.details);
      if (initialData.calDate) {
        setCalDate(new Date(initialData.calDate).toISOString().split('T')[0]);
      }
      setInspector(initialData.inspector || "");
      let initialNotes = initialData.notes || "";
      
      const envMatch = initialNotes.match(/\[Env:\s*T=([^C]+)C,\s*H=([^%]+)%\]/);
      if (envMatch) {
        setTemperature(envMatch[1].trim());
        setHumidity(envMatch[2].trim());
        initialNotes = initialNotes.replace(/\[Env:.*?\]\s*/, '');
      }

      const mastersMatch = initialNotes.match(/\[Masters:\s*(.*?)\]/);
      if (mastersMatch) {
        const mastersStr = mastersMatch[1].trim();
        if (mastersStr) {
          setSelectedMasterIds(mastersStr.split(',').map((s: string) => s.trim()));
        }
        initialNotes = initialNotes.replace(/\[Masters:.*?\]\s*/, '');
      }

      setNotes(initialNotes.trim());
      
    } else {
      let initialDetails: any[] = [];
      try {
        const parsed = JSON.parse(gageInfo.calPoints);
        if (Array.isArray(parsed)) {
          initialDetails = parsed.map(p => ({
            category: p.category || p.type || "",
            point: p.point || "",
            lowerLimit: p.lowerLimit ?? "",
            upperLimit: p.upperLimit ?? "",
            actual: "",
            error: 0,
            result: "PASS"
          }));
        }
      } catch (e) {
        const tokens = (gageInfo.calPoints || "").split(/[,，\s]+/).filter(p => p.trim() !== "");
        let currentCategory = "";
        for (const token of tokens) {
          if (token.endsWith(":") || token.endsWith("：")) {
            currentCategory = token.slice(0, -1).trim();
          } else if (token.includes(":") || token.includes("：")) {
            const parts = token.split(/[:：]/);
            initialDetails.push({
              category: parts[0].trim(),
              point: parts[1].trim(),
              lowerLimit: "",
              upperLimit: "",
              actual: "",
              error: 0,
              result: "PASS"
            });
          } else {
            initialDetails.push({
              category: currentCategory,
              point: token,
              lowerLimit: "",
              upperLimit: "",
              actual: "",
              error: 0,
              result: "PASS"
            });
          }
        }
        if (initialDetails.length === 0) {
          initialDetails.push({
            category: "",
            point: "",
            lowerLimit: "",
            upperLimit: "",
            actual: "",
            error: 0,
            result: "PASS"
          });
        }
      }

      // Calculate initial limits if acceptanceStandard is provided
      if (gageInfo.acceptanceStandard?.criteria) {
        initialDetails = initialDetails.map(d => {
          const pointNum = parseFloat(d.point);
          if (!isNaN(pointNum) && !d.lowerLimit && !d.upperLimit) {
            const criterion = gageInfo.acceptanceStandard.criteria.find((c: any) => {
              const matchesCategory = !c.category || !d.category || c.category === d.category;
              const start = c.rangeStart ?? -Infinity;
              const end = c.rangeEnd ?? Infinity;
              return matchesCategory && pointNum >= start && pointNum <= end;
            });
            if (criterion) {
              return {
                ...d,
                category: d.category || criterion.category || "",
                lowerLimit: (pointNum - Math.abs(criterion.toleranceMinus)).toFixed(4),
                upperLimit: (pointNum + Math.abs(criterion.tolerancePlus)).toFixed(4)
              };
            }
          }
          return d;
        });
      }

      setDetails(initialDetails);
    }
  }, [gageInfo, initialData]);
  
  useEffect(() => {
    if (!inspector) {
      getDefaultInspectorAction().then(insp => {
        if (insp) setInspector(insp.name);
      });
    }
  }, [inspector]);

  const calculateResult = (actual: string, lower: string, upper: string) => {
    const act = parseFloat(actual);
    const low = parseFloat(lower);
    const up = parseFloat(upper);
    if (isNaN(act)) return "PASS";
    let pass = true;
    if (!isNaN(low) && act < low) pass = false;
    if (!isNaN(up) && act > up) pass = false;
    return pass ? "PASS" : "FAIL";
  };

  const handleRowChange = (index: number, field: string, val: string) => {
    const newDetails = [...details];
    newDetails[index][field] = val;

    if (field === 'point' || field === 'actual' || field === 'category') {
      const actualNum = parseFloat(newDetails[index].actual);
      const pointNum = parseFloat(newDetails[index].point);
      
      if (!isNaN(actualNum) && !isNaN(pointNum)) {
        newDetails[index].error = parseFloat((actualNum - pointNum).toFixed(4));
      } else {
        newDetails[index].error = 0;
      }

      if (!isNaN(pointNum) && gageInfo.acceptanceStandard?.criteria) {
        const criterion = gageInfo.acceptanceStandard.criteria.find((c: any) => {
          const matchesCategory = !c.category || !newDetails[index].category || c.category === newDetails[index].category;
          const start = c.rangeStart ?? -Infinity;
          const end = c.rangeEnd ?? Infinity;
          return matchesCategory && pointNum >= start && pointNum <= end;
        });

        if (criterion) {
          if (!newDetails[index].category && criterion.category) {
            newDetails[index].category = criterion.category;
          }
          newDetails[index].lowerLimit = (pointNum - Math.abs(criterion.toleranceMinus)).toFixed(4);
          newDetails[index].upperLimit = (pointNum + Math.abs(criterion.tolerancePlus)).toFixed(4);
        } else {
          newDetails[index].lowerLimit = "";
          newDetails[index].upperLimit = "";
        }
      }
    }

    newDetails[index].result = calculateResult(
      newDetails[index].actual,
      newDetails[index].lowerLimit,
      newDetails[index].upperLimit
    );
    setDetails(newDetails);
  };

  const addRow = () => {
    setDetails([...details, { category: "", point: "", lowerLimit: "", upperLimit: "", actual: "", error: 0, result: "PASS" }]);
  };

  const removeRow = (index: number) => {
    if (details.length <= 1) return;
    setDetails(details.filter((_, i) => i !== index));
  };

  return {
    calDate, setCalDate,
    inspector, setInspector,
    notes, setNotes,
    temperature, setTemperature,
    humidity, setHumidity,
    selectedMasterIds, setSelectedMasterIds,
    details, setDetails,
    handleRowChange, addRow, removeRow
  };
}
