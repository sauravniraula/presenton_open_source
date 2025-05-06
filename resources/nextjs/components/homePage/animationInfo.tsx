import React, { ReactNode } from 'react';

interface AnimationInfoProps {
  title: string;
  description: string;
  media: ReactNode;
  imagePosition?: 'left' | 'right';
  className?: string;
}

const AnimationInfo = ({
  title,
  description,
  media,
  imagePosition = 'right',
  className = ''
}: AnimationInfoProps) => {
  return (
    <div className={`py-6 mx-auto px-4 md:px-8 ${className}`}>
      <div className="flex flex-col md:flex-row items-center justify-between max-w-[1280px] mx-auto gap-8 md:gap-16">
        {/* Text Content */}
        <div className={`w-full md:w-1/2 order-2 ${imagePosition === 'right' ? 'md:order-1' : 'md:order-2'}`}>
          <h2 className="text-center md:text-left text-[24px] md:text-[35px] lg:text-[45px] xl:text-[56px] font-switzer font-[800] leading-[32px] md:leading-[50px] lg:leading-[64px] tracking-[-1.12px]">
            {title}
          </h2>
          <p className="text-[#444] font-satoshi text-sm md:text-base font-[400] leading-[150%] mt-6 text-center md:text-left">
            {description}
          </p>
        </div>

        {/* Media Content */}
        <div className={`w-full md:w-1/2 order-1 ${imagePosition === 'right' ? 'md:order-2' : 'md:order-1'}`}>
          {media}
        </div>
      </div>
    </div>
  );
};

export default AnimationInfo;

