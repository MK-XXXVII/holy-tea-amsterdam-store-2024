import clsx from 'clsx';
import {useSpring, animated} from 'react-spring';
import type {ShopifyAnalyticsProduct} from '@shopify/hydrogen';
import {flattenConnection, Image, Money, useMoney} from '@shopify/hydrogen';
import type {MoneyV2, Product} from '@shopify/hydrogen/storefront-api-types';

import type {ProductCardFragment} from 'storefrontapi.generated';
import {Text, Link, AddToCartButton, Button} from '~/components';
import {isDiscounted, isNewArrival} from '~/lib/utils';
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
  const [cardProps, setCard] = useSpring(() => ({
    scale: 1,
    boxShadow: '0px 0px 0px rgba(0, 0, 0, 0)',
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
      className="
      flex flex-col justify-between p-2 my-4 mx-2 border-2 border-primary dark:border-contrast 
      rounded-md bg-lilac/50"
      style={{
        transform: cardProps.scale.to((scale) => `scale(${scale})`),
        boxShadow: cardProps.boxShadow.to((bs) => bs),
      }}
      onMouseEnter={() =>
        setCard({scale: 1.05, boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1)'})
      }
      onMouseLeave={() =>
        setCard({scale: 1, boxShadow: '0px 0px 0px rgba(0, 0, 0, 0)'})
      }
    >
      <Link
        onClick={onClick}
        to={`/products/${product.handle}`}
        prefetch="intent"
      >
        <div className={clsx('flex flex-col gap-2', className)}>
          <div className="relative card-image aspect-[1/1] ">
            {image && (
              <Image
                className="object-cover w-full fadeIn"
                sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 45vw"
                aspectRatio="1/1"
                data={image}
                alt={image.altText || `Picture of ${product.title}`}
                loading={loading}
              />
            )}
            {cardLabel && (
              <Text
                className="absolute top-2 right-2 rounded-2xl bg-blue-iris text-contrast py-1 px-3"
                as="h3"
              >
                {cardLabel}
              </Text>
            )}
          </div>
          <div className="flex-grow m-2">
            <div className="min-h-28 overflow-hidden">
              <Text
                className="w-full overflow-hidden text-ellipsis"
                size="lead"
              >
                {product.title}
              </Text>
            </div>
            <div className="mt-auto">
              <Text className="flex gap-x-8 text-lead font-semibold">
                <Money withoutTrailingZeros data={price!} />
                {isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2) && (
                  <CompareAtPrice
                    className="text-burnt-orange/60 dark:text-contrast"
                    data={compareAtPrice as MoneyV2}
                  />
                )}
              </Text>
            </div>
          </div>
        </div>
      </Link>
      {quickAdd && firstVariant.availableForSale && (
        <AddToCartButton
          lines={[
            {
              quantity: 1,
              merchandiseId: firstVariant.id,
            },
          ]}
          variant="secondary"
          className="mt-2"
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
        <Button variant="secondary" className="mt-2" disabled>
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

  const styles = clsx('strike', className);

  return (
    <span className={styles}>
      {currencyNarrowSymbol}
      {withoutTrailingZerosAndCurrency}
    </span>
  );
}
