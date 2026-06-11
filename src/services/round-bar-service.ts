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
}
