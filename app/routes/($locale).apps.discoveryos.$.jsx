export async function loader({ request, context }) {
  const discoveryOsAppUrl = context.env.PUBLIC_APP_DISCOVERY_OS_URL;
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/^\/apps/, '');
  const urlToFetch = `${discoveryOsAppUrl}${pathname}`;

  try {
    const response = await fetch(urlToFetch, {
      method: request.method,
      headers: {
        ...request.headers,
        'shop-secret': context.env.PUBLIC_DISCOVERY_OS_CLIENT_SECRET,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Response('Discovery OS app error', { status: response.status });
    }

    return response;
  } catch (err) {
    const errStatus = err.status || 502;
    const errMessage = err.message || 'Failed to reach Discovery OS app';
    throw new Response(`${errMessage}`, { status: errStatus });
  }
}

export default function ProxyPage() {
  return null;
}