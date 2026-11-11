// What kind of device the page is running on — read once at load.

/* Low-resource devices (≤4 CPU cores or ≤4 GB memory, or Data Saver on)
 * get the same pages with lighter decoration (see LeadLeak.jsx, VideoCard.jsx).
 * Safari reports neither number, so iPhones count as full devices. */
export const LITE =
  typeof navigator !== 'undefined' &&
  ((navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 || !!navigator.connection?.saveData)

// Phones and tablets (a finger, not a mouse)
export const TOUCH = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
