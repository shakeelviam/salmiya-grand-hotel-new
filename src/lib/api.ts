export async function fetchAPI(endpoint: string, method: string = 'GET', body?: any) {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    }
    if (body) options.body = JSON.stringify(body)
  
    const res = await fetch(endpoint, options)
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'An error occurred')
    }
    return res.json()
  }
  