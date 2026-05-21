import {useOptimisticCart, useAnalytics} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {useEffect, useRef} from 'react';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

function getLineItemChildrenMap(lines) {
  const children = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const children = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(children)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}

export function CartMain({layout, cart: originalCart}) {
  const cart = useOptimisticCart(originalCart);
  const {publish} = useAnalytics();
  const {type: asideType} = useAside();
  const publishedPageView = useRef(false);
  const prevAsideOpen = useRef(false);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);

  useEffect(() => {
    if (!cart?.id || !cartHasItems) return;

    const payload = {
      id: cart.id,
      token: cart.id,
      lineItems: (cart.lines?.nodes ?? []).map((line) => ({
        id: line.id,
        quantity: line.quantity,
        merchandise: {
          id: line.merchandise?.id,
          title: line.merchandise?.title,
          price: line.merchandise?.price?.amount,
          product: {
            id: line.merchandise?.product?.id,
            title: line.merchandise?.product?.title,
            vendor: line.merchandise?.product?.vendor,
          },
        },
      })),
      cost: {
        subtotalAmount: cart.cost?.subtotalAmount,
        totalAmount: cart.cost?.totalAmount,
      },
    };

    if (layout === 'page' && !publishedPageView.current) {
      publishedPageView.current = true;
      publish('cart_viewed', payload);
    }

    if (layout === 'aside') {
      const isOpen = asideType === 'cart';
      if (isOpen && !prevAsideOpen.current) {
        publish('cart_viewed', payload);
      }
      prevAsideOpen.current = isOpen;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, asideType, cart?.id, cartHasItems, publish]);

  return (
    <section
      aria-label={layout === 'page' ? 'Cart page' : 'Cart drawer'}
      className={layout === 'aside' ? 'h-full' : ''}
    >
      <CartEmpty hidden={linesCount} layout={layout} />
      <div className="cart-details">
        <p id="cart-lines" className="sr-only">
          Line items
        </p>
        <div>
          <ul aria-labelledby="cart-lines" className="divide-y divide-border">
            {(cart?.lines?.nodes ?? []).map((line) => {
              if (
                'parentRelationship' in line &&
                line.parentRelationship?.parent
              ) {
                return null;
              }
              return (
                <CartLineItem
                  key={line.id}
                  line={line}
                  layout={layout}
                  childrenMap={childrenMap}
                />
              );
            })}
          </ul>
        </div>
        {cartHasItems && <CartSummary cart={cart} layout={layout} />}
      </div>
    </section>
  );
}

function CartEmpty({hidden = false}) {
  const {close} = useAside();
  return (
    <div hidden={hidden} className="text-center py-8">
      <svg className="w-16 h-16 mx-auto text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      <p className="text-muted mb-4">
        Looks like you haven&rsquo;t added anything yet.
      </p>
      <Link
        to="/collections"
        onClick={close}
        prefetch="viewport"
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
      >
        Start shopping &rarr;
      </Link>
    </div>
  );
}

/** @typedef {'page' | 'aside'} CartLayout */
/**
 * @typedef {{
 *   cart: CartApiQueryFragment | null;
 *   layout: CartLayout;
 * }} CartMainProps
 */
/** @typedef {{[parentId: string]: CartLine[]}} LineItemChildrenMap */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartLineItem').CartLine} CartLine */
