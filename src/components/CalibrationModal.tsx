"use client";

import { useState, useEffect } from "react";
import { Plus, X, ClipboardList, CheckCircle2, XCircle, Send, Save, Search } from "lucide-react";
import { addCalibrationRecordAction, updateCalibrationRecordAction, getMasterGagesAction, getLatestDraftAction } from "@/app/actions/gage-actions";
import { uploadReportAction } from "@/app/actions/upload-actions";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useRouter } from "next/navigation";
import InternalCalibrationForm from "./InternalCalibrationForm";

interface CalibrationModalProps {
  gageId: string;
  calPoints: string;
  acceptance: string;
  calibrationCycle: number; // 月份
  acceptanceStandard?: any;
  vendors?: any[];
  lastCalInfo?: {
    lastVendor: string;
    lastCost: number;
    lastDate?: Date;
  };
  isEdit?: boolean;
  editData?: any;
  onClose?: () => void;
  isOpenExternal?: boolean;
  gageName?: string;
  gageSpec?: string;
  isCalibrating?: boolean;
}

export default function CalibrationModal({ 
  gageId, 
  calPoints, 
  acceptance, 
  calibrationCycle,
  acceptanceStandard,
  vendors = [], 
  lastCalInfo,
  isEdit = false,
  editData,
  onClose,
  isOpenExternal,
  gageName,
  gageSpec,
  isCalibrating
}: CalibrationModalProps) {
  const { t, role } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(isOpenExternal || false);
  const [masterGages, setMasterGages] = useState<any[]>([]);
  const [localIsEdit, setLocalIsEdit] = useState(isEdit);
  const [localEditData, setLocalEditData] = useState(editData);

  const isReadOnly = localIsEdit && localEditData?.status === 'APPROVED' && role !== 'admin';

  useEffect(() => {
    if (isOpenExternal !== undefined) setIsOpen(isOpenExternal);
  }, [isOpenExternal]);

  useEffect(() => {
    setLocalIsEdit(isEdit);
    setLocalEditData(editData);
  }, [isEdit, editData]);

  useEffect(() => {
    if (isOpen) {
      getMasterGagesAction().then(setMasterGages);

      // Auto-resume draft feature when opened externally or internally
      if (!isEdit && !localIsEdit) {
        getLatestDraftAction(gageId).then(draft => {
          if (draft) {
            if (confirm("發現一份尚未完成的草稿，是否繼續編輯？\n(按確定繼續編輯，按取消則捨棄舊草稿開啟全新報告)")) {
              setLocalIsEdit(true);
              setLocalEditData(draft);
            } else {
              import('@/app/actions/gage-actions').then(m => m.deleteDraftAction(draft.id));
            }
          }
        });
      }
    }
  }, [isOpen, isEdit, localIsEdit, gageId]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleOpen = () => {
    if (isCalibrating && !isEdit) {
      if (!confirm(t('calibration.cal.is_calibrating_alert') || "此設備目前已有一份正在處理/審核中的報告，確認要再新增一份新的歷程嗎？")) {
        return;
      }
    }
    setIsOpen(true);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportType, setReportType] = useState('INTERNAL');
  
  // 日期處理
  const [calDate, setCalDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentCycle, setCurrentCycle] = useState(calibrationCycle);
  const [nextCalDate, setNextCalDate] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  // 當校正日期或週期改變時，自動計算下次校正日期
  useEffect(() => {
    if (localIsEdit && localEditData) {
      setReportType(localEditData.reportType || 'INTERNAL');
      setCalDate(new Date(localEditData.calDate).toISOString().split('T')[0]);
      setAttachmentUrl(localEditData.attachmentUrl || "");
      setCurrentCycle(localEditData.calibrationCycle || calibrationCycle);
    }
  }, [localIsEdit, localEditData, calibrationCycle]);

  useEffect(() => {
    if (calDate && currentCycle) {
      const date = new Date(calDate);
      date.setMonth(date.getMonth() + currentCycle);
      setNextCalDate(date.toISOString().split('T')[0]);
    }
  }, [calDate, currentCycle]);

  const handleInternalSubmit = async (data: any, status: string) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("gageId", gageId);
      formData.set("calDate", data.calDate);
      formData.set("result", data.result);
      formData.set("inspector", data.inspector);
      formData.set("reportType", 'INTERNAL');
      formData.set("notes", data.notes);
      formData.set("status", status);
      formData.set("details", JSON.stringify(data.details));
      formData.set("calibrationCycle", currentCycle.toString());
      formData.set("nextCalDate", nextCalDate);

      if (localIsEdit && localEditData) {
        await updateCalibrationRecordAction(localEditData.id, {
          ...data,
          status,
          calibrationCycle: currentCycle,
          nextCalDate
        });
      } else {
        await addCalibrationRecordAction(formData);
      }
      
      if (status === 'DRAFT') {
        alert("草稿已成功儲存！");
      }

      router.refresh();
      handleClose();
    } catch (error) {
      alert((t('calibration.cal.import_failed') || "Submission failed") + ": " + (error instanceof Error ? error.message : "unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExternalSubmit = async (e: React.FormEvent<HTMLFormElement>, status: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    formData.set("gageId", gageId);
    formData.set("status", status);
    formData.set("nextCalDate", nextCalDate);
    formData.set("attachmentUrl", attachmentUrl);
    formData.set("reportType", "EXTERNAL");
    formData.set("calibrationCycle", currentCycle.toString());

    if (formData.get("result") === "FAIL") {
      const proceed = confirm(t('calibration.cal.ng_alert') || "⚠️ 提醒：此份報告判定為 FAIL (NG)！\n請確認數值是否正確，或是準備後續異常處理。是否確定要繼續送出？");
      if (!proceed) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (localIsEdit && localEditData) {
        await updateCalibrationRecordAction(localEditData.id, Object.fromEntries(formData));
      } else {
        await addCalibrationRecordAction(formData);
      }
      if (status === 'DRAFT') {
        alert("草稿已成功儲存！");
      }
      router.refresh();
      handleClose();
    } catch (error) {
      alert("Submission failed: " + (error instanceof Error ? error.message : "unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={handleOpen}
        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-kst-blue text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 whitespace-nowrap min-w-[110px]"
      >
        <Plus className="w-3.5 h-3.5" /> {t('calibration.cal.start_calibration')}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh]">
        <header className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-kst-blue flex-shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">{localIsEdit ? t('calibration.cal.edit_report') : t('calibration.cal.new_report')}</h2>
              <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">
                {gageId} {gageName ? `| ${gageName}` : ''} 
                <span className="ml-2 text-red-500">[{role} / {localEditData?.status}]</span>
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          {/* Header Action Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mb-8">
            <button
              onClick={() => setReportType('INTERNAL')}
              disabled={isReadOnly}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                reportType === 'INTERNAL' 
                  ? 'bg-white text-kst-blue shadow-md' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              {t('calibration.cal.internal_report')}
            </button>
            <button
              onClick={() => setReportType('EXTERNAL')}
              disabled={isReadOnly}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                reportType === 'EXTERNAL' 
                  ? 'bg-white text-kst-blue shadow-md' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              {t('calibration.cal.external_report')}
            </button>
          </div>

          {reportType === 'INTERNAL' ? (
            <InternalCalibrationForm 
              gageInfo={{
                id: gageId,
                name: gageName || "",
                spec: gageSpec,
                calPoints,
                acceptanceStandard
              }}
              masterGages={masterGages}
              isSubmitting={isSubmitting}
              initialData={localIsEdit ? localEditData : null}
              onSubmit={handleInternalSubmit}
              onCancel={handleClose}
              isReadOnly={isReadOnly}
            />
          ) : (
            <form onSubmit={(e) => handleExternalSubmit(e, 'PENDING')} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <fieldset disabled={isReadOnly} className="space-y-8 min-w-0 border-0 p-0 m-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('calibration.cal.report_date')}</label>
                  <input 
                    required 
                    type="date" 
                    name="calDate" 
                    value={calDate}
                    onChange={(e) => setCalDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-kst-blue/5 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('calibration.cal.inspector_label')}</label>
                  <input 
                    required 
                    type="text" 
                    name="inspector" 
                    defaultValue={editData?.inspector || ""}
                    placeholder="Technician Name"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-kst-blue/5 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('calibration.cal.next_cal_date_est')}</label>
                  <input 
                    readOnly 
                    type="date" 
                    value={nextCalDate}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-kst-blue outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('calibration.batch.vendor')}</label>
                  <select 
                    name="vendorId" 
                    defaultValue={editData?.vendorId || ""}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-kst-blue/5 outline-none"
                  >
                    <option value="">-- {t('calibration.cal.select_vendor_alert')} --</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('calibration.batch.cost')}</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      name="cost" 
                      defaultValue={editData?.cost || 0}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-kst-blue/5 outline-none"
                    />
                    {lastCalInfo && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold italic">
                        Last: {lastCalInfo.lastVendor} (${lastCalInfo.lastCost})
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('calibration.cal.col_status')}</label>
                  <select 
                    name="result" 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-kst-blue/5 outline-none font-bold"
                  >
                    <option value="PASS">{t('common.status.pass')} (PASS)</option>
                    <option value="FAIL">FAIL</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('calibration.cal.cert_no_optional')}</label>
                  <input 
                    type="text" 
                    name="certificateNo" 
                    defaultValue={editData?.certificateNo || ""}
                    placeholder="CAL-2024-XXXX"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-kst-blue/5 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('calibration.cal.attachment_pdf_img')}</label>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      readOnly
                      value={attachmentUrl}
                      placeholder={t('common.common.no_file_selected')}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400 italic outline-none"
                    />
                    {attachmentUrl && (
                      <button 
                        type="button"
                        onClick={() => setAttachmentUrl("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <label className="cursor-pointer px-6 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all flex items-center gap-2">
                    <Search className="w-4 h-4" /> {t('common.common.browse_local')}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,application/pdf"
                      disabled={isReadOnly}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append("file", file);
                          const url = await uploadReportAction(formData);
                          if (url) setAttachmentUrl(url);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('quality.vendor.notes')}</label>
                <textarea 
                  name="notes" 
                  rows={3}
                  defaultValue={editData?.notes || ""}
                  placeholder="..."
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-kst-blue/5 outline-none transition-all resize-none disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
              </fieldset>

              <footer className="pt-6 flex gap-4 border-t border-slate-50">
                <button 
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  {isReadOnly ? t('common.common.close') || '關閉' : t('common.common.cancel')}
                </button>
                {!isReadOnly && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget.closest('form');
                        if (form && form.reportValidity()) {
                          handleExternalSubmit({ ...e, currentTarget: form } as any, 'DRAFT');
                        }
                      }}
                      className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" /> {t('calibration.cal.status_draft')}
                    </button>
                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="flex-[2] px-6 py-4 bg-kst-blue text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
                    >
                      {isSubmitting ? t('calibration.cal.processing') : (
                        <>
                          <Send className="w-5 h-5" /> {t('calibration.cal.submit_review')}
                        </>
                      )}
                    </button>
                  </>
                )}
              </footer>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
