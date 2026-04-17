const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

let _refreshPromise = null

async function refreshTokens() {
  const refreshToken = localStorage.getItem('finmo-refresh-token')
  if (!refreshToken) throw new Error('No refresh token')

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) throw new Error('Refresh failed')

  const { data } = await res.json()
  localStorage.setItem('finmo-access-token', data.accessToken)
  localStorage.setItem('finmo-refresh-token', data.refreshToken)
  return data.accessToken
}

async function request(path, options = {}) {
  const accessToken = localStorage.getItem('finmo-access-token')

  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...options.headers,
  }

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  // Token expirado → intentar refresh una vez
  if (res.status === 401 && localStorage.getItem('finmo-refresh-token')) {
    if (!_refreshPromise) {
      _refreshPromise = refreshTokens().finally(() => { _refreshPromise = null })
    }

    try {
      const newToken = await _refreshPromise
      headers.Authorization = `Bearer ${newToken}`
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
    } catch {
      localStorage.removeItem('finmo-access-token')
      localStorage.removeItem('finmo-refresh-token')
      window.dispatchEvent(new Event('finmo:session-expired'))
      throw new Error('Session expired')
    }
  }

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err = new Error(body.message ?? 'Request failed')
    err.status = res.status
    err.code = body.code
    err.errors = body.errors
    throw err
  }

  return body
}

export const api = {
  get:    (path, opts) => request(path, { method: 'GET', ...opts }),
  post:   (path, data, opts) => request(path, { method: 'POST', body: JSON.stringify(data), ...opts }),
  patch:  (path, data, opts) => request(path, { method: 'PATCH', body: JSON.stringify(data), ...opts }),
  put:    (path, data, opts) => request(path, { method: 'PUT', body: JSON.stringify(data), ...opts }),
  delete: (path, opts) => request(path, { method: 'DELETE', ...opts }),
}
