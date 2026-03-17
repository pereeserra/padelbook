export const getResponseData = (response, fallback = null) => {
  return response?.data?.data ?? fallback;
};

export const getResponseList = (response) => {
  const data = response?.data?.data;
  return Array.isArray(data) ? data : [];
};

export const getResponseMessage = (response, fallback = "") => {
  return response?.data?.message ?? fallback;
};

export const getErrorMessage = (error, fallback = "S'ha produït un error") => {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};