import { prisma } from '../lib/prisma';
import { LogService } from './log-service';

export class StandardService {
  /**
   * 取得所有允收標準
   */
  static async getAllAcceptanceStandards() {
    return await prisma.acceptanceStandard.findMany({
      where: { deletedAt: null },
      include: {
        criteria: true,
        points: true,
        _count: {
          select: { gages: { where: { deletedAt: null } } }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * 取得特定允收標準詳情
   */
  static async getAcceptanceStandardById(id: string) {
    return await prisma.acceptanceStandard.findFirst({
      where: { id, deletedAt: null },
      include: {
        criteria: true,
        points: true,
        gages: { where: { deletedAt: null } }
      }
    });
  }

  /**
   * 建立允收標準
   */
  static async createAcceptanceStandard(data: {
    name: string;
    description?: string;
    targetCategory?: string;
    defaultPoints?: string;
    type: string;
    defaultCycle?: number;
    criteria: {
      rangeStart?: number;
      rangeEnd?: number;
      tolerancePlus: number;
      toleranceMinus: number;
      unit?: string;
    }[];
    points?: {
      category: string;
      points: string;
      unit?: string;
    }[];
    defaultCycle?: number;
    defaultPrecision?: string;
  }) {
    const standard = await prisma.acceptanceStandard.create({
      data: {
        name: data.name,
        description: data.description,
        targetCategory: data.targetCategory,
        defaultPoints: data.defaultPoints,
        type: data.type,
        defaultCycle: data.defaultCycle,
        defaultPrecision: data.defaultPrecision,
        criteria: {
          create: data.criteria
        },
        points: {
          create: data.points
        }
      },
      include: { criteria: true, points: true }
    });

    await LogService.log({
      action: 'CREATE',
      module: 'STANDARD',
      targetId: standard.id,
      content: { name: standard.name }
    });

    return standard;
  }

  /**
   * 更新允收標準
   */
  static async updateAcceptanceStandard(id: string, data: {
    name?: string;
    description?: string;
    targetCategory?: string;
    defaultPoints?: string;
    type?: string;
    criteria?: {
      id?: string;
      rangeStart?: number;
      rangeEnd?: number;
      tolerancePlus: number;
      toleranceMinus: number;
      unit?: string;
    }[];
    points?: {
      id?: string;
      category: string;
      points: string;
      unit?: string;
    }[];
    defaultCycle?: number;
    defaultPrecision?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      await tx.acceptanceStandard.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          targetCategory: data.targetCategory,
          defaultPoints: data.defaultPoints,
          type: data.type,
          defaultCycle: data.defaultCycle,
          defaultPrecision: data.defaultPrecision,
        }
      });

      if (data.criteria) {
        await tx.acceptanceCriterion.deleteMany({
          where: { standardId: id }
        });
        for (const c of data.criteria) {
          const { id: _, ...cleanC } = c as any;
          await tx.acceptanceCriterion.create({
            data: {
              standardId: id,
              ...cleanC
            }
          });
        }
      }

      if (data.points) {
        await tx.acceptancePoints.deleteMany({
          where: { standardId: id }
        });
        for (const p of data.points) {
          const { id: _, ...cleanP } = p as any;
          await tx.acceptancePoints.create({
            data: {
              standardId: id,
              ...cleanP
            }
          });
        }
      }

      const updated = await tx.acceptanceStandard.findUnique({
        where: { id },
        include: { criteria: true, points: true }
      });

      await LogService.log({
        action: 'UPDATE',
        module: 'STANDARD',
        targetId: id,
        content: data
      });

      return updated;
    }, {
      timeout: 20000
    });
  }

  /**
   * 刪除允收標準
   */
  static async deleteAcceptanceStandard(id: string) {
    const deleted = await prisma.acceptanceStandard.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await LogService.log({
      action: 'DELETE',
      module: 'STANDARD',
      targetId: id,
      content: { id }
    });

    return deleted;
  }
}
