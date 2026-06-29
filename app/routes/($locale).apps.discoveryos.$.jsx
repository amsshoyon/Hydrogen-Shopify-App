let cachedCredentials = null;

const discoveryOsAppUrl = 'https://introducing-lap-appliances-turned.trycloudflare.com';

const APP_SIGNATURE_METAOBJECT_QUERY = `#graphql
  query getAppSecret {
    metaobject(handle: {type: "pa-discovery-os-app-signature", handle: "app-signature"}) {
      appSecret: field(key: "app_secret") { value }
    }
  }
`;

const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

async function signAppProxyQuery(params, secret) {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('');

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(sortedParams));
  return toHex(signature);
}

async function getAppSecret(context) {
  if (cachedCredentials) return cachedCredentials.appSecret;

  const {metaobject} = await context.storefront.query(APP_SIGNATURE_METAOBJECT_QUERY, {
    cache: context.storefront.CacheLong(),
  });

  const appSecret = metaobject?.appSecret?.value;
  if (!appSecret) throw new Response('App credentials metaobject not found.', {status: 500});

  cachedCredentials = {appSecret};
  return appSecret;
}

async function buildSignedUrl(url, pathname, context) {
  const shop = context.env.PUBLIC_STORE_DOMAIN;
  if (!shop) throw new Response('PUBLIC_STORE_DOMAIN is not configured.', {status: 500});

  const appSecret = await getAppSecret(context);

  const signedParams = Object.fromEntries(
    [...url.searchParams].filter(([key]) => !['shop', 'timestamp', 'signature'].includes(key)),
  );
  signedParams.shop = shop;
  signedParams.timestamp = String(Math.floor(Date.now() / 1000));
  signedParams.signature = await signAppProxyQuery(signedParams, appSecret);

  const targetUrl = new URL(`${discoveryOsAppUrl}${pathname}`);
  for (const [key, value] of Object.entries(signedParams)) {
    targetUrl.searchParams.set(key, value);
  }
  return targetUrl;
}

export async function loader({request, context}) {
  return handleProxyRequest(request, context);
}

export async function action({request, context}) {
  return handleProxyRequest(request, context);
}

async function handleProxyRequest(request, context) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/^\/apps/, '');

  try {
    const targetUrl = await buildSignedUrl(url, pathname, context);

    const isGetOrHead = request.method === 'GET' || request.method === 'HEAD';
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: isGetOrHead ? undefined : await request.text(),
    });

    if (!response.ok) {
      console.error(`Backend error (${response.status}):`, await response.text());
      throw new Response('Discovery OS app error', {status: response.status});
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });
  } catch (err) {
    console.error('Proxy Error:', err);
    if (err instanceof Response) throw err;
    throw new Response(err.message || 'Failed to reach Discovery OS app', {status: err.status || 502});
  }
}