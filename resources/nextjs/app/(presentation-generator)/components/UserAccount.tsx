'use client'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'

const UserAccount = ({ showName = true }: { showName?: boolean }) => {
    const { signOut } = useAuth();
    const { user } = useSelector((state: RootState) => state.auth)
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className='flex items-center gap-1 cursor-pointer focus:outline-none'>
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.user_metadata.avatar_url} alt="User" />
                        <AvatarFallback>
                            {user?.user_metadata.name?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    {showName && <div className='hidden  sm:flex items-center'>
                        <p className='font-neue-montreal ml-2 font-medium text-white'>{user?.user_metadata.name}</p>
                        <ChevronDown className='w-4 h-4 ml-1 text-white' />
                    </div>}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0" align="end" side="bottom" sideOffset={8}>
                <nav className="flex flex-col" role="menu" tabIndex={-1}>
                    <Link
                        href="/dashboard"
                        prefetch={false}
                        className="flex items-center gap-2 px-4 py-4 hover:bg-gray-50 border-b border-gray-300 transition-colors outline-none focus:bg-gray-50"
                        role="menuitem"
                    >
                        <User className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700 text-sm font-medium font-satoshi">Dashboard</span>
                    </Link>
                    <Link
                        href="/profile"
                        prefetch={false}
                        className="flex items-center gap-2 px-4 py-4 hover:bg-gray-50 border-b border-gray-200 transition-colors outline-none focus:bg-gray-50"
                        role="menuitem"
                    >
                        <User className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700 text-sm font-medium font-satoshi">Profile</span>
                    </Link>
                    <div
                        onClick={signOut}
                        className="flex items-center gap-2 px-4 py-4 hover:bg-gray-50 transition-colors text-red-600 cursor-pointer outline-none focus:bg-gray-50"
                        role="menuitem"
                        tabIndex={0}
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium font-satoshi">Logout</span>
                    </div>
                </nav>
            </PopoverContent>
        </Popover>
    )
}

export default UserAccount
