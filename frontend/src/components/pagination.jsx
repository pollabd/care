'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Pagination({ page, pages, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" size="sm" onClick={onPrev} disabled={page <= 1}>
        <ChevronLeft />
        Prev
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {pages}
      </span>
      <Button variant="outline" size="sm" onClick={onNext} disabled={page >= pages}>
        Next
        <ChevronRight />
      </Button>
    </div>
  );
}
