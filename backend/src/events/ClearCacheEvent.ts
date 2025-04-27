import { Event } from "./EventObserver";

export const EVENT_CLEAR_CACHE = "cache:clear";

export const ClearCacheEvent: Event = {
  type: EVENT_CLEAR_CACHE,
  data: null,
};
