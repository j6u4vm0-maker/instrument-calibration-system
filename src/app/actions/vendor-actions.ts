"use server";

import { VendorService } from "@/services/vendor-service";
import { revalidatePath } from "next/cache";

export async function createVendorAction(formData: FormData) {
  const vendorCode = formData.get("vendorCode") as string;
  const name = formData.get("name") as string;
  const shortName = formData.get("shortName") as string;
  const type = formData.get("type") as string || "OUTSOURCE";
  const contact = formData.get("contact") as string;
  const phone = formData.get("phone") as string;
  const mobile = formData.get("mobile") as string;
  const fax = formData.get("fax") as string;
  const email = formData.get("email") as string;
  const website = formData.get("website") as string;
  const serviceScope = formData.get("serviceScope") as string;
  const address = formData.get("address") as string;
  const notes = formData.get("notes") as string;

  if (!name) throw new Error("廠商名稱為必填");

  await VendorService.createVendor({
    vendorCode,
    name,
    shortName,
    type,
    contact,
    phone,
    mobile,
    fax,
    email,
    website,
    serviceScope,
    address,
    notes,
  });

  revalidatePath("/vendors");
}

export async function updateVendorAction(id: string, formData: FormData) {
  const vendorCode = formData.get("vendorCode") as string;
  const name = formData.get("name") as string;
  const shortName = formData.get("shortName") as string;
  const type = formData.get("type") as string;
  const contact = formData.get("contact") as string;
  const phone = formData.get("phone") as string;
  const mobile = formData.get("mobile") as string;
  const fax = formData.get("fax") as string;
  const email = formData.get("email") as string;
  const website = formData.get("website") as string;
  const serviceScope = formData.get("serviceScope") as string;
  const address = formData.get("address") as string;
  const notes = formData.get("notes") as string;

  const updateData: any = {
    vendorCode,
    name,
    shortName,
    contact,
    phone,
    mobile,
    fax,
    email,
    website,
    serviceScope,
    address,
    notes,
  };
  if (type) updateData.type = type;

  await VendorService.updateVendor(id, updateData);

  revalidatePath("/vendors");
}

export async function deleteVendorAction(id: string) {
  await VendorService.deleteVendor(id);
  revalidatePath("/vendors");
}

export async function importVendorsAction(data: any[]) {
  const result = await VendorService.bulkImportVendors(data);
  revalidatePath("/vendors");
  return result;
}

export async function getAllVendorsAction(type?: string) {
  try {
    return await VendorService.getAllVendors(type);
  } catch (error) {
    console.error("Failed to get vendors:", error);
    return [];
  }
}
