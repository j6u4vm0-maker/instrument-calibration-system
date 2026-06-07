import { prisma } from '../lib/prisma';
import { Vendor } from '@prisma/client';

export class VendorService {
  static async getAllVendors(type?: string) {
    return await prisma.vendor.findMany({
      where: type ? { type } : undefined,
      orderBy: { name: 'asc' },
      include: {
        records: { select: { id: true } }
      }
    });
  }

  static async getVendorById(id: string) {
    return await prisma.vendor.findUnique({
      where: { id },
      include: {
        records: {
          include: { gage: true },
          orderBy: { calDate: 'desc' }
        }
      }
    });
  }

  static async createVendor(data: {
    vendorCode?: string;
    name: string;
    shortName?: string;
    type?: string;
    contact?: string;
    phone?: string;
    mobile?: string;
    fax?: string;
    email?: string;
    website?: string;
    serviceScope?: string;
    address?: string;
    notes?: string;
  }) {
    return await prisma.vendor.create({
      data
    });
  }

  static async updateVendor(id: string, data: Partial<Vendor>) {
    const { id: _, createdAt: __, updatedAt: ___, ...updateData } = data as any;
    return await prisma.vendor.update({
      where: { id },
      data: updateData
    });
  }

  static async deleteVendor(id: string) {
    return await prisma.vendor.delete({
      where: { id }
    });
  }

  /**
   * 取得特定儀器的上次校正費用與廠商
   */
  static async getLastCalibrationInfo(gageId: string) {
    const lastRecord = await prisma.calibrationRecord.findFirst({
      where: { gageId, reportType: 'EXTERNAL' },
      orderBy: { calDate: 'desc' },
      include: { vendor: true }
    });

    return {
      lastVendor: lastRecord?.vendor?.name || '無',
      lastCost: lastRecord?.cost || 0,
      lastDate: lastRecord?.calDate
    };
  }

  /**
   * 批次匯入廠商資料
   */
  static async bulkImportVendors(data: any[]) {
    return await prisma.$transaction(async (tx) => {
      let imported = 0, updated = 0;
      for (const row of data) {
        if (!row.name) continue;

        const existing = row.vendorCode
          ? await tx.vendor.findFirst({
              where: {
                OR: [
                  { vendorCode: row.vendorCode },
                  { name: row.name },
                ],
              },
            })
          : await tx.vendor.findFirst({ where: { name: row.name } });

        if (existing) {
          await tx.vendor.update({
            where: { id: existing.id },
            data: {
              vendorCode: row.vendorCode || existing.vendorCode,
              shortName: row.shortName || existing.shortName,
              type: row.type || existing.type,
              contact: row.contact || existing.contact,
              phone: row.phone || existing.phone,
              mobile: row.mobile || existing.mobile,
              fax: row.fax || existing.fax,
              email: row.email || existing.email,
              website: row.website || existing.website,
              serviceScope: row.serviceScope || existing.serviceScope,
              address: row.address || existing.address,
              notes: row.notes || existing.notes
            }
          });
          updated++;
        } else {
          await tx.vendor.create({
            data: {
              vendorCode: row.vendorCode,
              name: row.name,
              shortName: row.shortName,
              type: row.type || 'OUTSOURCE',
              contact: row.contact,
              phone: row.phone,
              mobile: row.mobile,
              fax: row.fax,
              email: row.email,
              website: row.website,
              serviceScope: row.serviceScope,
              address: row.address,
              notes: row.notes
            }
          });
          imported++;
        }
      }
      return { imported, updated };
    });
  }
}
