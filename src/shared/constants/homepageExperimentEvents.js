export const HOMEPAGE_TRACK_EVENTS = {
  VARIANT_SEEN: 'variant_seen',
  QUICK_ACTION_CLICK: 'quick_action_click',
  MOBILE_STICKY_CLICK: 'mobile_sticky_click',
  FILTER_CLICK: 'filter_click',
};

export const HOMEPAGE_TRACK_EVENT_VALUES = new Set(
  Object.values(HOMEPAGE_TRACK_EVENTS)
);
