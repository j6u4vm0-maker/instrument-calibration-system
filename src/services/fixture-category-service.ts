import { prisma } from '../lib/prisma';
import { LogService } from './log-service';

export class FixtureCategoryService {
  static async getAllFixtureCategories() {
    const db = prisma as any;
    if (!db.fixtureCategory) return [];

    const categories = await db.fixtureCategory.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        fixtures: { where: { deletedAt: null }, select: { id: true } },
      },
    });

    return categories.map((category: any) => ({
      ...category,
      fixtureCount: category.fixtures.length,
    }));
  }

  static async createFixtureCategory(name: string, description?: string) {
    const db = prisma as any;
    if (!db.fixtureCategory) throw new Error('FixtureCategory model is not available.');
    const normalizedName = name.trim();
    if (!normalizedName) throw new Error('Category name is required.');

    const existing = await db.fixtureCategory.findUnique({ where: { name: normalizedName } });
    const category = existing
      ? await db.fixtureCategory.update({
          where: { id: existing.id },
          data: { deletedAt: null, description: description ?? existing.description ?? undefined },
        })
      : await db.fixtureCategory.create({
          data: { name: normalizedName, description },
        });

    await LogService.log({
      action: 'CREATE',
      module: 'FIXTURE',
      targetId: category.id,
      content: { name: normalizedName, restored: Boolean(existing) },
    });

    return category;
  }

  static async updateFixtureCategory(id: string, name: string, description?: string) {
    const db = prisma as any;
    if (!db.fixtureCategory) throw new Error('FixtureCategory model is not available.');
    const old = await db.fixtureCategory.findUnique({ where: { id } });
    const updated = await db.fixtureCategory.update({
      where: { id },
      data: { name: name.trim(), description },
    });

    await db.fixture.updateMany({
      where: { categoryId: old?.id || id },
      data: { categoryId: updated.id, category: updated.name },
    });

    await LogService.log({
      action: 'UPDATE',
      module: 'FIXTURE',
      targetId: id,
      content: { name: updated.name, description },
    });

    return updated;
  }

  static async deleteFixtureCategory(id: string) {
    const db = prisma as any;
    if (!db.fixtureCategory) throw new Error('FixtureCategory model is not available.');
    const category = await db.fixtureCategory.findUnique({ where: { id } });
    const deleted = await db.fixtureCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await LogService.log({
      action: 'DELETE',
      module: 'FIXTURE',
      targetId: id,
      content: { name: category?.name },
    });

    return deleted;
  }
}
