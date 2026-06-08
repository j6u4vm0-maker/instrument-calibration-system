import { Fixture } from '@prisma/client';
import { FixtureCategoryService } from './fixture-category-service';
import { prisma } from '../lib/prisma';
import { CalibrationService } from './calibration-service';
import { LogService } from './log-service';

export class FixtureService {
  private static normalizeText(value: any) {
    return String(value ?? '').trim();
  }

  private static isEmpty(value: any) {
    return value === null || value === undefined || String(value).trim() === '';
  }

  private static parseExcelDate(value: any) {
    if (FixtureService.isEmpty(value)) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

    if (typeof value === 'number') {
      const parsed = new Date((value - 25569) * 86400 * 1000);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    const text = FixtureService.normalizeText(value);
    if (!text) return null;

    const numeric = Number(text);
    if (!Number.isNaN(numeric) && numeric > 10000 && numeric < 100000) {
      const parsed = new Date((numeric - 25569) * 86400 * 1000);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    const parsed = new Date(text.replace(/\./g, '/').replace(/-/g, '/'));
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private static calculateNextCalDate(lastCalDate: Date | null, cycle: number) {
    if (!lastCalDate || isNaN(lastCalDate.getTime())) return null;
    const nextCalDate = new Date(lastCalDate);
    if (cycle > 0) {
      nextCalDate.setMonth(nextCalDate.getMonth() + cycle);
    }
    return nextCalDate;
  }

  private static formatFixtureId(id: any, serialNo: any) {
    const baseId = FixtureService.normalizeText(id);
    const serial = FixtureService.normalizeText(serialNo);
    if (!baseId) return '';
    if (!serial) return baseId;
    if (baseId.includes('(')) return baseId;
    if (serial.startsWith('(') && serial.endsWith(')')) return `${baseId}${serial}`;
    return `${baseId}(${serial})`;
  }

  private static buildTextBlock(value: any) {
    const text = FixtureService.normalizeText(value);
    if (!text) return null;
    return text.replace(/\r?\n+/g, '\n');
  }

  private static splitNameCandidates(value: any) {
    const text = FixtureService.normalizeText(value);
    if (!text) return [];
    return text
      .split(/\r?\n|[\t,，;；]/g)
      .map(v => v.trim())
      .filter(Boolean);
  }

  private static async resolveStaffId(name: any, departmentId: string | null) {
    const candidates = FixtureService.splitNameCandidates(name);
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

  private static async resolveVendorId(value: any) {
    const candidates = FixtureService.splitNameCandidates(value);
    if (candidates.length === 0) return null;

    for (const candidate of candidates) {
      const exact = await prisma.vendor.findFirst({ where: { name: candidate } });
      if (exact) return exact.id;
    }

    const created = await prisma.vendor.create({
      data: { name: candidates[0] },
    });
    return created.id;
  }

  private static normalizeImportRow(row: any) {
    const id = FixtureService.formatFixtureId(row.id, row.serialNo);
    return {
      ...row,
      id,
      name: FixtureService.buildTextBlock(row.name),
      brand: FixtureService.normalizeText(row.brand || row.spec),
      serialNo: FixtureService.normalizeText(row.serialNo),
      applicablePart: FixtureService.buildTextBlock(row.applicablePart),
      drawingNo: FixtureService.buildTextBlock(row.drawingNo),
      manual: FixtureService.buildTextBlock(row.manual),
      precision: FixtureService.normalizeText(row.precision),
      displayType: FixtureService.normalizeText(row.displayType),
      category: FixtureService.normalizeText(row.category),
      calPoints: FixtureService.buildTextBlock(row.calPoints),
      acceptance: FixtureService.buildTextBlock(row.acceptance),
      tafLogo: FixtureService.normalizeText(row.tafLogo),
      notes: FixtureService.buildTextBlock(row.notes),
      status: FixtureService.normalizeText(row.status) || 'IN_USE',
      calType: FixtureService.normalizeText(row.calType) || 'INTERNAL',
      calibrationCycle: Number.parseInt(FixtureService.normalizeText(row.calibrationCycle), 10),
      entryDate: FixtureService.parseExcelDate(row.entryDate),
      lastCalDate: FixtureService.parseExcelDate(row.lastCalDate),
      nextCalDate: FixtureService.parseExcelDate(row.nextCalDate),
      manager: FixtureService.normalizeText(row.manager),
      rdIssuer: FixtureService.normalizeText(row.rdIssuer),
      vendor: FixtureService.normalizeText(row.vendor),
      department: FixtureService.normalizeText(row.department),
    };
  }

  static async getAllFixtures() {
    const fixtures = await prisma.fixture.findMany({
      where: { deletedAt: null },
      include: {
        acceptanceStandard: { include: { criteria: true } },
        records: {
          where: { deletedAt: null },
          orderBy: { calDate: 'desc' },
          take: 1,
        },
        locationRef: true,
        departmentRef: true,
        custodianRef: true,
        managerRef: true,
        rdIssuerRef: true,
        vendorRef: true,
        categoryRef: true,
      },
      orderBy: { id: 'asc' },
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return fixtures.map((fixture) => {
      const nextCal = fixture.nextCalDate ? new Date(fixture.nextCalDate) : null;
      let isDueThisMonth = false;
      if (nextCal && !isNaN(nextCal.getTime()) && fixture.calType !== 'NO_CAL') {
        isDueThisMonth = nextCal.getMonth() === currentMonth && nextCal.getFullYear() === currentYear;
      }

      return {
        ...fixture,
        spec: fixture.brand || (fixture as any).spec || '',
        calculatedStatus: CalibrationService.evaluateStatus(fixture.nextCalDate, fixture.calType),
        isCalibrating: fixture.records ? fixture.records.some(r => r.status === 'PENDING' || r.status === 'DRAFT') : false,
        isDueThisMonth,
      };
    });
  }

  static async getFixtureById(id: string) {
    const fixture = await prisma.fixture.findFirst({
      where: { id, deletedAt: null },
      include: {
        acceptanceStandard: { include: { criteria: true } },
        records: {
          where: { deletedAt: null },
          include: { details: true, vendor: true },
          orderBy: { calDate: 'desc' },
        },
        custodianRef: true,
        managerRef: true,
        rdIssuerRef: true,
        locationRef: true,
        departmentRef: true,
        vendorRef: true,
      },
    });

    if (!fixture) return null;

    return {
      ...fixture,
      spec: fixture.brand || (fixture as any).spec || '',
      calculatedStatus: CalibrationService.evaluateStatus(fixture.nextCalDate, fixture.calType),
      isCalibrating: fixture.records ? fixture.records.some(r => r.status === 'PENDING' || r.status === 'DRAFT') : false,
    };
  }

  static async createFixture(data: any) {
    const { id, ...rest } = data;
    const lastCalDate = data.lastCalDate ? new Date(data.lastCalDate) : new Date();
    const cycle = data.calibrationCycle || 12;
    const nextCalDate = data.nextCalDate ? new Date(data.nextCalDate) : CalibrationService.calculateNextCalDate(lastCalDate, cycle);
    const categoryName = String(data.category || '').trim();
    const category = categoryName ? await (prisma as any).fixtureCategory.findUnique({ where: { name: categoryName } }) : null;

    const fixture = await prisma.fixture.create({
      data: {
        id,
        ...rest,
        categoryId: category?.id || null,
        lastCalDate,
        nextCalDate,
        status: data.status || 'IN_USE',
      },
    });

    await LogService.log({
      action: 'CREATE',
      module: 'FIXTURE',
      targetId: fixture.id,
      content: { name: fixture.name, categoryId: fixture.categoryId },
    });

    return fixture;
  }

  static async updateFixture(id: string, data: Partial<Fixture>) {
    const { id: _, createdAt: __, updatedAt: ___, ...updateData } = data as any;

    if ((updateData.calibrationCycle !== undefined || updateData.lastCalDate !== undefined) && updateData.nextCalDate === undefined) {
      const existing = await prisma.fixture.findUnique({ where: { id } });
      if (existing) {
        const cycle = updateData.calibrationCycle !== undefined ? updateData.calibrationCycle : existing.calibrationCycle;
        const lastCal = updateData.lastCalDate !== undefined ? new Date(updateData.lastCalDate) : new Date(existing.lastCalDate);

        if (cycle > 0 && !isNaN(lastCal.getTime())) {
          const nextCal = new Date(lastCal);
          nextCal.setMonth(nextCal.getMonth() + cycle);
          updateData.nextCalDate = nextCal;
        }
      }
    }

    for (const key of Object.keys(updateData)) {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    }

    if (updateData.lastCalDate) {
      const d = new Date(updateData.lastCalDate);
      if (!isNaN(d.getTime())) updateData.lastCalDate = d;
      else delete updateData.lastCalDate;
    }

    if (updateData.nextCalDate) {
      const d = new Date(updateData.nextCalDate);
      if (!isNaN(d.getTime())) updateData.nextCalDate = d;
      else delete updateData.nextCalDate;
    }

    if (typeof updateData.category === 'string') {
      const categoryName = updateData.category.trim();
      if (categoryName) {
        const category = await (prisma as any).fixtureCategory.findUnique({ where: { name: categoryName } });
        updateData.categoryId = category?.id || null;
      } else {
        updateData.categoryId = null;
      }
    }

    const updated = await prisma.fixture.update({
      where: { id },
      data: updateData,
    });

    await LogService.log({
      action: 'UPDATE',
      module: 'FIXTURE',
      targetId: id,
      content: updateData,
    });

    return updated;
  }

  static async deleteFixture(id: string) {
    const deleted = await prisma.fixture.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await LogService.log({
      action: 'DELETE',
      module: 'FIXTURE',
      targetId: id,
      content: { id },
    });

    return deleted;
  }

  static async updateFixtureStatus(id: string, status: string) {
    const updated = await prisma.fixture.update({
      where: { id },
      data: { status },
    });

    await LogService.log({
      action: 'UPDATE',
      module: 'FIXTURE',
      targetId: id,
      content: { status },
    });

    return updated;
  }

  static async batchUpdateFixtures(ids: string[], data: any) {
    const updateData = { ...data };

    if (updateData.standardId) {
      const standard = await prisma.acceptanceStandard.findUnique({
        where: { id: updateData.standardId },
        include: { criteria: true, points: true },
      });

      if (standard) {
        if (standard.points && standard.points.length > 0) {
          updateData.calPoints = standard.points
            .map((p: any) => `${p.category}: ${p.points}${p.unit || ''}`)
            .join('\n');
        } else if (standard.defaultPoints) {
          updateData.calPoints = standard.defaultPoints;
        }

        if (standard.criteria && standard.criteria.length > 0) {
          updateData.acceptance = standard.criteria
            .map((c: any) => {
              const range = (c.rangeStart !== null && c.rangeEnd !== null)
                ? `${c.rangeStart}-${c.rangeEnd}${c.unit || ''}`
                : '';
              const cat = (c.category || '').trim();
              return `${cat}${range ? ' ' + range : ''}: +${c.tolerancePlus}/-${Math.abs(c.toleranceMinus)}`;
            })
            .join('\n');
        }

        if (standard.defaultCycle && !updateData.calibrationCycle) {
          updateData.calibrationCycle = standard.defaultCycle;
        }

        if (standard.defaultPrecision && !updateData.precision) {
          updateData.precision = standard.defaultPrecision;
        }

        if (standard.targetCategory && !updateData.categoryId) {
          const category = await (prisma as any).fixtureCategory.findUnique({ where: { name: standard.targetCategory } });
          updateData.categoryId = category?.id || null;
        }
      }
    }

    const updated = await prisma.fixture.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    });

    await LogService.log({
      action: 'UPDATE',
      module: 'FIXTURE',
      targetId: 'BATCH',
      content: { ids, data: updateData },
    });

    return updated;
  }

  static async batchDeleteFixtures(ids: string[]) {
    const deleted = await prisma.fixture.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    });

    await LogService.log({
      action: 'DELETE',
      module: 'FIXTURE',
      targetId: 'BATCH',
      content: { ids },
    });

    return deleted;
  }

  static async getCategories() {
    const categories = await FixtureCategoryService.getAllFixtureCategories();
    return categories.map((c: any) => c.name);
  }

  static async bulkImportFixtures(data: any[]) {
    let imported = 0;
    let updated = 0;

    for (const row of data) {
      const normalized = FixtureService.normalizeImportRow(row);
      if (!normalized.id || !normalized.name) continue;

      let departmentId: string | null = null;
      if (normalized.department) {
        let dept = await prisma.department.findFirst({ where: { name: normalized.department } });
        if (!dept) {
          let loc = await prisma.location.findFirst();
          if (!loc) loc = await prisma.location.create({ data: { name: '未分類廠區' } });
          dept = await prisma.department.create({ data: { name: normalized.department, locationId: loc.id } });
        }
        departmentId = dept.id;
      }

      let managerId: string | null = null;
      if (normalized.manager) {
        managerId = await FixtureService.resolveStaffId(normalized.manager, departmentId);
      }

      let rdIssuerId: string | null = null;
      if (normalized.rdIssuer) {
        rdIssuerId = await FixtureService.resolveStaffId(normalized.rdIssuer, departmentId);
      }

      let vendorId: string | null = null;
      if (normalized.vendor) {
        vendorId = await FixtureService.resolveVendorId(normalized.vendor);
      }

      const existing = await prisma.fixture.findUnique({
        where: { id: normalized.id },
      });
      const categoryName = normalized.category || null;
      const category = categoryName ? await (prisma as any).fixtureCategory.findUnique({ where: { name: categoryName } }) : null;

      if (existing) {
        const cycle = Number.isFinite(normalized.calibrationCycle) && normalized.calibrationCycle > 0
          ? normalized.calibrationCycle
          : existing.calibrationCycle;
        const lastCalDate = normalized.lastCalDate || existing.lastCalDate;
        const nextCalDate = FixtureService.calculateNextCalDate(lastCalDate, cycle);

        await prisma.fixture.update({
          where: { id: normalized.id },
          data: {
            name: normalized.name,
            brand: normalized.brand || existing.brand,
            serialNo: normalized.serialNo || existing.serialNo,
            applicablePart: normalized.applicablePart || existing.applicablePart,
            drawingNo: normalized.drawingNo || existing.drawingNo,
            manual: normalized.manual || existing.manual,
            precision: normalized.precision || existing.precision,
            displayType: normalized.displayType || existing.displayType,
            categoryId: category?.id || existing.categoryId,
            calPoints: normalized.calPoints || existing.calPoints,
            acceptance: normalized.acceptance || existing.acceptance,
            tafLogo: normalized.tafLogo || existing.tafLogo,
            notes: normalized.notes || existing.notes,
            status: normalized.status || existing.status,
            entryDate: normalized.entryDate || existing.entryDate,
            calType: normalized.calType || existing.calType,
            calibrationCycle: cycle,
            lastCalDate,
            nextCalDate: nextCalDate || undefined,
            departmentId: departmentId || existing.departmentId,
            managerId: managerId || existing.managerId,
            manager: normalized.manager || existing.manager,
            rdIssuerId: rdIssuerId || existing.rdIssuerId,
            vendorId: vendorId || existing.vendorId,
          },
        });
        updated++;
      } else {
        const cycle = Number.isFinite(normalized.calibrationCycle) && normalized.calibrationCycle > 0
          ? normalized.calibrationCycle
          : 12;
        const lastCalDate = normalized.lastCalDate || new Date();
        const nextCalDate = FixtureService.calculateNextCalDate(lastCalDate, cycle) || new Date(lastCalDate);

        await prisma.fixture.create({
          data: {
            id: normalized.id,
            name: normalized.name,
            brand: normalized.brand || null,
            serialNo: normalized.serialNo || null,
            applicablePart: normalized.applicablePart || null,
            drawingNo: normalized.drawingNo || null,
            manual: normalized.manual || null,
            precision: normalized.precision || null,
            displayType: normalized.displayType || null,
            categoryId: category?.id || null,
            calPoints: normalized.calPoints || null,
            acceptance: normalized.acceptance || null,
            tafLogo: normalized.tafLogo || null,
            notes: normalized.notes || null,
            status: normalized.status || 'IN_USE',
            entryDate: normalized.entryDate,
            calType: normalized.calType || 'INTERNAL',
            calibrationCycle: cycle,
            lastCalDate,
            nextCalDate: nextCalDate || undefined,
            departmentId,
            managerId,
            manager: normalized.manager || null,
            rdIssuerId,
            vendorId,
          },
        });
        imported++;
      }
    }

    await LogService.log({
      action: 'CREATE',
      module: 'FIXTURE',
      targetId: 'IMPORT',
      content: { imported, updated },
    });

    return { imported, updated };
  }
}
