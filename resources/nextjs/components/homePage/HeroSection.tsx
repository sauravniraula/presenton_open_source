import Image from "next/image";
import Header from "./header";
import Link from "next/link";
import MainFeature from "./MainFeature";

export default function HeroSection() {
  return (
    <>
      <div className="relative h-[900px] sm:h-[1200px] lg:h-[1500px] xl:h-[1650px]">

        <img src="/rounded-box.svg" alt="curved box" className='hidden lg:block absolute top-0 left-0 w-full  object-top  md:h-[1650px]   ' />
        <img src="/rounded-box-mobile.svg" alt="rounded-box" className="absolute lg:hidden h-[780px] sm:h-[1100px] md:h-[1150px] left-0 w-full " />
        <div className='relative z-10 shadow-xl  max-w-[1060px] my-6 w-[90%] h-[200px] sm:h-[400px] md:h-[450px] lg:h-[600px] mx-auto bg-blue-100'>
          <video src="/generator/PresentonAnimation.mp4" autoPlay loop muted playsInline className='w-full h-full object-cover' />
        </div>

        <MainFeature />
      </div>
    </>
  );
}
