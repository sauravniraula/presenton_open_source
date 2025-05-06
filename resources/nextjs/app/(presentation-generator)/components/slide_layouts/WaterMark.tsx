import React from "react";
import { isDarkColor } from "../../utils/others";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useUsageTracking } from "@/hooks/useUsageTracking";

const WaterMark = ({ status }: { status: string }) => {
  const { currentColors } = useSelector((state: RootState) => state.theme);

  const isDark = isDarkColor(currentColors.slideBg);
  if (status === "free") {
    return (
      <div
        data-slide-element
        data-element-type="graph"
        data-element-id={`slide-footer-graph`}
        style={{
          background: isDark ? "#3A2A40" : "#FFFFFF",
          borderColor: isDark ? "#504255" : "#E7E6E6",
        }}
        className="rounded-md h-[40px] flex items-center gap-2 justify-center  border  shadow-sm p-2"
      >
        <img
          width={20}
          height={20}
          src="/generator/logo-icon.png"
          alt="Presenton"
        />
        <p
          style={{
            color: isDark ? "#ffffff" : "#000000",
          }}
          className="font-inter font-medium hidden md:block text-sm "
        >
          Made With Presenton
        </p>
      </div>
    );
  } else {
    return null;
  }
};

export default WaterMark;
