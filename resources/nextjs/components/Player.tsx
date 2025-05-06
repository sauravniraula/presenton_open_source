import React, { forwardRef } from 'react';
import { Player as RemotionPlayer } from '@remotion/player';

const Player = forwardRef((props: any, ref: any) => {
  return <RemotionPlayer {...props} ref={ref} />;
});

Player.displayName = 'Player';

export default Player;
