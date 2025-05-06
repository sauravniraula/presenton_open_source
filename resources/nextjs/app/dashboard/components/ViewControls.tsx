import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ViewToggle } from './ViewToggle';
import { ChevronDown } from "lucide-react";

interface ViewControlsProps {

    sortBy: string;
    onSortChange: (value: string) => void;
}

export const ViewControls: React.FC<ViewControlsProps> = ({

    sortBy,
    onSortChange
}) => {
    return (
        <div className="flex items-center gap-2">
            {/* <ViewToggle view={view} onViewChange={onViewChange} /> */}

            <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="h-12 px-4 bg-white border rounded-lg w-[180px]">
                    <div className="flex items-center justify-between w-full">
                        <span className="text-base">Filter</span>

                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="date-created-new">Date Created (Newest)</SelectItem>
                    <SelectItem value="date-created-old">Date Created (Oldest)</SelectItem>
                    <SelectItem value="last-edited">Last Edited</SelectItem>
                    <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                    <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}; 