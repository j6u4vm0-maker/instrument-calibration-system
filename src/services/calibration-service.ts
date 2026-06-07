import { CalibrationRecord, Gage } from '@prisma/client';
import { addMonths, differenceInDays, isAfter } from 'date-fns';
import { prisma } from '../lib/prisma';
import { LogService } from './log-service';

export type GageStatus = 'PASS' | 'WARNING' | 'OVERDUE' | 'NO_CAL' | 'IN_CALIBRATION';

export class CalibrationService {
  /**
   * 計算下次校驗日期
   */
  static calculateNextCalDate(lastCalDate: Date, cycleMonths: number): Date {
    return addMonths(lastCalDate, cycleMonths);
  }

  /**
   * 判定狀態
   */
  static evaluateStatus(nextCalDate: Date, calType?: string | null): GageStatus {
    if (calType === '免校正') return 'NO_CAL';
    const now = new Date();
    const daysDiff = differenceInDays(nextCalDate, now);
    if (isAfter(now, nextCalDate)) return 'OVERDUE';
    if (daysDiff <= 30) return 'WARNING';
    return 'PASS';
  }

  /**
   * 新增校正紀錄並更新儀器日期
   */
  static async addCalibrationRecord(data: {
    gageId: string;
    calDate: Date;
    result: string;
    inspector: string;
    reportType?: string;
    certificateNo?: string;
    notes?: string;
    status?: string;
    attachmentUrl?: string;
    details?: { point: string; standard?: number; actual?: number; error?: number; result?: string }[];
    newCalPoints?: string;
    vendorId?: string;
    cost?: number;
    overrideNextCalDate?: Date;
    calibrationCycle?: number;
  }) {
    const gage = await prisma.gage.findUnique({
      where: { id: data.gageId },
    });

    if (!gage) throw new Error('儀器不存在');

    return await prisma.$transaction(async (tx) => {
      // 產生報告編號 (YYMMDD + 2位流水號)
      let finalCertificateNo = data.certificateNo;
      if (!finalCertificateNo) {
        const today = new Date();
        const yy = String(today.getFullYear()).slice(-2);
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const datePrefix = `${yy}${mm}${dd}`;

        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const countToday = await tx.calibrationRecord.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        });

        const serial = String(countToday + 1).padStart(2, '0');
        finalCertificateNo = `${datePrefix}${serial}`;
      }

      const newRecord = await tx.calibrationRecord.create({
        data: {
          gageId: data.gageId,
          calDate: data.calDate,
          result: data.result,
          inspector: data.inspector,
          reportType: data.reportType,
          certificateNo: finalCertificateNo,
          notes: data.notes,
          status: data.status || 'APPROVED',
          vendorId: data.vendorId,
          cost: data.cost,
          attachmentUrl: data.attachmentUrl,
        },
      });

      if (data.details && data.details.length > 0) {
        const detailsData = data.details.map(d => ({
          recordId: newRecord.id,
          ...d
        }));
        await tx.calibrationDetail.createMany({
          data: detailsData
        });
      }

      if ((data.status === 'APPROVED' || !data.status) && data.result === 'PASS') {
        const nextCalDate = data.overrideNextCalDate || this.calculateNextCalDate(data.calDate, data.calibrationCycle || gage.calibrationCycle);
        await tx.gage.update({
          where: { id: data.gageId },
          data: {
            lastCalDate: data.calDate,
            nextCalDate: nextCalDate,
            calibrationCycle: data.calibrationCycle || gage.calibrationCycle,
            calPoints: data.newCalPoints || gage.calPoints,
            status: 'IN_USE',
          },
        });
      }

      await LogService.log({
        action: 'CREATE',
        module: 'CALIBRATION',
        targetId: newRecord.id,
        content: { gageId: data.gageId, result: data.result }
      });

      return newRecord;
    }, {
      timeout: 20000
    });
  }

  /**
   * 審核校正紀錄
   */
  static async reviewCalibrationRecord(recordId: string, reviewer: string, decision: 'APPROVED' | 'REJECTED', notes?: string) {
    const record = await prisma.calibrationRecord.findUnique({
      where: { id: recordId },
      include: { gage: true }
    });

    if (!record) throw new Error('紀錄不存在');

    return await prisma.$transaction(async (tx) => {
      const updatedRecord = await tx.calibrationRecord.update({
        where: { id: recordId },
        data: {
          status: decision,
          reviewer,
          reviewDate: new Date(),
          reviewNotes: notes
        }
      });

      if (decision === 'APPROVED' && record.result === 'PASS') {
        const nextCalDate = this.calculateNextCalDate(record.calDate, record.gage.calibrationCycle);
        await tx.gage.update({
          where: { id: record.gageId },
          data: {
            lastCalDate: record.calDate,
            nextCalDate: nextCalDate,
            status: 'IN_USE'
          }
        });
      }

      await LogService.log({
        action: 'UPDATE',
        module: 'CALIBRATION',
        targetId: recordId,
        content: { decision, reviewer }
      });

      return updatedRecord;
    }, {
      timeout: 20000
    });
  }

  /**
   * 取得所有校正紀錄 (報表查詢用)
   */
  static async getAllRecords() {
    return await prisma.calibrationRecord.findMany({
      where: { deletedAt: null },
      include: {
        gage: {
          include: {
            acceptanceStandard: {
              include: {
                criteria: true
              }
            }
          }
        },
        vendor: true,
        batch: true,
        details: true
      },
      orderBy: { calDate: 'desc' }
    });
  }

  /**
   * 更新單筆校正紀錄
   */
  static async updateCalibrationRecord(id: string, data: {
    calDate?: Date;
    result?: string;
    certificateNo?: string;
    inspector?: string;
    notes?: string;
    status?: string;
    reportType?: string;
    vendorId?: string;
    cost?: number;
    attachmentUrl?: string;
    details?: any[];
  }) {
    const record = await prisma.calibrationRecord.findUnique({
      where: { id },
      include: { gage: true }
    });

    if (!record) throw new Error('紀錄不存在');

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.calibrationRecord.update({
        where: { id },
        data: {
          calDate: data.calDate,
          result: data.result,
          certificateNo: data.certificateNo,
          inspector: data.inspector,
          notes: data.notes,
          status: data.status,
          reportType: data.reportType,
          vendorId: data.vendorId,
          cost: data.cost,
          attachmentUrl: data.attachmentUrl
        }
      });

      if (data.details) {
        await tx.calibrationDetail.deleteMany({
          where: { recordId: id }
        });
        if (data.details.length > 0) {
          const detailsData = data.details.map(d => ({
            recordId: id,
            category: d.category,
            point: String(d.point),
            lowerLimit: d.lowerLimit !== undefined && d.lowerLimit !== "" ? parseFloat(d.lowerLimit) : undefined,
            upperLimit: d.upperLimit !== undefined && d.upperLimit !== "" ? parseFloat(d.upperLimit) : undefined,
            standard: d.standard !== undefined && d.standard !== "" ? parseFloat(d.standard) : undefined,
            actual: d.actual !== undefined ? parseFloat(d.actual) : undefined,
            error: d.error !== undefined ? parseFloat(d.error) : undefined,
            result: d.result
          }));
          await tx.calibrationDetail.createMany({
            data: detailsData
          });
        }
      }

      const latestRecord = await tx.calibrationRecord.findFirst({
        where: { gageId: record.gageId, deletedAt: null },
        orderBy: { calDate: 'desc' }
      });

      if (latestRecord && latestRecord.id === id && updated.result === 'PASS') {
        const nextCalDate = this.calculateNextCalDate(updated.calDate, record.gage.calibrationCycle);
        await tx.gage.update({
          where: { id: record.gageId },
          data: {
            lastCalDate: updated.calDate,
            nextCalDate: nextCalDate
          }
        });
      }

      await LogService.log({
        action: 'UPDATE',
        module: 'CALIBRATION',
        targetId: id,
        content: data
      });

      return updated;
    }, {
      timeout: 20000
    });
  }

  /**
   * 取得特定校正紀錄
   */
  static async getRecordById(id: string) {
    return await prisma.calibrationRecord.findFirst({
      where: { id, deletedAt: null },
      include: {
        gage: true,
        details: true,
        vendor: true
      }
    });
  }

  /**
   * 批次刪除校正紀錄
   */
  static async batchDeleteRecords(ids: string[]) {
    return await prisma.$transaction(async (tx) => {
      const records = await tx.calibrationRecord.findMany({
        where: { id: { in: ids } },
        select: { gageId: true }
      });
      const gageIds = Array.from(new Set(records.map(r => r.gageId)));

      await tx.calibrationRecord.updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() }
      });

      for (const gageId of gageIds) {
        const latest = await tx.calibrationRecord.findFirst({
          where: { gageId, result: 'PASS', deletedAt: null },
          orderBy: { calDate: 'desc' }
        });

        const gage = await tx.gage.findUnique({ where: { id: gageId } });
        if (gage) {
          if (latest) {
            const nextCalDate = this.calculateNextCalDate(latest.calDate, gage.calibrationCycle);
            await tx.gage.update({
              where: { id: gageId },
              data: {
                lastCalDate: latest.calDate,
                nextCalDate: nextCalDate
              }
            });
          } else {
            // No PASS records left, reset to creation date or similar logic
            await tx.gage.update({
              where: { id: gageId },
              data: {
                lastCalDate: gage.createdAt,
                nextCalDate: gage.createdAt
              }
            });
          }
        }
      }

      await LogService.log({
        action: 'DELETE',
        module: 'CALIBRATION',
        targetId: 'BATCH',
        content: { ids }
      });
    }, {
      timeout: 20000
    });
  }

  /**
   * 批次修改校正紀錄
   */
  static async batchUpdateRecords(ids: string[], data: any) {
    return await prisma.calibrationRecord.updateMany({
      where: { id: { in: ids } },
      data: data
    });
  }
}
