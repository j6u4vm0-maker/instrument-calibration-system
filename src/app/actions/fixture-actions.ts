"use server";

import { revalidatePath } from 'next/cache';
import { FixtureService } from '@/services/fixture-service';
import { FixtureCategoryService } from '@/services/fixture-category-service';

export async function getFixturesAction() {
  try {
    return await FixtureService.getAllFixtures();
  } catch (error) {
    console.error("Failed to fetch fixtures:", error);
    return [];
  }
}

export async function getFixtureAction(id: string) {
  try {
    return await FixtureService.getFixtureById(id);
  } catch (error) {
    console.error(`Failed to fetch fixture ${id}:`, error);
    return null;
  }
}

export async function createFixtureAction(data: any) {
  try {
    const fixture = await FixtureService.createFixture(data);
    revalidatePath('/fixtures');
    return { success: true, data: fixture };
  } catch (error: any) {
    console.error("Failed to create fixture:", error);
    return { success: false, error: error.message };
  }
}

export async function updateFixtureAction(id: string, data: any) {
  try {
    const fixture = await FixtureService.updateFixture(id, data);
    revalidatePath('/fixtures');
    return { success: true, data: fixture };
  } catch (error: any) {
    console.error("Failed to update fixture:", error);
    return { success: false, error: error.message };
  }
}

export async function updateFixtureStatusAction(id: string, status: string) {
  try {
    await FixtureService.updateFixtureStatus(id, status);
    revalidatePath('/fixtures');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update fixture status:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteFixtureAction(id: string) {
  try {
    await FixtureService.deleteFixture(id);
    revalidatePath('/fixtures');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete fixture:", error);
    return { success: false, error: error.message };
  }
}

export async function batchDeleteFixturesAction(ids: string[]) {
  try {
    await FixtureService.batchDeleteFixtures(ids);
    revalidatePath('/fixtures');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to batch delete fixtures:", error);
    return { success: false, error: error.message };
  }
}

export async function batchUpdateFixturesAction(ids: string[], data: any) {
  try {
    await FixtureService.batchUpdateFixtures(ids, data);
    revalidatePath('/fixtures');
    return { success: true };
  } catch (error: any) {
    console.error("Failed to batch update fixtures:", error);
    return { success: false, error: error.message };
  }
}


export async function getCategoriesAction() {
  try {
    const categories = await FixtureCategoryService.getAllFixtureCategories();
    return categories.map((c: any) => c.name);
  } catch (error: any) {
    console.error("Failed to get categories:", error);
    return [];
  }
}

export async function importFixturesAction(data: any[]) {
  try {
    const result = await FixtureService.bulkImportFixtures(data);
    revalidatePath('/fixtures');
    return { success: true, ...result };
  } catch (error: any) {
    console.error("Failed to import fixtures:", error);
    return { success: false, error: error.message };
  }
}
