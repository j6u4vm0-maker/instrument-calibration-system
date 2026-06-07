import React from 'react';
import { GageService } from "@/services/gage-service";
import { notFound } from "next/navigation";
import BatchEditForm from "@/components/BatchEditForm";

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const batch = await GageService.getBatchById(id);

  if (!batch) {
    notFound();
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <BatchEditForm batch={batch} />
    </div>
  );
}
