"use client";

import { LayoutGrid, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewToggleProps {
  currentView: 'split' | 'tabbed';
  onViewChange: (view: 'split' | 'tabbed') => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex gap-2 border rounded-lg p-1">
      <Button
        variant={currentView === 'split' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('split')}
      >
        <Columns className="h-4 w-4 mr-2" />
        Split View
      </Button>
      <Button
        variant={currentView === 'tabbed' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('tabbed')}
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        Tabbed View
      </Button>
    </div>
  );
} 