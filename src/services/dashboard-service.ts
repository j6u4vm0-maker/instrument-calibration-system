import { prisma } from '../lib/prisma';
import { GageService } from './gage-service';
import { CalibrationService } from './calibration-service';

export class DashboardService {
  /**
   * 取得本月需校正的儀器
   */
  static async getGagesDueThisMonth() {
    const allGages = await GageService.getAllGages();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return allGages.filter(gage => {
      if (gage.calType === '免校正') return false;
      const nextCal = new Date(gage.nextCalDate);
      return nextCal.getMonth() === currentMonth && nextCal.getFullYear() === currentYear;
    });
  }

  /**
   * 取得儀器統計數據
   */
  static async getDashboardStats() {
    const gages = await prisma.gage.findMany({
      where: { deletedAt: null }
    });
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let overdueCount = 0;
    let warningCount = 0;
    let passCount = 0;
    let dueThisMonthCount = 0;

    gages.forEach((gage) => {
      const status = CalibrationService.evaluateStatus(gage.nextCalDate, gage.calType);
      if (status === 'OVERDUE') overdueCount++;
      else if (status === 'WARNING') warningCount++;
      else passCount++;

      if (gage.calType !== '免校正') {
        const nextCal = new Date(gage.nextCalDate);
        if (nextCal.getMonth() === currentMonth && nextCal.getFullYear() === currentYear) {
          dueThisMonthCount++;
        }
      }
    });

    const total = gages.length;
    const complianceRate = total > 0 ? ((passCount + warningCount) / total) * 100 : 0;

    const pendingReviewCount = await prisma.calibrationRecord.count({
      where: { status: 'PENDING' }
    });

    return {
      total,
      overdueCount,
      warningCount,
      passCount,
      dueThisMonthCount,
      complianceRate: complianceRate.toFixed(1),
      pendingReviewCount
    };
  }

  /**
   * 取得所有主動提醒
   */
  static async getActiveReminders() {
    const rules = await prisma.reminderRule.findMany({ where: { enabled: true } });
    const allGages = await GageService.getAllGages();
    const today = new Date();
    
    const notifications: any[] = [];

    for (const rule of rules) {
      let targets = [];
      if (rule.type === 'ALL') {
        targets = allGages;
      } else if (rule.type === 'CATEGORY') {
        targets = allGages.filter(g => g.category === rule.target);
      } else if (rule.type === 'INDIVIDUAL') {
        targets = allGages.filter(g => g.id === rule.target);
      }

      for (const gage of targets) {
        const nextCal = new Date(gage.nextCalDate);
        
        if (rule.daysBefore === 0) {
          if (nextCal.getMonth() === today.getMonth() && nextCal.getFullYear() === today.getFullYear()) {
            notifications.push({ gage, rule });
          }
        } else {
          const diffDays = Math.ceil((nextCal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= rule.daysBefore && diffDays >= 0) {
            notifications.push({ gage, rule });
          }
        }
      }
    }

    const overdueGages = allGages.filter(g => g.calculatedStatus === 'OVERDUE');
    for (const gage of overdueGages) {
      notifications.push({ gage, rule: { type: 'SYSTEM', target: 'OVERDUE' } });
    }

    const uniqueNotifications = Array.from(new Map(notifications.map(n => [n.gage.id, n])).values());
    return uniqueNotifications;
  }
}
