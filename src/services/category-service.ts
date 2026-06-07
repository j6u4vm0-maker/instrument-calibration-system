import { prisma } from '../lib/prisma';
import { LogService } from './log-service';

export class CategoryService {
  /**
   * 取得所有類別
   */
  static async getAllCategories() {
    // 檢查 Prisma Client 是否已更新 (防止 EPERM 導致的 generate 失敗造成崩潰)
    if (!(prisma as any).gageCategory) {
      console.warn("Prisma Client 尚未更新，請重新啟動 npm run dev 以啟用類別管理功能。");
      return [];
    }

    const categories = await prisma.gageCategory.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { gages: { where: { deletedAt: null } } }
        }
      }
    });

    return await Promise.all(
      categories.map(async (category) => {
        const fixtureCount = await prisma.fixture.count({
          where: {
            deletedAt: null,
            category: category.name,
          },
        });

        return {
          ...category,
          gageCount: category._count.gages,
          fixtureCount,
        };
      })
    );
  }

  /**
   * 建立類別
   */
  static async createCategory(name: string, description?: string) {
    if (!(prisma as any).gageCategory) throw new Error("Prisma Client out of sync. Please restart npm run dev.");
    
    const category = await prisma.gageCategory.create({
      data: { name, description }
    });

    await LogService.log({
      action: 'CREATE',
      module: 'CATEGORY',
      targetId: category.id,
      content: { name }
    });

    return category;
  }

  /**
   * 更新類別
   */
  static async updateCategory(id: string, name: string, description?: string) {
    if (!(prisma as any).gageCategory) throw new Error("Prisma Client out of sync.");
    const old = await prisma.gageCategory.findUnique({ where: { id } });
    
    const updated = await prisma.gageCategory.update({
      where: { id },
      data: { name, description }
    });

    // 如果名稱變更，同步更新 Gage 表中的字串類別 (維持相容性)
    if (old && old.name !== name) {
      await prisma.gage.updateMany({
        where: { category: old.name },
        data: { category: name }
      });
    }

    await LogService.log({
      action: 'UPDATE',
      module: 'CATEGORY',
      targetId: id,
      content: { name, description }
    });

    return updated;
  }

  /**
   * 刪除類別
   */
  static async deleteCategory(id: string) {
    if (!(prisma as any).gageCategory) throw new Error("Prisma Client out of sync.");
    const category = await prisma.gageCategory.findUnique({ where: { id } });
    
    const deleted = await prisma.gageCategory.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    // 刪除時，將原本屬於該類別的儀器標記為未分類 (可選)
    // if (category) {
    //   await prisma.gage.updateMany({
    //     where: { categoryId: id },
    //     data: { categoryId: null }
    //   });
    // }

    await LogService.log({
      action: 'DELETE',
      module: 'CATEGORY',
      targetId: id,
      content: { name: category?.name }
    });

    return deleted;
  }

  /**
   * 初始化類別 (從現有儀器資料抓取)
   */
  static async seedFromGages() {
    const gages = await prisma.gage.findMany({
      where: { deletedAt: null },
      select: { category: true },
      distinct: ['category']
    });

    for (const g of gages) {
      if (g.category) {
        await prisma.gageCategory.upsert({
          where: { name: g.category },
          update: {},
          create: { name: g.category }
        });
      }
    }
  }
}
