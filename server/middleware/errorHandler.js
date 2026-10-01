export function errorHandler(error, req, res, next) {
  console.error(error);
  const status = error.statusCode || error.status || 500;
  res.status(status).json({ success: false, message: status >= 500 ? 'An unexpected error occurred.' : error.message });
}
