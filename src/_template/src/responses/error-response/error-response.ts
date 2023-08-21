export const errorResponse = (
  status: number,
  message: string,
  error: unknown
) => ({
  status,
  message,
  error,
});
