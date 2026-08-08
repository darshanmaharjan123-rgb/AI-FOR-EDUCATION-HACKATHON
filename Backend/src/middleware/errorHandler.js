function errorHandler(err, req, res, next) {
  console.error('❌ Global Error Handler caught:', err);
  
  const statusCode = err.status || res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = errorHandler;
