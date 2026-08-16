'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Alert({ variant = 'error', children }) {
  const isError = variant === 'error';
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border px-3 py-2 text-sm',
        isError
          ? 'border-destructive/40 bg-destructive/5 text-destructive'
          : 'border-emerald-600/40 bg-emerald-600/5 text-emerald-700'
      )}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{children}</span>
    </div>
  );
}
