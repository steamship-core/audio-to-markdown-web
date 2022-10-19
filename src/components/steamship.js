
export const apiPost = async (method, body) => {
  const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.STEAMSHIP_KEY}` },
      body: JSON.stringify(body)
  };
  let response = await fetch(`https://api.steamship.com/api/v1/${method}`, requestOptions);
  let j = response.json()
  return j
}

export const appPost = async (method, body) => {
  const appId = ''
  const spaceId = ''
  const requestOptions = {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${process.env.STEAMSHIP_KEY}`,
        'X-App-Id': process.env.STEAMSHIP_PACKAGE_ID,
        'X-Space-Id': process.env.STEAMSHIP_SPACE_ID
      },
      body: JSON.stringify(body)
  };
  
  let response = await fetch(`https://${process.env.STEAMSHIP_HANDLE}.steamship.run/${process.env.STEAMSHIP_SPACE}/${process.env.STEAMSHIP_PACKAGE}/${method}`, requestOptions);
  let j = response.json()
  return j
}