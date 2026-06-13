import { prisma } from "@/lib/prisma";
import { addMonths, endOfMonth } from "date-fns";

export class RoundBarService {
  /**
   * 取得圓棒列表
   */
  static async getRoundBars(params?: {
    search?: string;
    status?: string;
    departmentId?: string;
    locationId?: string;
  }) {
    const where: any = {};
    if (params?.search) {
      where.OR = [
        { id: { contains: params.search } },
        { name: { contains: params.search } },
        { spec: { contains: params.search } },
        { usageRange: { contains: params.search } },
      ];
    }
    if (params?.status) where.status = params.status;
    if (params?.departmentId) where.departmentId = params.departmentId;
    if (params?.locationId) where.locationId = params.locationId;

    const roundBars = await prisma.roundBar.findMany({
      where,
      include: {
        departmentRef: true,
        managerRef: true,
        locationRef: true,
      },
      orderBy: { id: "asc" },
    });

    return roundBars;
  }

  /**
   * 取得單一圓棒
   */
  static async getRoundBarById(id: string) {
    return prisma.roundBar.findUnique({
      where: { id },
      include: {
        departmentRef: true,
        managerRef: true,
        locationRef: true,
        records: {
          orderBy: { calDate: "desc" },
          include: { vendor: true },
        },
      },
    });
  }

  /**
   * 新增圓棒
   */
  static async createRoundBar(data: any) {
    const nextCalDate = addMonths(new Date(data.lastCalDate), data.calibrationCycle || 12);
    
    return prisma.roundBar.create({
      data: {
        id: data.id,
        name: data.name,
        spec: data.spec,
        usageRange: data.usageRange,
        entryDate: data.entryDate ? new Date(data.entryDate) : null,
        locationId: data.locationId || null,
        departmentId: data.departmentId || null,
        managerId: data.managerId || null,
        calibrationCycle: data.calibrationCycle,
        calPoint1: data.calPoint1,
        calPoint2: data.calPoint2,
        rdIssuer: data.rdIssuer,
        notes: data.notes,
        lastCalDate: new Date(data.lastCalDate),
        actualCalDate: data.actualCalDate ? new Date(data.actualCalDate) : null,
        nextCalDate,
        status: data.status || "IN_USE",
      },
    });
  }

  /**
   * 更新圓棒
   */
  static async updateRoundBar(id: string, data: any) {
    let nextCalDate;
    if (data.lastCalDate && data.calibrationCycle) {
      nextCalDate = addMonths(new Date(data.lastCalDate), data.calibrationCycle);
    }

    return prisma.roundBar.update({
      where: { id },
      data: {
        name: data.name,
        spec: data.spec,
        usageRange: data.usageRange,
        entryDate: data.entryDate ? new Date(data.entryDate) : undefined,
        locationId: data.locationId,
        departmentId: data.departmentId,
        managerId: data.managerId,
        calibrationCycle: data.calibrationCycle,
        calPoint1: data.calPoint1,
        calPoint2: data.calPoint2,
        rdIssuer: data.rdIssuer,
        notes: data.notes,
        lastCalDate: data.lastCalDate ? new Date(data.lastCalDate) : undefined,
        actualCalDate: data.actualCalDate ? new Date(data.actualCalDate) : undefined,
        nextCalDate,
        status: data.status,
      },
    });
  }

  /**
   * 刪除/軟刪除圓棒
   */
  static async deleteRoundBar(id: string) {
    return prisma.roundBar.update({
      where: { id },
      data: {
        status: "SCRAPPED",
        deletedAt: new Date(),
      },
    });
  }

  private static normalizeText(value: any) {
    return String(value ?? '').trim();
  }

  private static splitNameCandidates(value: any) {
    const text = RoundBarService.normalizeText(value);
    if (!text) return [];
    return text
      .split(/\r?\n|[\t,，;；]/g)
      .map(v => v.trim())
      .filter(Boolean);
  }

  private static async resolveStaffId(name: any, departmentId: string | null) {
    const candidates = RoundBarService.splitNameCandidates(name);
    if (candidates.length === 0) return null;

    for (const candidate of candidates) {
      const exact = await prisma.staff.findFirst({
        where: {
          name: candidate,
          ...(departmentId ? { departmentId } : {}),
        },
      });
      if (exact) return exact.id;
    }

    if (!departmentId) return null;

    const created = await prisma.staff.create({
      data: { name: candidates[0], departmentId },
    });
    return created.id;
  }

  /**
   * 批次匯入圓棒
   */
  static async bulkImportRoundBars(data: any[]) {
    let importedCount = 0;
    let updatedCount = 0;
    let errors = [];

    for (const item of data) {
      if (!item.id || !item.name) continue;

      try {
        let locationId: string | null = null;
        let departmentId: string | null = null;
        let managerId: string | null = null;

        if (item.location) {
          let loc = await prisma.location.findFirst({ where: { name: item.location } });
          if (!loc) {
            loc = await prisma.location.create({ data: { name: item.location } });
          }
          locationId = loc.id;
        }

        if (item.department) {
          let dept = await prisma.department.findFirst({ where: { name: item.department } });
          if (!dept) {
            if (!locationId) {
              let loc = await prisma.location.findFirst();
              if (!loc) loc = await prisma.location.create({ data: { name: '未分類廠區' } });
              locationId = loc.id;
            }
            dept = await prisma.department.create({ data: { name: item.department, locationId: locationId! } });
          }
          departmentId = dept.id;
        }

        if (item.manager) {
          managerId = await RoundBarService.resolveStaffId(item.manager, departmentId);
        }

        const nextCalDate = item.lastCalDate 
          ? addMonths(new Date(item.lastCalDate), item.calibrationCycle || 12)
          : new Date();

        const updateData: any = {
          name: item.name,
          spec: item.spec,
          usageRange: item.usageRange,
          entryDate: item.entryDate ? new Date(item.entryDate) : null,
          calibrationCycle: item.calibrationCycle || 12,
          calPoint1: item.calPoint1,
          calPoint2: item.calPoint2,
          rdIssuer: item.rdIssuer,
          notes: item.notes,
          lastCalDate: item.lastCalDate ? new Date(item.lastCalDate) : new Date(),
          actualCalDate: item.actualCalDate ? new Date(item.actualCalDate) : null,
          nextCalDate: nextCalDate,
          status: item.status || "IN_USE",
          locationId: locationId || null,
          departmentId: departmentId || null,
          managerId: managerId || null,
        };

        const existing = await prisma.roundBar.findUnique({
          where: { id: item.id },
        });

        if (existing) {
          await prisma.roundBar.update({
            where: { id: item.id },
            data: updateData,
          });
          updatedCount++;
        } else {
          await prisma.roundBar.create({
            data: {
              id: item.id,
              ...updateData,
            },
          });
          importedCount++;
        }
      } catch (err: any) {
        errors.push(`Row ${item.id}: ${err.message}`);
      }
    }

    return { imported: importedCount, updated: updatedCount, errors };
  }
}
