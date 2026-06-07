'use server';
import { OrgService } from "@/services/org-service";
import { revalidatePath } from "next/cache";

export async function createLocationAction(name: string) {
  await OrgService.createLocation(name);
  revalidatePath('/settings/organization');
}

export async function updateLocationAction(id: string, name: string) {
  await OrgService.updateLocation(id, name);
  revalidatePath('/settings/organization');
}

export async function deleteLocationAction(id: string) {
  await OrgService.deleteLocation(id);
  revalidatePath('/settings/organization');
}

export async function createDepartmentAction(locationId: string, name: string) {
  await OrgService.createDepartment(locationId, name);
  revalidatePath('/settings/organization');
}

export async function updateDepartmentAction(id: string, name: string) {
  await OrgService.updateDepartment(id, name);
  revalidatePath('/settings/organization');
}

export async function deleteDepartmentAction(id: string) {
  await OrgService.deleteDepartment(id);
  revalidatePath('/settings/organization');
}

export async function createStaffAction(departmentId: string, name: string, staffId?: string) {
  await OrgService.createStaff(departmentId, name, staffId);
  revalidatePath('/settings/organization');
}

export async function updateStaffAction(id: string, data: { name?: string; staffId?: string }) {
  await OrgService.updateStaff(id, data);
  revalidatePath('/settings/organization');
}

export async function deleteStaffAction(id: string) {
  await OrgService.deleteStaff(id);
  revalidatePath('/settings/organization');
}

export async function updateDepartmentDefaultCustodianAction(deptId: string, staffId: string | null) {
  await OrgService.updateDepartmentDefaultCustodian(deptId, staffId);
  revalidatePath('/settings/organization');
}

export async function updateStaffInspectorStatusAction(staffId: string, isDefault: boolean) {
  await OrgService.updateStaffInspectorStatus(staffId, isDefault);
  revalidatePath('/settings/organization');
}

export async function getDefaultInspectorAction() {
  return await OrgService.getDefaultInspector();
}

export async function getAllLocationsAction() {
  return await OrgService.getAllLocations();
}

export async function importOrganizationAction(data: { location: string; department?: string; staff?: string }[]) {
  const result = await OrgService.bulkImportOrganization(data);
  revalidatePath('/settings/organization');
  return result;
}
