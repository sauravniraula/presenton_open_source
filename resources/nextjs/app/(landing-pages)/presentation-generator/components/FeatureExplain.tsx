import Wrapper from "@/components/Wrapper";
import React from "react";
import Image from "next/image";

const FeatureExplain = () => {
  return (
    <Wrapper className="py-10 lg:py-24 my-6 relative z-10">
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-10 justify-between items-center ">
        <div className="w-full lg:w-[50%]">
          <h2 className=" text-[20px] md:text-[28px] lg:text-[44px] xl:text-[52px] font-switzer lg:leading-[64px] leading-[40px] font-extrabold text-white  text-start">
            Work Smart, Present Smarter
          </h2>
          <p className="text-start text-white font-satoshi text-[12px] md:text-[15px] lg:text-[20px] font-[400] leading-[27px] mt-6   mx-auto">
            Focus on your ideas — we’ll turn them into clean, professional
            slides. Presenton handles the boring bits so you can impress without
            stress.
          </p>
        </div>
        <div className=" w-full lg:w-[50%] bg-green-50 h-[200px] sm:h-[250px] md:h-[350px] lg:h-[400px] relative">
          <Image
            src="/generator/feature.jpeg"
            alt="presenton feature explain"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </Wrapper>
  );
};

export default FeatureExplain;
