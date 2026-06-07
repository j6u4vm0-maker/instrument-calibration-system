"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function addReminderRuleAction(formData: FormData) {
  const type = formData.get("type") as string;
  const target = (formData.get("target") as string) || null;
  const daysBefore = parseInt(formData.get("daysBefore") as string);

  // Conflict detection
  const existing = await prisma.reminderRule.findFirst({
    where: {
      type,
      target,
      enabled: true
    }
  });

  if (existing) {
    return { 
      error: `此對象已存在生效中的提醒規則。如欲修改，請先刪除或停用現有規則。` 
    };
  }

  await prisma.reminderRule.create({
    data: {
      type,
      target,
      daysBefore,
    },
  });

  revalidatePath("/reminders");
  return { success: true };
}

export async function toggleReminderRuleAction(id: string, enabled: boolean) {
  await prisma.reminderRule.update({
    where: { id },
    data: { enabled },
  });

  revalidatePath("/reminders");
}

export async function deleteReminderRuleAction(id: string) {
  await prisma.reminderRule.delete({
    where: { id },
  });

  revalidatePath("/reminders");
}
