'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CustomDropdownProps {
    options: string[]
    placeholder?: string
    onSelect: (option: string) => void
    className?: string
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    options,
    placeholder = 'Select an option',
    onSelect,
    className
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selected, setSelected] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const toggle = () => setIsOpen(!isOpen)

    const handleSelect = (option: string) => {
        setSelected(option)
        setIsOpen(false)
        onSelect(option)
    }

    return (
        <div
            ref={dropdownRef}
            className={cn(
                "relative min-w-[155px] select-none",
                className
            )}
        >
            <div
                onClick={toggle}
                className="flex justify-between gap-4 cursor-pointer px-4 py-3  border border-[#3d3d3d] rounded-lg"
            >
                <span>{selected || placeholder}</span>
                <span className="float-right">▼</span>
            </div>
            {isOpen && (
                <ul className="absolute top-[105%] left-0 right-0  rounded-lg list-none p-0 m-0 max-h-[200px] overflow-y-auto z-20 scrollbar-hide">
                    {options.map((option) => (
                        <li
                            key={option}
                            onClick={() => handleSelect(option)}
                            className="p-2.5 cursor-pointer text-sm font-medium "
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default CustomDropdown 