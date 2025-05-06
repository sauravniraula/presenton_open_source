import mixpanel from "mixpanel-browser";
import { MixpanelEventName } from "./enums";
import { MixpanelEventData } from "@/types/mixpanel";
import { User } from "@supabase/supabase-js";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;


export function initMixpanel() {
  if (!MIXPANEL_TOKEN) {
    console.warn('Mixpanel token is missing! Check your .env file.');
    return;
  }
  mixpanel.init(MIXPANEL_TOKEN, { autotrack: false });
}

export function initMixpanelUser(user: User | null) {
  if (!user) {
    mixpanel.reset();
    return;
  }
  mixpanel.identify(user.id);
  mixpanel.people.set({
    "$email": user.email,
    "$name": user.user_metadata.name,
    "$phone": user.user_metadata.phone,
    "$created": user.created_at,
  });
}

export function sendMpEvent(event: MixpanelEventName, data?: MixpanelEventData) {
  mixpanel.track(event, data);
}