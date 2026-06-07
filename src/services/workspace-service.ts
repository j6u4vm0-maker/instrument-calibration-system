import { PrismaClient } from '@prisma/client';
import { CalibrationService } from './calibration-service';
import { startOfMonth, endOfMonth, isBefore, differenceInDays } from 'date-fns';

const prisma = new PrismaClient();

export class WorkspaceService {
  /**
   * 取得校正工作站需要的所有資料
   */
  static async getWorkspaceData() {
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);
    const endOfCurrentMonth = endOfMonth(today);

    // 取得所有未刪除的設備，並包含最新的一筆校正紀錄
    const gages = await prisma.gage.findMany({
      where: { deletedAt: null },
      include: {
        records: {
          orderBy: { calDate: 'desc' },
          take: 1,
          include: { vendor: true }
        },
      },
    });

    const activeGages = gages.filter(gage => gage.calType !== '免校正' && gage.nextCalDate);

    // 分類
    const overdueGages: any[] = [];
    const dueThisMonthGages: any[] = [];
    
    // 內校與外校
    const internalGages: any[] = [];
    const externalGages: any[] = [];

    // 進度追蹤
    const completedGages: any[] = [];
    const incompleteGages: any[] = [];

    activeGages.forEach(gage => {
      const nextCal = new Date(gage.nextCalDate!);
      const isOverdue = isBefore(nextCal, startOfCurrentMonth);
      const isDueThisMonth = nextCal >= startOfCurrentMonth && nextCal <= endOfCurrentMonth;
      
      const isDue = isOverdue || isDueThisMonth;

      if (!isDue) return;

      const latestRecord = gage.records[0];
      const hasRecordThisMonth = latestRecord && new Date(latestRecord.calDate) >= startOfCurrentMonth;
      
      // 判定完成狀態
      let isCompleted = false;
      if (hasRecordThisMonth && (latestRecord.status === 'PENDING' || latestRecord.status === 'APPROVED')) {
        isCompleted = true;
      }

      if (isCompleted) {
        completedGages.push(gage);
      } else {
        incompleteGages.push(gage);
        
        if (isOverdue) overdueGages.push(gage);
        if (isDueThisMonth) dueThisMonthGages.push(gage);

        if (gage.calType === 'INTERNAL') {
          internalGages.push(gage);
        } else if (gage.calType === 'EXTERNAL') {
          externalGages.push(gage);
        }
      }
    });

    // 內校依據位置與部門分組
    const internalGrouped = internalGages.reduce((acc, gage) => {
      const key = `${gage.location || '未指定位置'} - ${gage.department || '未指定部門'}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(gage);
      return acc;
    }, {} as Record<string, any[]>);

    // 外校依據廠商分組
    const externalGrouped = externalGages.reduce((acc, gage) => {
      const vendorName = gage.records && gage.records[0] && gage.records[0].vendor ? gage.records[0].vendor.name : '未指定廠商';
      const key = vendorName;
      if (!acc[key]) acc[key] = [];
      acc[key].push(gage);
      return acc;
    }, {} as Record<string, any[]>);

    return {
      summary: {
        totalDue: overdueGages.length + dueThisMonthGages.length,
        overdue: overdueGages.length,
        dueThisMonth: dueThisMonthGages.length,
        completed: completedGages.length,
      },
      internalGrouped,
      externalGrouped,
      completedGages,
      incompleteGages
    };
  }
}
