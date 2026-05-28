import bcrypt from 'bcrypt'

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  const { password } = JSON.parse(event.body)
  const hash = await bcrypt.hash(password, 10)

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ hash }),
  }
}