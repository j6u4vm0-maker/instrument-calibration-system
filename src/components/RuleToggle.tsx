"use client";

import { toggleReminderRuleAction } from "@/app/actions/reminder-actions";
import { useState } from "react";

export function RuleToggle({ id, enabled }: { id: string, enabled: boolean }) {
  const [isOn, setIsOn] = useState(enabled);

  const handleToggle = async () => {
    const newState = !isOn;
    setIsOn(newState);
    await toggleReminderRuleAction(id, newState);
  };

  return (
    <button 
      onClick={handleToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        isOn ? 'bg-kst-blue' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isOn ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
