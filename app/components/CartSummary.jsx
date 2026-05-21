import {CartForm, Money} from '@shopify/hydrogen';
import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher} from 'react-router';

export function CartSummary({cart, layout}) {
  const summaryId = useId();
  const discountsHeadingId = useId();
  const discountCodeInputId = useId();
  const giftCardHeadingId = useId();
  const giftCardInputId = useId();

  const summaryClasses = layout === 'page'
    ? 'mt-8 rounded-2xl border border-border bg-surface p-6'
    : 'mt-6 pt-4 border-t border-border';

  return (
    <div aria-labelledby={summaryId} className={summaryClasses}>
      <h4 id={summaryId} className="text-sm font-bold uppercase tracking-wider text-muted mb-4">
        Order Summary
      </h4>
      <dl role="group" className="flex items-center justify-between mb-3">
        <dt className="text-sm text-muted">Subtotal</dt>
        <dd className="text-sm font-semibold">
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart?.cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </dd>
      </dl>
      <CartDiscounts
        discountCodes={cart?.discountCodes}
        discountsHeadingId={discountsHeadingId}
        discountCodeInputId={discountCodeInputId}
      />
      <CartGiftCard
        giftCardCodes={cart?.appliedGiftCards}
        giftCardHeadingId={giftCardHeadingId}
        giftCardInputId={giftCardInputId}
      />
      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}) {
  if (!checkoutUrl) return null;

  return (
    <div className="mt-6">
      <a
        href={checkoutUrl}
        target="_self"
        className="block w-full text-center rounded-xl bg-accent text-white py-3.5 px-6 font-semibold text-sm tracking-wide uppercase hover:bg-accent-hover transition-colors"
      >
        Checkout &rarr;
      </a>
    </div>
  );
}

function CartDiscounts({
  discountCodes,
  discountsHeadingId,
  discountCodeInputId,
}) {
  const codes =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <section aria-label="Discounts" className="mb-4">
      <dl hidden={!codes.length}>
        <div>
          <dt id={discountsHeadingId} className="text-xs font-semibold uppercase text-muted mb-2">
            Discounts
          </dt>
          <UpdateDiscountForm>
            <div
              className="flex items-center gap-2"
              role="group"
              aria-labelledby={discountsHeadingId}
            >
              <code className="rounded-md bg-surface px-2 py-1 text-xs font-mono">{codes?.join(', ')}</code>
              <button
                type="submit"
                aria-label="Remove discount"
                className="text-xs text-muted hover:text-danger transition-colors"
              >
                Remove
              </button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      <UpdateDiscountForm discountCodes={codes}>
        <div className="flex gap-2 mt-3">
          <label htmlFor={discountCodeInputId} className="sr-only">
            Discount code
          </label>
          <input
            id={discountCodeInputId}
            type="text"
            name="discountCode"
            placeholder="Discount code"
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
          />
          <button
            type="submit"
            aria-label="Apply discount code"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface transition-colors"
          >
            Apply
          </button>
        </div>
      </UpdateDiscountForm>
    </section>
  );
}

function UpdateDiscountForm({discountCodes, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({giftCardCodes, giftCardHeadingId, giftCardInputId}) {
  const giftCardCodeInput = useRef(null);
  const removeButtonRefs = useRef(new Map());
  const previousCardIdsRef = useRef([]);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});
  const [removedCardIndex, setRemovedCardIndex] = useState(null);

  useEffect(() => {
    if (giftCardAddFetcher.data) {
      if (giftCardCodeInput.current !== null) {
        giftCardCodeInput.current.value = '';
      }
    }
  }, [giftCardAddFetcher.data]);

  useEffect(() => {
    const currentCardIds = giftCardCodes?.map((card) => card.id) || [];

    if (removedCardIndex !== null && giftCardCodes) {
      const focusTargetIndex = Math.min(
        removedCardIndex,
        giftCardCodes.length - 1,
      );
      const focusTargetCard = giftCardCodes[focusTargetIndex];
      const focusButton = focusTargetCard
        ? removeButtonRefs.current.get(focusTargetCard.id)
        : null;

      if (focusButton) {
        focusButton.focus();
      } else if (giftCardCodeInput.current) {
        giftCardCodeInput.current.focus();
      }

      setRemovedCardIndex(null);
    }

    previousCardIdsRef.current = currentCardIds;
  }, [giftCardCodes, removedCardIndex]);

  const handleRemoveClick = (cardId) => {
    const index = previousCardIdsRef.current.indexOf(cardId);
    if (index !== -1) {
      setRemovedCardIndex(index);
    }
  };

  return (
    <section aria-label="Gift cards" className="mb-2">
      {giftCardCodes && giftCardCodes.length > 0 && (
        <dl className="mb-3">
          <dt id={giftCardHeadingId} className="text-xs font-semibold uppercase text-muted mb-2">
            Applied Gift Card(s)
          </dt>
          {giftCardCodes.map((giftCard) => (
            <dd key={giftCard.id} className="flex items-center gap-2 mb-1">
              <RemoveGiftCardForm
                giftCardId={giftCard.id}
                lastCharacters={giftCard.lastCharacters}
                onRemoveClick={() => handleRemoveClick(giftCard.id)}
                buttonRef={(el) => {
                  if (el) {
                    removeButtonRefs.current.set(giftCard.id, el);
                  } else {
                    removeButtonRefs.current.delete(giftCard.id);
                  }
                }}
              >
                <code className="rounded-md bg-surface px-2 py-1 text-xs font-mono">***{giftCard.lastCharacters}</code>
                <span className="text-xs text-muted">
                  <Money data={giftCard.amountUsed} />
                </span>
              </RemoveGiftCardForm>
            </dd>
          ))}
        </dl>
      )}

      <AddGiftCardForm fetcherKey="gift-card-add">
        <div className="flex gap-2 mt-2">
          <label htmlFor={giftCardInputId} className="sr-only">
            Gift card code
          </label>
          <input
            id={giftCardInputId}
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={giftCardAddFetcher.state !== 'idle'}
            aria-label="Apply gift card code"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface transition-colors disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </AddGiftCardForm>
    </section>
  );
}

function AddGiftCardForm({fetcherKey, children}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesAdd}
    >
      {children}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  lastCharacters,
  children,
  onRemoveClick,
  buttonRef,
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {children}
      <button
        type="submit"
        aria-label={`Remove gift card ending in ${lastCharacters}`}
        onClick={onRemoveClick}
        ref={buttonRef}
        className="text-xs text-muted hover:text-danger transition-colors ml-2"
      >
        Remove
      </button>
    </CartForm>
  );
}

/**
 * @typedef {{
 *   cart: OptimisticCart<CartApiQueryFragment | null>;
 *   layout: CartLayout;
 * }} CartSummaryProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */
