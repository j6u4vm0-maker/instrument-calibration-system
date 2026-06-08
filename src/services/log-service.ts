import { prisma } from "@/lib/prisma";

export type LogModule = 'GAGE' | 'CALIBRATION' | 'ORG' | 'STANDARD' | 'VENDOR' | 'FIXTURE' | 'CATEGORY';
export type LogAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT' | 'RESTORE';

export class LogService {
  static async log({
    action,
    module,
    targetId,
    content,
    userId,
    userName,
    ipAddress
  }: {
    action: LogAction;
    module: LogModule;
    targetId?: string;
    content: any;
    userId?: string;
    userName?: string;
    ipAddress?: string;
  }) {
    try {
      await prisma.systemLog.create({
        data: {
          action,
          module,
          targetId,
          content: typeof content === 'string' ? content : JSON.stringify(content),
          userId,
          userName,
          ipAddress,
        },
      });
    } catch (error) {
      console.error("Failed to write system log:", error);
    }
  }

  static async getLogs(filters: {
    module?: LogModule;
    action?: LogAction;
    targetId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    return prisma.systemLog.findMany({
      where: {
        module: filters.module,
        action: filters.action,
        targetId: filters.targetId,
        createdAt: {
          gte: filters.startDate,
          lte: filters.endDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: filters.limit || 50,
    });
  }
}
