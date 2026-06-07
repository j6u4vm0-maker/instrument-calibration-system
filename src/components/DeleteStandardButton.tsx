'use client';

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteStandardAction } from "@/app/actions/standard-actions";
import { useRouter } from "next/navigation";

interface DeleteStandardButtonProps {
  id: string;
  name: string;
  linkedGages?: number;
}

export default function DeleteStandardButton({ id, name, linkedGages = 0 }: DeleteStandardButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (linkedGages > 0) {
      alert(`此標準目前正被 ${linkedGages} 台設備使用中，無法刪除。請先解除設備與此標準的連結。`);
      return;
    }

    if (!confirm(`確定要刪除允收標準「${name}」嗎？此操作無法復原。`)) return;

    setIsDeleting(true);
    try {
      const result = await deleteStandardAction(id);
      if (result.success) {
        router.refresh();
      } else {
        alert("刪除失敗：" + result.error);
      }
    } catch (error) {
      alert("刪除時發生錯誤");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
      title="刪除標準"
    >
      <Trash2 className={`w-4 h-4 ${isDeleting ? 'animate-pulse' : ''}`} />
    </button>
  );
}
