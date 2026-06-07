'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ChevronLeft, 
  Plus, 
  Users, 
  MapPin, 
  Trash2, 
  Edit2, 
  Check,
  X,
  Briefcase,
  UserPlus,
  ArrowRight,
  PlusSquare,
  Star,
  ShieldCheck,
  Award
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import * as Actions from "@/app/actions/org-actions";
import * as XLSX from 'xlsx';
import { useRef } from 'react';

export default function OrganizationPage() {
  const { t } = useLanguage();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshData = async () => {
    const data = await Actions.getAllLocationsAction();
    setLocations(data);
    if (data.length > 0 && !activeLocationId) {
      setActiveLocationId(data[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAddLocation = async () => {
    const name = prompt(t('quality.org.enter_factory_name'));
    if (name) {
      await Actions.createLocationAction(name);
      refreshData();
    }
  };

  const handleEditLocation = async (id: string, currentName: string) => {
    const name = prompt(t('quality.org.enter_factory_name'), currentName);
    if (name && name !== currentName) {
      await Actions.updateLocationAction(id, name);
      refreshData();
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (confirm(t('quality.org.confirm_del_factory'))) {
      await Actions.deleteLocationAction(id);
      setActiveLocationId(null);
      refreshData();
    }
  };

  const handleAddDept = async (locId: string) => {
    const name = prompt(t('quality.org.enter_dept_name'));
    if (name) {
      await Actions.createDepartmentAction(locId, name);
      refreshData();
    }
  };

  const handleEditDept = async (id: string, currentName: string) => {
    const name = prompt(t('quality.org.enter_dept_name'), currentName);
    if (name && name !== currentName) {
      await Actions.updateDepartmentAction(id, name);
      refreshData();
    }
  };

  const handleAddStaff = async (deptId: string) => {
    const name = prompt(t('quality.org.enter_staff_name'));
    if (name) {
      await Actions.createStaffAction(deptId, name);
      refreshData();
    }
  };

  const handleEditStaff = async (id: string, currentName: string) => {
    const name = prompt(t('quality.org.enter_staff_name'), currentName);
    if (name && name !== currentName) {
      await Actions.updateStaffAction(id, { name });
      refreshData();
    }
  };

  const handleExport = () => {
    const flatData: any[] = [];
    locations.forEach(loc => {
      if (loc.departments.length === 0) {
        flatData.push({ '廠區/Location': loc.name, '部門/Department': '', '人員/Staff': '' });
      } else {
        loc.departments.forEach((dept: any) => {
          if (dept.staff.length === 0) {
            flatData.push({ '廠區/Location': loc.name, '部門/Department': dept.name, '人員/Staff': '' });
          } else {
            dept.staff.forEach((staff: any) => {
              flatData.push({ '廠區/Location': loc.name, '部門/Department': dept.name, '人員/Staff': staff.name });
            });
          }
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(flatData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Organization");
    XLSX.writeFile(wb, `Organization_Data_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(ws);

      const parsedData = jsonData.map(row => ({
        location: row['廠區/Location'] || row['廠區'] || row['Location'] || '',
        department: row['部門/Department'] || row['部門'] || row['Department'] || '',
        staff: row['人員/Staff'] || row['人員'] || row['Staff'] || ''
      })).filter(row => row.location);

      if (parsedData.length === 0) {
        alert(t('common.common.invalid_file') || "Invalid file format or empty data.");
        return;
      }

      const res = await Actions.importOrganizationAction(parsedData);
      alert(`Import Successful!\nLocations: ${res.importedLocs}, Departments: ${res.importedDepts}, Staff: ${res.importedStaffs}`);
      refreshData();
    } catch (error) {
      console.error(error);
      alert(t('common.common.error_occurred') || "Error parsing file");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const activeLocation = locations.find(l => l.id === activeLocationId);

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 min-h-screen pb-20">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-kst-blue" />
              {t('quality.org.mgmt')}
            </h1>
            <p className="text-sm text-slate-500">{t('quality.org.desc')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            {isImporting ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4 rotate-90" />}
            <span>{t('common.common.import') || "匯入"}</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowRight className="w-4 h-4 -rotate-90" />
            <span>{t('common.common.export') || "匯出"}</span>
          </button>
          <button 
            onClick={handleAddLocation}
            className="flex items-center gap-2 px-4 py-2 bg-kst-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Plus className="w-4 h-4" />
            <span>{t('quality.org.add_factory')}</span>
          </button>
        </div>
      </header>

      {/* Factories Tab Bar */}
      <div className="flex gap-2 border-b border-slate-100 pb-px overflow-x-auto no-scrollbar">
        {locations.map((loc) => (
          <div key={loc.id} className="relative group">
            <button
              onClick={() => setActiveLocationId(loc.id)}
              className={`px-6 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeLocationId === loc.id 
                  ? 'border-kst-blue text-kst-blue bg-blue-50/50' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              {loc.name}
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-400">
                {loc._count.gages}
              </span>
            </button>
            {activeLocationId === loc.id && (
              <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEditLocation(loc.id, loc.name)}
                  className="p-1 bg-white border border-slate-200 rounded-md shadow-sm text-slate-400 hover:text-kst-blue"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => handleDeleteLocation(loc.id)}
                  className="p-1 bg-white border border-slate-200 rounded-md shadow-sm text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium animate-pulse">Loading Organization Data...</div>
      ) : activeLocation ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeLocation.departments.map((dept: any) => (
            <div key={dept.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col group hover:shadow-md transition-all">
              <header className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-kst-blue/10 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-kst-blue" />
                  </div>
                  <h3 className="font-bold text-slate-800">{dept.name}</h3>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEditDept(dept.id, dept.name)}
                    className="p-1.5 text-slate-300 hover:text-kst-blue rounded-md transition-colors"
                   >
                    <Edit2 className="w-4 h-4" />
                   </button>
                   <button 
                    onClick={async () => {
                      if (confirm(t('quality.org.confirm_del_dept'))) {
                        await Actions.deleteDepartmentAction(dept.id);
                        refreshData();
                      }
                    }}
                    className="p-1.5 text-slate-300 hover:text-red-500 rounded-md transition-colors"
                   >
                    <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </header>
              
              <div className="p-5 flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>{t('quality.org.staff')}</span>
                    <span>{dept.staff.length} {t('quality.org.persons')}</span>
                  </div>
                  <div className="space-y-1.5">
                    {dept.staff.map((staff: any) => (
                      <div key={staff.id} className="flex justify-between items-center p-2.5 bg-white border border-slate-100 rounded-xl hover:border-kst-blue/20 hover:shadow-sm transition-all group/item">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-sm font-bold text-slate-700 truncate">{staff.name}</span>
                          <div className="flex gap-1 shrink-0">
                            {dept.defaultCustodianId === staff.id && (
                              <div className="p-1 bg-amber-50 text-amber-500 rounded-md border border-amber-100" title={t('quality.org.is_default_cust')}>
                                <Star className="w-3 h-3 fill-current" />
                              </div>
                            )}
                            {staff.isDefaultInspector && (
                              <div className="p-1 bg-purple-50 text-purple-500 rounded-md border border-purple-100" title={t('quality.org.is_default_insp')}>
                                <ShieldCheck className="w-3 h-3 fill-current" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-all ml-2">
                          <button 
                            onClick={async () => {
                              const isCurrentlyDefault = dept.defaultCustodianId === staff.id;
                              await Actions.updateDepartmentDefaultCustodianAction(dept.id, isCurrentlyDefault ? null : staff.id);
                              refreshData();
                            }}
                            title={t('quality.org.set_default_cust')}
                            className={`p-1.5 rounded-md border transition-all ${
                              dept.defaultCustodianId === staff.id 
                                ? 'bg-amber-50 border-amber-200 text-amber-500' 
                                : 'bg-slate-50 border-transparent text-slate-400 hover:text-amber-500 hover:border-amber-100'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={async () => {
                              await Actions.updateStaffInspectorStatusAction(staff.id, !staff.isDefaultInspector);
                              refreshData();
                            }}
                            title={t('quality.org.set_default_insp')}
                            className={`p-1.5 rounded-md border transition-all ${
                              staff.isDefaultInspector 
                                ? 'bg-purple-50 border-purple-200 text-purple-500' 
                                : 'bg-slate-50 border-transparent text-slate-400 hover:text-purple-500 hover:border-purple-100'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleEditStaff(staff.id, staff.name)}
                            className="p-1.5 bg-slate-50 text-slate-400 hover:text-kst-blue rounded-md transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={async () => {
                              if (confirm(t('quality.org.confirm_del_staff'))) {
                                await Actions.deleteStaffAction(staff.id);
                                refreshData();
                              }
                            }}
                            className="p-1.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-md transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => handleAddStaff(dept.id)}
                      className="w-full py-2 border-2 border-dashed border-slate-100 rounded-xl text-xs font-bold text-slate-300 hover:text-kst-blue hover:border-kst-blue/20 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {t('quality.org.add_staff')}
                    </button>
                  </div>
                </div>
              </div>

              <footer className="p-4 bg-slate-50/30 border-t border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-kst-blue animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-500">{dept._count.gages} {t('quality.org.linked')}</span>
                </div>
                <button 
                   onClick={() => alert("功能開發中：查看該部門所有設備")}
                   className="text-[10px] font-bold text-kst-blue flex items-center gap-0.5 hover:underline"
                >
                  {t('quality.org.view_assets')} <ArrowRight className="w-3 h-3" />
                </button>
              </footer>
            </div>
          ))}

          {/* Add Dept Card */}
          <button 
            onClick={() => handleAddDept(activeLocation.id)}
            className="bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 space-y-3 hover:bg-blue-50/50 hover:border-kst-blue/30 transition-all group"
          >
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-kst-blue transition-colors">
              <PlusSquare className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500 group-hover:text-kst-blue transition-colors">{t('quality.org.add_dept')}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">{activeLocation.name}</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="py-40 text-center space-y-6 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
           <Building2 className="w-16 h-16 text-slate-200 mx-auto" />
           <div className="space-y-2">
             <p className="text-slate-500 font-bold text-xl">{t('quality.org.no_loc')}</p>
             <p className="text-slate-400 max-w-md mx-auto">{t('quality.org.start_hint')}</p>
           </div>
           <button 
            onClick={handleAddLocation}
            className="px-8 py-3 bg-kst-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
           >
            {t('quality.org.create_first')}
           </button>
        </div>
      )}
    </div>
  );
}
