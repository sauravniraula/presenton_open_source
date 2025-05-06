import React from 'react';
import Image from 'next/image';
import Wrapper from '../Wrapper';

const USE_CASES = [
  {
    title: "Sales Video",
    description: "Effortlessly transform your PowerPoint presentations into compelling sales videos that help you educate and connect team leads, driving better results with AI."
  },
  {
    title: "Training Video",
    description: "Turn any PowerPoint presentation into an engaging training video to educate your audience, team, or students effectively and at scale."
  },
  {
    title: "Project Explainers",
    description: "Use generated AI insights to create meetings or to review presentations. Share your projects with stakeholders or teams through professional, polished videos created in just a few clicks."
  },
  {
    title: "Pitch Deck Video",
    description: "Turn your pitch deck into a captivating video presentation that ensures your ideas are delivered with clarity and impact, perfect for investors and partners."
  }
];

const ApplicationShowcase = () => {
  return (
    <Wrapper className="py-12 sm:py-16 lg:py-20">
      <div className="relative max-w-[1060px] mx-auto items-center flex flex-col lg:flex-row gap-6 lg:gap-10 justify-between">
        <div className="w-full lg:w-1/2 px-4 sm:px-6 lg:px-0">
          <h2 className="text-[32px] md:text-[56px] font-switzer font-[800] leading-[40px] md:leading-[64px] tracking-[-1.12px] text-black text-center lg:text-left">
            Multiple Use Cases
          </h2>
          <p className="text-[#444] font-satoshi text-[16px] md:text-[18px] font-[400] leading-[150%] mt-4 md:mt-6 text-center lg:text-left">
            Transform your presentations into engaging videos for sales, training, project explanations, or pitch decks. Our AI helps you create professional content for any purpose.
          </p>
        </div>

        <div className="w-full lg:w-1/2">
          <div className="flex lg:flex-col gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4 lg:pb-0">
            {USE_CASES.map((useCase, index) => (
              <div
                key={useCase.title}
                className={`
                  flex-shrink-0 w-[60%] sm:w-[55%] lg:w-full snap-center
                  ${index === 0 ? 'ml-4 sm:ml-6 lg:ml-0' : ''} 
                  ${index === USE_CASES.length - 1 ? 'mr-4 sm:mr-6 lg:mr-0' : ''}
                `}
              >
                <div className="bg-[#5146E5] text-white p-5 sm:p-6 rounded-lg h-full">
                  <h3 className="font-switzer font-bold text-lg sm:text-xl mb-2 sm:mb-3">
                    {useCase.title}
                  </h3>
                  <p className="font-satoshi text-sm sm:text-base ">
                    {useCase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default ApplicationShowcase;
