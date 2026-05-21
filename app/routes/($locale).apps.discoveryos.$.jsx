export async function loader({ request, context }) {
  return handleProxyRequest(request, context);
}

export async function action({ request, context }) {
  return handleProxyRequest(request, context);
}

async function handleProxyRequest(request, context) {
  const discoveryOsAppUrl = context.env.PUBLIC_APP_DISCOVERY_OS_URL;
  const url = new URL(request.url);
  
  const pathname = url.pathname.replace(/^\/apps/, '');
  const searchParams = url.search; 
  const urlToFetch = `${discoveryOsAppUrl}${pathname}${searchParams}`;

  try {
    const headers = new Headers();

    headers.set('pa-client-id', context.env.PUBLIC_PA_CLIENT_ID);
    headers.set('pa-client-secret', context.env.PUBLIC_PA_CLIENT_SECRET);
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    const customerToken = request.headers.get('X-Shopify-Customer-Access-Token');
    if (customerToken) {
      headers.set('X-Shopify-Customer-Access-Token', customerToken);
    }

    const isGetOrHead = request.method === 'GET' || request.method === 'HEAD';
    const requestBody = isGetOrHead ? undefined : await request.text();

    const response = await fetch(urlToFetch, {
      method: request.method,
      headers: headers,
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error (${response.status}):`, errorText);
      throw new Response('Discovery OS app error', { status: response.status });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });

  } catch (err) {
    console.error('Proxy Error:', err);
    if (err instanceof Response) throw err;
    
    const errStatus = err.status || 502;
    const errMessage = err.message || 'Failed to reach Discovery OS app';
    throw new Response(errMessage, { status: errStatus });
  }
}