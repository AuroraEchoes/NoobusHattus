export async function citadelQuery(route: string): Promise<any | undefined> {
  // Account for potential double /s in route
  if (route.charAt(0) == '/') {
    route = route.substring(1)
  }
  try {
    const res = await fetch(`https://ozfortress.com/api/v1/${route}`, {
      method: 'GET',
      headers: {
        'X-API-Key': process.env.CITADEL_API_KEY!
      }
    }
    )

    if (!res.ok) {
      throw new Error(`${res.status}`)
    }

    return await res.json();
  } catch (error) {
    console.log(`Citadel API error for route ${route}: ${error}`)
    return undefined
  }
}
