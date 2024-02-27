import clsx from 'clsx';
import {Dialog, Transition} from '@headlessui/react';
import {Fragment, useState} from 'react';
import {useSpring, animated} from 'react-spring';
import type {ShopifyAnalyticsProduct} from '@shopify/hydrogen';
import {flattenConnection, Image, Money, useMoney} from '@shopify/hydrogen';
import type {MoneyV2, Product} from '@shopify/hydrogen/storefront-api-types';
import {FaEye} from 'react-icons/fa';

import type {ProductCardFragment} from 'storefrontapi.generated';
import {Text, HTMLText, Link, AddToCartButton, Button} from '~/components';
import {isDiscounted, isNewArrival} from '~/lib/utils';
import type {RichTextNode} from '~/lib/type';
import {convertRichTextToHTML} from '~/lib/richTextUtils';
import {getProductPlaceholder} from '~/lib/placeholders';

export function ProductCard({
  product,
  label,
  className,
  loading,
  onClick,
  quickAdd,
}: {
  product: ProductCardFragment;
  label?: string;
  className?: string;
  loading?: HTMLImageElement['loading'];
  onClick?: () => void;
  quickAdd?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }
  const [springProps, setSpringProps] = useSpring(() => ({
    scale: 1,
    boxShadow: '0px 0px 0px rgba(112, 58, 207, 0.4)',
  }));
  const [buttonSpringProps, setButtonSpringProps] = useSpring(() => ({
    scale: 1,
    boxShadow: '0px 0px 0px rgba(112, 58, 207, 0.4)',
  }));

  let cardLabel;

  const cardProduct: Product = product?.variants
    ? (product as Product)
    : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  const firstVariant = flattenConnection(cardProduct.variants)[0];

  if (!firstVariant) return null;
  const {image, price, compareAtPrice} = firstVariant;

  if (label) {
    cardLabel = label;
  } else if (isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2)) {
    cardLabel = 'Sale';
  } else if (isNewArrival(product.publishedAt)) {
    cardLabel = 'New';
  }

  const parseAndConvertRichText = (metafieldValue: string) => {
    try {
      const richText = JSON.parse(metafieldValue) as RichTextNode;
      return convertRichTextToHTML(richText);
    } catch (error) {
      return '';
    }
  };

  const metafieldHtml = product.metafield
    ? parseAndConvertRichText(product.metafield.value)
    : '';

  const productAnalytics: ShopifyAnalyticsProduct = {
    productGid: product.id,
    variantGid: firstVariant.id,
    name: product.title,
    variantName: firstVariant.title,
    brand: product.vendor,
    price: firstVariant.price.amount,
    quantity: 1,
  };
  return (
    <animated.div
      className="flex-grow flex flex-col justify-between p-1 my-8 mx-3 border-2 
    border-primary dark:border-contrast
    rounded bg-blue-green/30 dark:bg-lilac"
      style={{
        transform: springProps.scale.to((scale) => `scale(${scale})`),
        boxShadow: springProps.boxShadow.to((bs) => bs),
      }}
      onMouseEnter={() =>
        setSpringProps({
          scale: 1.05,
          boxShadow: '0px 0px 10px rgba(242, 78, 112, 0.6)',
        })
      }
      onMouseLeave={() =>
        setSpringProps({
          scale: 1,
          boxShadow: '0px 0px 0px rgba(242, 78, 112, 0.4)',
        })
      }
    >
      <div className={clsx('flex flex-col', className)}>
        <Link
          onClick={onClick}
          to={`/products/${product.handle}`}
          prefetch="intent"
        >
          <div className="relative card-image aspect-w-1 aspect-h-1">
            {image && (
              <Image
                className="object-cover w-full h-full transition-opacity hover:opacity-10"
                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                aspectRatio="1/1"
                data={image}
                alt={image.altText || `Picture of ${product.title}`}
                loading={loading}
              />
            )}
            {cardLabel && (
              <Text
                className="absolute top-2 right-2 bg-blue-iris text-contrast py-1 px-3 rounded-2xl text-copy font-semibold"
                as="h3"
              >
                {cardLabel}
              </Text>
            )}
          </div>
          <div className="overflow-hidden p-2">
            <Text
              className="w-full overflow-hidden text-ellipsis text-lead font-semibold text-primary"
              size="lead"
            >
              {product.title}
            </Text>
            <div className="mt-auto flex items-center pt-4">
              <Text className="flex gap-x-8 text-lead font-semibold text-primary">
                <Money
                  withoutTrailingZeros
                  data={price!}
                  className="border-2 border-primary rounded-full px-3 py-1 bg-blue-iris/40 dark:bg-blue-green/20"
                />
                {isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2) && (
                  <CompareAtPrice
                    className="text-primary/50 line-through mt-1.5"
                    data={compareAtPrice as MoneyV2}
                  />
                )}
              </Text>
            </div>
          </div>
        </Link>
        {product.metafieldTitle?.value && product.metafield && (
          <div className="flex flex-grow m-2 mx-2">
            <animated.button
              type="button"
              onClick={openModal}
              className="
              w-full focus:outline-none flex flex-grow align-middle justify-between items-center 
              gap-2 bg-fuchsia/40 dark:bg-blue-iris/20 text-primary border-2 border-primary rounded-full px-4 py-2"
              style={{
                transform: buttonSpringProps.scale.to(
                  (scale) => `scale(${scale})`,
                ),
                boxShadow: buttonSpringProps.boxShadow.to((bs) => bs),
              }}
              onMouseEnter={() =>
                setButtonSpringProps({
                  scale: 1.05,
                  boxShadow: '0px 0px 15px rgba(242, 78, 112, 0.6)',
                })
              }
              onMouseLeave={() =>
                setButtonSpringProps({
                  scale: 1,
                  boxShadow: '0px 0px 0px rgba(242, 78, 112, 0.0)',
                })
              }
            >
              <Text as="span" size="copy">
                {product.metafieldTitle?.value}
              </Text>
              <FaEye className="w-10 h-10" />
            </animated.button>
            <Transition appear show={isOpen} as={Fragment}>
              <Dialog
                as="div"
                className="fixed inset-0 z-10 overflow-y-auto"
                onClose={closeModal}
              >
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-contrast dark:bg-primary p-6 text-left align-middle shadow-xl transition-all border-2 border-primary dark:border-contrast">
                      <div className="mt-2">
                        <HTMLText
                          size="copy"
                          className="prose text-primary dark:text-contrast"
                          content={metafieldHtml}
                        />
                      </div>

                      <div className="mt-4">
                        <button
                          type="button"
                          className="
                          inline-flex justify-center rounded-3xl border border-transparent 
                          bg-blue-iris px-4 py-2 text-sm font-medium text-contrast 
                          hover:bg-blue-iris/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-iris/50 
                          focus-visible:ring-offset-2"
                          onClick={closeModal}
                        >
                          Close
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </Dialog>
            </Transition>
          </div>
        )}
      </div>
      {quickAdd && firstVariant.availableForSale && (
        <AddToCartButton
          lines={[
            {
              quantity: 1,
              merchandiseId: firstVariant.id,
            },
          ]}
          variant="secondary"
          className="my-2 bg-primary text-contrast py-2 rounded-3xl hover:bg-green-600 transition-colors duration-200"
          analytics={{
            products: [productAnalytics],
            totalValue: parseFloat(productAnalytics.price),
          }}
        >
          <Text as="span" className="flex items-center justify-center gap-2">
            Add to Cart
          </Text>
        </AddToCartButton>
      )}
      {quickAdd && !firstVariant.availableForSale && (
        <Button
          variant="secondary"
          className="mt-2 bg-gray-500 text-white cursor-not-allowed"
          disabled
        >
          <Text as="span" className="flex items-center justify-center gap-2">
            Sold out
          </Text>
        </Button>
      )}
    </animated.div>
  );
}

function CompareAtPrice({
  data,
  className,
}: {
  data: MoneyV2;
  className?: string;
}) {
  const {currencyNarrowSymbol, withoutTrailingZerosAndCurrency} =
    useMoney(data);

  const styles = clsx(className);

  return (
    <span className={styles}>
      {currencyNarrowSymbol}
      {withoutTrailingZerosAndCurrency}
    </span>
  );
}
