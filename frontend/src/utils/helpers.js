/**
 * Shared utility functions for the frontend.
 */

export const scrollToElementWithOffset = (element, offset = 120) => {
  if (!element) return;

  const targetTop = element.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: targetTop,
    behavior: "smooth",
  });
};

export const normalizeCollectionResponse = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.results)) return responseData.results;
  if (Array.isArray(responseData?.logs)) return responseData.logs;
  if (Array.isArray(responseData?.reservations)) return responseData.reservations;
  if (Array.isArray(responseData?.courts)) return responseData.courts;
  return [];
};

export const normalizeSpaces = (value) => 
  value && typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
