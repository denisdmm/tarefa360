
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Lock, Unlock } from "lucide-react";

interface StatusToggleSwitchProps {
  status: 'Ativo' | 'Inativo';
  onToggle: () => void;
}

export const StatusToggleSwitch = ({ status, onToggle }: StatusToggleSwitchProps) => {
  const isEnabled = status === 'Ativo';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isEnabled}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isEnabled ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
      )}
    >
      <span className="sr-only">Use to toggle user status</span>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center",
          isEnabled ? "translate-x-5 bg-green-500" : "translate-x-0 bg-white"
        )}
      >
        {isEnabled ? (
          <Lock className="h-3 w-3 text-white" />
        ) : (
          <Unlock className="h-3 w-3 text-gray-700" />
        )}
      </span>
    </button>
  );
};
