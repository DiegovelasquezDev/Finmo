export function success(res, data, statusCode = 200, meta = {}) {
  return res.status(statusCode).json({ success: true, data, ...meta });
}

export function paginated(res, data, { page, limit, total }) {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
