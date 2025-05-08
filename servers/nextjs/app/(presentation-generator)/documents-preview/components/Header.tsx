'use client'
import Wrapper from '@/components/Wrapper'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import UserAccount from '@/app/(presentation-generator)/components/UserAccount'
import { usePathname } from 'next/navigation'

const Header = ({ children }: { children: any }) => {
  const pathname = usePathname();

  return (
    <div className='bg-[#5146E5] w-full shadow-lg sticky top-0 z-50'>
      <Wrapper>
        <div className='flex items-center justify-between py-2'>
          <div>
            <Link href="/">
              <Image
                src="/logo-white.png"
                alt="Presentation logo"
                width={162}
                height={32}
                priority
              />
            </Link>
          </div>
          <div className='flex items-center gap-3 sm:gap-5 md:gap-10'>
            {children}
            <UserAccount showName={false} />
          </div>
        </div>
      </Wrapper>
    </div>
  )
}

export default Header