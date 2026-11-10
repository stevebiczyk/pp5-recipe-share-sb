export const formErrors = (error) => {
  const data = error.response?.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const result = Object.fromEntries(Object.entries(data).map(([key, value]) => [
      key, Array.isArray(value) ? value.map(String) : [String(value)],
    ]));
    if (result.detail) result.non_field_errors = result.detail;
    return result;
  }
  return { non_field_errors: ["Unable to complete the request. Please check your connection and try again."] };
};
