import { useEffect } from "react";

const INACTIVITY_LIMIT_MS = 10 * 60 * 1000;
const THROTTLED_ACTIVITY_INTERVAL_MS = 1000;
const SESSION_RENEWAL_INTERVAL_MS = 60 * 1000;

export function useAutoLogout(
  enabled: boolean,
  onTimeout: () => void,
  onActivity: () => void,
): void {
  useEffect(() => {
    if (!enabled) return;

    let timeoutId = 0;
    let lastThrottledActivityAt = 0;
    let lastSessionRenewalAt = Date.now();

    const resetTimeout = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(onTimeout, INACTIVITY_LIMIT_MS);
    };

    const handleActivity = (event: Event) => {
      if (
        (event.type === "mousemove" || event.type === "scroll") &&
        Date.now() - lastThrottledActivityAt < THROTTLED_ACTIVITY_INTERVAL_MS
      ) {
        return;
      }
      if (event.type === "mousemove" || event.type === "scroll") {
        lastThrottledActivityAt = Date.now();
      }
      resetTimeout();
      if (Date.now() - lastSessionRenewalAt >= SESSION_RENEWAL_INTERVAL_MS) {
        lastSessionRenewalAt = Date.now();
        onActivity();
      }
    };

    const passiveOptions: AddEventListenerOptions = {
      capture: true,
      passive: true,
    };
    const activityEvents = [
      "mousemove",
      "keydown",
      "click",
      "mousedown",
      "scroll",
      "touchstart",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, passiveOptions);
    });
    resetTimeout();

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity, passiveOptions);
      });
    };
  }, [enabled, onActivity, onTimeout]);
}
