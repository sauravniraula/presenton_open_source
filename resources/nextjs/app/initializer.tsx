'use client';

import { initMixpanel } from "@/utils/mixpanel/services";
import { useEffect } from "react";

export function Initializer() {

  useEffect(() => {
    initMixpanel();
  }, []);


  return <></>;
}
