'use client'
import { MixpanelEventName } from '@/utils/mixpanel/enums';
import { sendMpEvent } from '@/utils/mixpanel/services';
import React, { useEffect } from 'react'

const MixpanelPageLogging = ({ pageName }: { pageName: string }) => {

  useEffect(() => {
    sendMpEvent(MixpanelEventName.pageOpened, {
      page: pageName
    });
  }, []);

  return <></>
}

export default MixpanelPageLogging
