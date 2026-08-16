export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    apiUrl:
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:4000/api'
  });
}
