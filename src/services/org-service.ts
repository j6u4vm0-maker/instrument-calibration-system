import { prisma } from '../lib/prisma';

export class OrgService {
  /**
   * 取得所有廠區（包含部門與人員）
   */
  static async getAllLocations() {
    return await prisma.location.findMany({
      include: {
        departments: {
          include: {
            staff: true,
            _count: { select: { gages: true } }
          }
        },
        _count: { select: { gages: true } }
      },
      orderBy: { name: 'asc' }
    });
  }

  static async createLocation(name: string) {
    return await prisma.location.create({ data: { name } });
  }

  static async updateLocation(id: string, name: string) {
    return await prisma.location.update({ where: { id }, data: { name } });
  }

  static async deleteLocation(id: string) {
    return await prisma.location.delete({ where: { id } });
  }

  static async createDepartment(locationId: string, name: string) {
    return await prisma.department.create({ data: { name, locationId } });
  }

  static async updateDepartment(id: string, name: string) {
    return await prisma.department.update({ where: { id }, data: { name } });
  }

  static async deleteDepartment(id: string) {
    return await prisma.department.delete({ where: { id } });
  }

  static async createStaff(departmentId: string, name: string, staffId?: string) {
    return await prisma.staff.create({ data: { name, departmentId, staffId } });
  }

  static async updateStaff(id: string, data: { name?: string; staffId?: string; isDefaultInspector?: boolean }) {
    return await prisma.staff.update({ where: { id }, data });
  }

  static async updateDepartmentDefaultCustodian(deptId: string, staffId: string | null) {
    return await prisma.department.update({
      where: { id: deptId },
      data: { defaultCustodianId: staffId }
    });
  }

  static async updateStaffInspectorStatus(staffId: string, isDefault: boolean) {
    if (isDefault) {
      await prisma.staff.updateMany({
        where: { isDefaultInspector: true },
        data: { isDefaultInspector: false }
      });
    }
    return await prisma.staff.update({
      where: { id: staffId },
      data: { isDefaultInspector: isDefault }
    });
  }

  static async getDefaultInspector() {
    return await prisma.staff.findFirst({
      where: { isDefaultInspector: true }
    });
  }

  static async deleteStaff(id: string) {
    return await prisma.staff.delete({ where: { id } });
  }

  /**
   * 批次匯入組織資料 (廠區 -> 部門 -> 人員)
   */
  static async bulkImportOrganization(data: { location: string; department?: string; staff?: string }[]) {
    // 整理資料階層
    const locationMap = new Map<string, Map<string, Set<string>>>();
    for (const row of data) {
      if (!row.location) continue;
      const locName = String(row.location).trim();
      if (!locName) continue;

      if (!locationMap.has(locName)) {
        locationMap.set(locName, new Map());
      }
      
      if (row.department) {
        const deptName = String(row.department).trim();
        if (deptName) {
          const deptMap = locationMap.get(locName)!;
          if (!deptMap.has(deptName)) {
            deptMap.set(deptName, new Set());
          }
          if (row.staff) {
            const staffName = String(row.staff).trim();
            if (staffName) {
              deptMap.get(deptName)!.add(staffName);
            }
          }
        }
      }
    }

    return await prisma.$transaction(async (tx) => {
      let importedLocs = 0, importedDepts = 0, importedStaffs = 0;
      for (const [locName, depts] of locationMap.entries()) {
        let loc = await tx.location.findFirst({ where: { name: locName } });
        if (!loc) {
          loc = await tx.location.create({ data: { name: locName } });
          importedLocs++;
        }

        for (const [deptName, staffs] of depts.entries()) {
          let dept = await tx.department.findFirst({ where: { name: deptName, locationId: loc.id } });
          if (!dept) {
            dept = await tx.department.create({ data: { name: deptName, locationId: loc.id } });
            importedDepts++;
          }

          for (const staffName of staffs) {
            let staff = await tx.staff.findFirst({ where: { name: staffName, departmentId: dept.id } });
            if (!staff) {
              await tx.staff.create({ data: { name: staffName, departmentId: dept.id } });
              importedStaffs++;
            }
          }
        }
      }
      return { importedLocs, importedDepts, importedStaffs };
    }, { timeout: 30000 });
  }
}
