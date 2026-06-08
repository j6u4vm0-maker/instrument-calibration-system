"use server";

import { CategoryService } from "@/services/category-service";
import { FixtureCategoryService } from "@/services/fixture-category-service";
import { revalidatePath } from "next/cache";

export async function getAllCategoriesAction() {
  return await CategoryService.getAllCategories();
}

export async function createCategoryAction(name: string, description?: string) {
  const result = await CategoryService.createCategory(name, description);
  revalidatePath("/gages");
  return result;
}

export async function updateCategoryAction(id: string, name: string, description?: string) {
  const result = await CategoryService.updateCategory(id, name, description);
  revalidatePath("/gages");
  return result;
}

export async function deleteCategoryAction(id: string) {
  const result = await CategoryService.deleteCategory(id);
  revalidatePath("/gages");
  return result;
}

export async function seedCategoriesAction() {
  await CategoryService.seedFromGages();
  revalidatePath("/gages");
}

export async function getAllFixtureCategoriesAction() {
  return await FixtureCategoryService.getAllFixtureCategories();
}

export async function createFixtureCategoryAction(name: string, description?: string) {
  const result = await FixtureCategoryService.createFixtureCategory(name, description);
  revalidatePath("/fixtures");
  return result;
}

export async function updateFixtureCategoryAction(id: string, name: string, description?: string) {
  const result = await FixtureCategoryService.updateFixtureCategory(id, name, description);
  revalidatePath("/fixtures");
  return result;
}

export async function deleteFixtureCategoryAction(id: string) {
  const result = await FixtureCategoryService.deleteFixtureCategory(id);
  revalidatePath("/fixtures");
  return result;
}
