import { Gage } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { CalibrationService, GageStatus } from './calibration-service';
import { LogService } from './log-service';

export class GageService {
  /**
   * 取得所有儀器並包含狀態判定與允收標準
   */
  static async getAllGages() {
    const gages = await prisma.gage.findMany({
      where: { deletedAt: null },
      include: {
        acceptanceStandard: {
          include: {
            criteria: true
          }
        },
        records: {
          where: { deletedAt: null },
          orderBy: { calDate: 'desc' },
          take: 1,
        },
        locationRef: true,
        departmentRef: true,
        custodianRef: true,
        managerRef: true,
        vendorRef: true,
      },
      orderBy: { id: 'asc' },
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return gages.map((gage) => {
      const nextCal = gage.nextCalDate ? new Date(gage.nextCalDate) : null;
      let isDueThisMonth = false;
      if (nextCal && !isNaN(nextCal.getTime()) && gage.calType !== '免校正') {
        isDueThisMonth = nextCal.getMonth() === currentMonth && nextCal.getFullYear() === currentYear;
      }

      return {
        ...gage,
        calculatedStatus: CalibrationService.evaluateStatus(gage.nextCalDate, gage.calType),
        isCalibrating: gage.records ? gage.records.some(r => r.status === 'PENDING' || r.status === 'DRAFT') : false,
        isDueThisMonth,
      };
    });
  }

  /**
   * 取得基本儀器清單 (輕量級，用於下拉選單)
   */
  static async getBasicGages() {
    return await prisma.gage.findMany({
      where: { deletedAt: null, status: 'IN_USE' },
      select: {
        id: true,
        name: true,
        spec: true,
        calPoints: true,
        acceptance: true,
        calibrationCycle: true,
        acceptanceStandard: {
          include: { criteria: true }
        }
      },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * 取得單一儀器詳情
   */
  static async getGageById(id: string) {
    const gage = await prisma.gage.findFirst({
      where: { id, deletedAt: null },
      include: {
        acceptanceStandard: {
          include: {
            criteria: true
          }
        },
        records: {
          where: { deletedAt: null },
          include: { details: true, vendor: true },
          orderBy: { calDate: 'desc' },
        },
        custodianRef: true,
        managerRef: true,
        locationRef: true,
        departmentRef: true,
        vendorRef: true,
      },
    });

    if (!gage) return null;

    return {
      ...gage,
      calculatedStatus: CalibrationService.evaluateStatus(gage.nextCalDate, gage.calType),
      isCalibrating: gage.records ? gage.records.some(r => r.status === 'PENDING' || r.status === 'DRAFT') : false,
    };
  }

  /**
   * 建立新儀器
   */
  static async createGage(data: any) {
    const { id, ...rest } = data;
    
    // 計算初次校正日期 (如果沒提供)
    const lastCalDate = data.lastCalDate ? new Date(data.lastCalDate) : new Date();
    const cycle = data.calibrationCycle || 12;
    const nextCalDate = data.nextCalDate ? new Date(data.nextCalDate) : CalibrationService.calculateNextCalDate(lastCalDate, cycle);

    const gage = await prisma.gage.create({
      data: {
        id: id,
        ...rest,
        lastCalDate,
        nextCalDate,
        status: data.status || 'IN_USE'
      },
    });

    await LogService.log({
      action: 'CREATE',
      module: 'GAGE',
      targetId: gage.id,
      content: { name: gage.name, category: gage.category }
    });

    return gage;
  }

  /**
   * 取得所有唯一類別
   */
  static async getCategories() {
    // 1. 從 Gage 表中獲取現有的類別字串
    const existingGages = await prisma.gage.findMany({
      where: { deletedAt: null },
      select: { category: true },
      distinct: ['category'],
    });
    const gageCategories = existingGages.map(c => c.category);

    // 2. 從 GageCategory 表中獲取已定義的類別 (如果模型存在)
    let definedCategories: string[] = [];
    if ((prisma as any).gageCategory) {
      const cats = await (prisma as any).gageCategory.findMany({
        where: { deletedAt: null },
        select: { name: true }
      });
      definedCategories = cats.map((c: any) => c.name);
    }

    // 合併並去重
    return Array.from(new Set([...gageCategories, ...definedCategories])).sort();
  }

  /**
   * 更新儀器資訊
   */
  static async updateGage(id: string, data: Partial<Gage>) {
    const { id: _, createdAt: __, updatedAt: ___, ...updateData } = data as any;

    if ((updateData.calibrationCycle !== undefined || updateData.lastCalDate !== undefined) && updateData.nextCalDate === undefined) {
      const existing = await prisma.gage.findUnique({ where: { id } });
      if (existing) {
        const cycle = updateData.calibrationCycle !== undefined ? updateData.calibrationCycle : existing.calibrationCycle;
        const lastCal = updateData.lastCalDate !== undefined ? new Date(updateData.lastCalDate) : new Date(existing.lastCalDate);
        
        if (cycle > 0 && !isNaN(lastCal.getTime())) {
          const nextCal = new Date(lastCal);
          nextCal.setMonth(nextCal.getMonth() + cycle);
          updateData.nextCalDate = nextCal;
        }
      }
    }

    // Ensure dates are valid Date objects for Prisma and remove undefined
    for (const key of Object.keys(updateData)) {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    }
    
    if (updateData.lastCalDate) {
      const d = new Date(updateData.lastCalDate);
      if (!isNaN(d.getTime())) updateData.lastCalDate = d;
      else delete updateData.lastCalDate;
    }
    
    if (updateData.nextCalDate) {
      const d = new Date(updateData.nextCalDate);
      if (!isNaN(d.getTime())) updateData.nextCalDate = d;
      else delete updateData.nextCalDate;
    }

    const updated = await prisma.gage.update({
      where: { id },
      data: updateData,
    });

    await LogService.log({
      action: 'UPDATE',
      module: 'GAGE',
      targetId: id,
      content: updateData
    });

    return updated;
  }

  /**
   * 刪除儀器
   */
  static async deleteGage(id: string) {
    const deleted = await prisma.gage.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await LogService.log({
      action: 'DELETE',
      module: 'GAGE',
      targetId: id,
      content: { id }
    });

    return deleted;
  }

  /**
   * 批次更新儀器資訊
   */
  static async batchUpdateGages(ids: string[], data: any) {
    const updateData = { ...data };

    // If standardId is provided, automatically "apply" its criteria and points to the text fields
    if (updateData.standardId) {
      const standard = await prisma.acceptanceStandard.findUnique({
        where: { id: updateData.standardId },
        include: { criteria: true, points: true }
      });

      if (standard) {
        // Apply calibration points
        if (standard.points && standard.points.length > 0) {
          updateData.calPoints = standard.points
            .map((p: any) => `${p.category}: ${p.points}${p.unit || ''}`)
            .join('\n');
        } else if (standard.defaultPoints) {
          updateData.calPoints = standard.defaultPoints;
        }

        // Apply acceptance criteria (Standard Range)
        if (standard.criteria && standard.criteria.length > 0) {
          updateData.acceptance = standard.criteria
            .map((c: any) => {
              const range = (c.rangeStart !== null && c.rangeStart !== undefined && c.rangeEnd !== null && c.rangeEnd !== undefined) 
                ? `${c.rangeStart}-${c.rangeEnd}${c.unit || ''}` 
                : "";
              const cat = (c.category || "").trim();
              const ran = range.trim();
              return `${cat}${ran ? ' ' + ran : ''}: +${c.tolerancePlus}/-${Math.abs(c.toleranceMinus)}`;
            })
            .join('\n');
        }

        // Apply default cycle if not explicitly set in batch edit
        if (standard.defaultCycle && !updateData.calibrationCycle) {
          updateData.calibrationCycle = standard.defaultCycle;
        }

        // Apply default precision if not explicitly set
        if (standard.defaultPrecision && !updateData.precision) {
          updateData.precision = standard.defaultPrecision;
        }

        // Sync category if targetCategory is defined and not overridden in batch
        if (standard.targetCategory && !updateData.category) {
          updateData.category = standard.targetCategory;
        }
      }
    }

    const updated = await prisma.gage.updateMany({
      where: { id: { in: ids } },
      data: updateData
    });

    await LogService.log({
      action: 'UPDATE',
      module: 'GAGE',
      targetId: 'BATCH',
      content: { ids, data: updateData }
    });

    return updated;
  }

  /**
   * 批次刪除儀器
   */
  static async batchDeleteGages(ids: string[]) {
    const deleted = await prisma.gage.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() }
    });

    await LogService.log({
      action: 'DELETE',
      module: 'GAGE',
      targetId: 'BATCH',
      content: { ids }
    });

    return deleted;
  }

  /**
   * 恢復已刪除儀器
   */
  static async restoreGage(id: string) {
    const restored = await prisma.gage.update({
      where: { id },
      data: { deletedAt: null },
    });

    await LogService.log({
      action: 'RESTORE',
      module: 'GAGE',
      targetId: id,
      content: { id }
    });

    return restored;
  }

  // --- 為了相容性暫時保留的代理方法 ---

  static async addCalibrationRecord(data: any) {
    return await CalibrationService.addCalibrationRecord(data);
  }

  static async reviewCalibrationRecord(recordId: string, reviewer: string, decision: any, notes?: string) {
    return await CalibrationService.reviewCalibrationRecord(recordId, reviewer, decision, notes);
  }

  static async updateCalibrationRecord(id: string, data: any) {
    return await CalibrationService.updateCalibrationRecord(id, data);
  }

  static async getRecordById(id: string) {
    return await CalibrationService.getRecordById(id);
  }

  static async getAllRecords() {
    return await CalibrationService.getAllRecords();
  }

  static async batchDeleteRecords(ids: string[]) {
    return await CalibrationService.batchDeleteRecords(ids);
  }

  static async batchUpdateRecords(ids: string[], data: any) {
    return await CalibrationService.batchUpdateRecords(ids, data);
  }

  // --- StandardService Delegates ---
  static async getAllAcceptanceStandards() {
    const { StandardService } = await import('./standard-service');
    return await StandardService.getAllAcceptanceStandards();
  }
  static async getAcceptanceStandardById(id: string) {
    const { StandardService } = await import('./standard-service');
    return await StandardService.getAcceptanceStandardById(id);
  }
  static async createAcceptanceStandard(data: any) {
    const { StandardService } = await import('./standard-service');
    return await StandardService.createAcceptanceStandard(data);
  }
  static async updateAcceptanceStandard(id: string, data: any) {
    const { StandardService } = await import('./standard-service');
    return await StandardService.updateAcceptanceStandard(id, data);
  }
  static async deleteAcceptanceStandard(id: string) {
    const { StandardService } = await import('./standard-service');
    return await StandardService.deleteAcceptanceStandard(id);
  }

  // --- BatchService Delegates ---
  static async addBatchCalibration(data: any) {
    const { BatchService } = await import('./batch-service');
    return await BatchService.addBatchCalibration(data);
  }
  static async getAllBatches() {
    const { BatchService } = await import('./batch-service');
    return await BatchService.getAllBatches();
  }
  static async getBatchById(id: string) {
    const { BatchService } = await import('./batch-service');
    return await BatchService.getBatchById(id);
  }
  static async finalizeBatchCalibration(batchId: string, data: any) {
    const { BatchService } = await import('./batch-service');
    return await BatchService.finalizeBatchCalibration(batchId, data);
  }
  static async getAllVendors() {
    const { BatchService } = await import('./batch-service');
    return await BatchService.getAllVendors();
  }

  // --- OrgService Delegates ---
  static async getAllLocations() {
    const { OrgService } = await import('./org-service');
    return await OrgService.getAllLocations();
  }
  static async createLocation(name: string) {
    const { OrgService } = await import('./org-service');
    return await OrgService.createLocation(name);
  }
  static async updateLocation(id: string, name: string) {
    const { OrgService } = await import('./org-service');
    return await OrgService.updateLocation(id, name);
  }
  static async deleteLocation(id: string) {
    const { OrgService } = await import('./org-service');
    return await OrgService.deleteLocation(id);
  }
  static async createDepartment(locationId: string, name: string) {
    const { OrgService } = await import('./org-service');
    return await OrgService.createDepartment(locationId, name);
  }
  static async updateDepartment(id: string, name: string) {
    const { OrgService } = await import('./org-service');
    return await OrgService.updateDepartment(id, name);
  }
  static async deleteDepartment(id: string) {
    const { OrgService } = await import('./org-service');
    return await OrgService.deleteDepartment(id);
  }
  static async createStaff(departmentId: string, name: string, staffId?: string) {
    const { OrgService } = await import('./org-service');
    return await OrgService.createStaff(departmentId, name, staffId);
  }
  static async updateStaff(id: string, data: any) {
    const { OrgService } = await import('./org-service');
    return await OrgService.updateStaff(id, data);
  }
  static async updateDepartmentDefaultCustodian(deptId: string, staffId: string | null) {
    const { OrgService } = await import('./org-service');
    return await OrgService.updateDepartmentDefaultCustodian(deptId, staffId);
  }
  static async updateStaffInspectorStatus(staffId: string, isDefault: boolean) {
    const { OrgService } = await import('./org-service');
    return await OrgService.updateStaffInspectorStatus(staffId, isDefault);
  }
  static async getDefaultInspector() {
    const { OrgService } = await import('./org-service');
    return await OrgService.getDefaultInspector();
  }
  static async deleteStaff(id: string) {
    const { OrgService } = await import('./org-service');
    return await OrgService.deleteStaff(id);
  }

  // --- DashboardService Delegates ---
  static async getDashboardStats() {
    const { DashboardService } = await import('./dashboard-service');
    return await DashboardService.getDashboardStats();
  }
  static async getGagesDueThisMonth() {
    const { DashboardService } = await import('./dashboard-service');
    return await DashboardService.getGagesDueThisMonth();
  }
  static async getActiveReminders() {
    const { DashboardService } = await import('./dashboard-service');
    return await DashboardService.getActiveReminders();
  }

  /**
   * 批次匯入儀器設備清冊
   */
  static async bulkImportGages(data: any[]) {
    let imported = 0, updated = 0;
    
    // We process sequentially to properly findOrCreate relational records
    // Since prisma does not support nested findOrCreate inside transaction easily without specific ids
    for (const row of data) {
      if (!row.id || !row.name) continue; // ID and Name are required

      // 1. Resolve Location
      let locationId = null;
      if (row.location) {
        let loc = await prisma.location.findFirst({ where: { name: row.location } });
        if (!loc) loc = await prisma.location.create({ data: { name: row.location } });
        locationId = loc.id;
      }

      // 2. Resolve Department
      let departmentId = null;
      if (row.department && locationId) {
        let dept = await prisma.department.findFirst({ where: { name: row.department, locationId } });
        if (!dept) dept = await prisma.department.create({ data: { name: row.department, locationId } });
        departmentId = dept.id;
      }

      // 3. Resolve Custodian
      let custodianId = null;
      if (row.custodian && departmentId) {
        let staff = await prisma.staff.findFirst({ where: { name: row.custodian, departmentId } });
        if (!staff) staff = await prisma.staff.create({ data: { name: row.custodian, departmentId } });
        custodianId = staff.id;
      }

      // 4. Resolve Date fields
      const lastCalDate = row.lastCalDate ? new Date(row.lastCalDate) : new Date();
      const cycle = parseInt(row.calibrationCycle) || 12;
      const nextCalDate = row.nextCalDate ? new Date(row.nextCalDate) : CalibrationService.calculateNextCalDate(lastCalDate, cycle);
      const entryDate = row.entryDate ? new Date(row.entryDate) : null;

      const gageData = {
        name: row.name,
        spec: row.spec || null,
        category: row.category || '未分類',
        precision: row.precision || null,
        usageRange: row.usageRange || null,
        calPoints: row.calPoints || null,
        tafLogo: row.tafLogo || null,
        entryDate: entryDate,
        locationId: locationId,
        departmentId: departmentId,
        custodianId: custodianId,
        calType: row.calType || 'INTERNAL',
        calibrationCycle: cycle,
        lastCalDate: lastCalDate,
        nextCalDate: nextCalDate,
        status: row.status || 'IN_USE',
        notes: row.notes || null,
        // Sync legacy string fields
        location: row.location || 'Chennai',
        department: row.department || null,
        manager: row.manager || null
      };

      const existing = await prisma.gage.findFirst({ where: { id: row.id } });
      
      if (existing) {
        await prisma.gage.update({
          where: { id: existing.id },
          data: gageData
        });
        updated++;
      } else {
        await prisma.gage.create({
          data: {
            id: row.id,
            ...gageData
          }
        });
        imported++;
      }
    }

    return { imported, updated };
  }
}
