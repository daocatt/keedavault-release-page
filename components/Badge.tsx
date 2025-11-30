import React from 'react';
import { ChangeType } from '../types';

interface BadgeProps {
  type: ChangeType;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, className = '' }) => {
  const styles = {
    [ChangeType.Feature]: "bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-500/30",
    [ChangeType.BugFix]: "bg-rose-100 text-rose-800 ring-rose-600/20 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-500/30",
    [ChangeType.Improvement]: "bg-blue-100 text-blue-800 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-500/30",
    [ChangeType.Security]: "bg-purple-100 text-purple-800 ring-purple-600/20 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-500/30",
    [ChangeType.Deprecated]: "bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-500/30",
  };

  const labels = {
    [ChangeType.Feature]: "New Feature",
    [ChangeType.BugFix]: "Bug Fix",
    [ChangeType.Improvement]: "Improvement",
    [ChangeType.Security]: "Security",
    [ChangeType.Deprecated]: "Deprecated",
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[type]} ${className}`}>
      {labels[type]}
    </span>
  );
};