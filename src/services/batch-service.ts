import { prisma } from '../lib/prisma';
import { CalibrationService } from './calibration-service';
import { LogService } from './log-service';

export class BatchService {
  /**
   * 批次外校處理
   */
  static async addBatchCalibration(data: {
    vendorId: string;
    totalCost: number;
    invoiceNo?: string;
    status?: string;
    items: {
      gageId: string;
      certificateNo?: string;
      result?: string;
      calibrationCycle: number;
      calDate: string;
    }[];
  }) {
    const avgCost = data.totalCost / (data.items.length || 1);
    const batchStatus = data.status || 'COMPLETED';

    return await prisma.$transaction(async (tx) => {
      const batch = await tx.calibrationBatch.create({
        data: {
          vendorId: data.vendorId,
          totalCost: data.totalCost,
          invoiceNo: data.invoiceNo,
          status: batchStatus,
        }
      });

      for (const item of data.items) {
        const itemCalDate = new Date(item.calDate);
        await tx.calibrationRecord.create({
          data: {
            gageId: item.gageId,
            calDate: itemCalDate,
            result: item.result || 'PENDING',
            inspector: "BATCH_SYSTEM",
            reportType: "EXTERNAL",
            certificateNo: item.certificateNo,
            vendorId: data.vendorId,
            cost: avgCost,
            batchId: batch.id,
            status: batchStatus === 'COMPLETED' ? 'APPROVED' : 'DRAFT',
          }
        });

        if (batchStatus === 'COMPLETED' && item.result === 'PASS') {
          const nextCalDate = CalibrationService.calculateNextCalDate(itemCalDate, item.calibrationCycle);
          await tx.gage.update({
            where: { id: item.gageId },
            data: {
              lastCalDate: itemCalDate,
              nextCalDate: nextCalDate,
              status: 'IN_USE',
            }
          });
        } else if (batchStatus === 'DRAFT') {
          await tx.gage.update({
            where: { id: item.gageId },
            data: { status: 'IN_CALIBRATION' }
          });
        }
      }
      await LogService.log({
        action: 'CREATE',
        module: 'CALIBRATION',
        targetId: batch.id,
        content: { type: 'BATCH', itemCount: data.items.length, vendorId: data.vendorId }
      });

      return batch;
    }, {
      timeout: 20000
    });
  }

  /**
   * 取得所有批次紀錄
   */
  static async getAllBatches() {
    return await prisma.calibrationBatch.findMany({
      include: {
        vendor: true,
        _count: { select: { records: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * 取得特定批次詳情
   */
  static async getBatchById(id: string) {
    return await prisma.calibrationBatch.findUnique({
      where: { id },
      include: {
        vendor: true,
        records: {
          include: { gage: true }
        }
      }
    });
  }

  /**
   * 完成批次校正
   */
  static async finalizeBatchCalibration(batchId: string, data: {
    totalCost?: number;
    invoiceNo?: string;
    items: {
      recordId: string;
      gageId: string;
      certificateNo: string;
      result: string;
      calDate: string;
      calibrationCycle: number;
    }[];
  }) {
    return await prisma.$transaction(async (tx) => {
      await tx.calibrationBatch.update({
        where: { id: batchId },
        data: {
          status: 'COMPLETED',
          totalCost: data.totalCost,
          invoiceNo: data.invoiceNo,
        }
      });

      for (const item of data.items) {
        const itemCalDate = new Date(item.calDate);
        await tx.calibrationRecord.update({
          where: { id: item.recordId },
          data: {
            calDate: itemCalDate,
            result: item.result,
            certificateNo: item.certificateNo,
            status: 'APPROVED',
          }
        });

        if (item.result === 'PASS') {
          const nextCalDate = CalibrationService.calculateNextCalDate(itemCalDate, item.calibrationCycle);
          await tx.gage.update({
            where: { id: item.gageId },
            data: {
              lastCalDate: itemCalDate,
              nextCalDate: nextCalDate,
              status: 'IN_USE',
            }
          });
        }
      }
    });
  }

  /**
   * 取得所有廠商
   */
  static async getAllVendors() {
    return await prisma.vendor.findMany();
  }
}
