import React from 'react';
import { Button } from "@/components/ui/button";
import { GridIcon, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
    view: 'grid' | 'list';
    onViewChange: (view: 'grid' | 'list') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
    return (
        <div className="flex ">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewChange('grid')}
                className={cn(
                    'h-12 w-12 rounded-l-lg rounded-r-none border-r hover:bg-[#5141e5]/10 transition-all duration-300',
                    view === 'grid'
                        ? 'bg-[#5141e5] text-white'
                        : 'bg-white '
                )}
            >
                <GridIcon className="h-5 w-5" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewChange('list')}
                className={cn(
                    'h-12 w-12 rounded-r-lg rounded-l-none hover:bg-[#5141e5]/10  transition-all duration-300',
                    view === 'list'
                        ? 'bg-[#5141e5] text-white'
                        : 'bg-white '
                )}
            >
                <List className="h-5 w-5" />
            </Button>
        </div>
    );
}; 