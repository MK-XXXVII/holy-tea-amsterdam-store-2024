import {useRef, Suspense} from 'react';
import {Disclosure, Listbox} from '@headlessui/react';
import {defer, redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, Await} from '@remix-run/react';
import type {ShopifyAnalyticsProduct} from '@shopify/hydrogen';
import {
  AnalyticsPageType,
  Money,
  ShopPayButton,
  VariantSelector,
  getSelectedProductOptions,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import clsx from 'clsx';
import {IoIosArrowRoundDown} from 'react-icons/io';

import type {
  ProductQuery,
  ProductVariantFragmentFragment,
} from 'storefrontapi.generated';
import {
  Heading,
  IconCaret,
  IconCheck,
  ProductGallery,
  RecommendedProducts,
  Section,
  Skeleton,
  HTMLText,
  Text,
  Link,
  AddToCartButton,
  Button,
} from '~/components';
import {getExcerpt} from '~/lib/utils';
import {seoPayload} from '~/lib/seo.server';
import type {Storefront, RichTextNode} from '~/lib/type';
import {convertRichTextToHTML} from '~/lib/richTextUtils';
import {routeHeaders} from '~/data/cache';
import {
  PRODUCT_QUERY,
  RECOMMENDED_PRODUCTS_QUERY,
  VARIANTS_QUERY,
} from '~/data/productQueries';

export const headers = routeHeaders;

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const {productHandle} = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  const selectedOptions = getSelectedProductOptions(request);

  const {shop, product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {
      handle: productHandle,
      selectedOptions,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  if (!product?.id) {
    throw new Response('product', {status: 404});
  }

  if (!product.selectedVariant) {
    throw redirectToFirstVariant({product, request});
  }

  // In order to show which variants are available in the UI, we need to query
  // all of them. But there might be a *lot*, so instead separate the variants
  // into it's own separate query that is deferred. So there's a brief moment
  // where variant options might show as available when they're not, but after
  // this deferred query resolves, the UI will update.
  const variants = context.storefront.query(VARIANTS_QUERY, {
    variables: {
      handle: productHandle,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  const recommended = getRecommendedProducts(context.storefront, product.id);

  // TODO: firstVariant is never used because we will always have a selectedVariant due to redirect
  // Investigate if we can avoid the redirect for product pages with no search params for first variant
  const firstVariant = product.variants.nodes[0];
  const selectedVariant = product.selectedVariant ?? firstVariant;

  const productAnalytics: ShopifyAnalyticsProduct = {
    productGid: product.id,
    variantGid: selectedVariant.id,
    name: product.title,
    variantName: selectedVariant.title,
    brand: product.vendor,
    price: selectedVariant.price.amount,
  };

  const seo = seoPayload.product({
    product,
    selectedVariant,
    url: request.url,
  });

  return defer({
    variants,
    product,
    shop,
    storeDomain: shop.primaryDomain.url,
    recommended,
    analytics: {
      pageType: AnalyticsPageType.product,
      resourceId: product.id,
      products: [productAnalytics],
      totalValue: parseFloat(selectedVariant.price.amount),
    },
    seo,
  });
}

function redirectToFirstVariant({
  product,
  request,
}: {
  product: ProductQuery['product'];
  request: Request;
}) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const firstVariant = product!.variants.nodes[0];
  for (const option of firstVariant.selectedOptions) {
    searchParams.set(option.name, option.value);
  }

  url.search = searchParams.toString();

  return redirect(url.href.replace(url.origin, ''), 302);
}

export default function Product() {
  const {product, shop, recommended, variants} = useLoaderData<typeof loader>();
  const {
    media,
    title,
    // vendor,
    descriptionHtml,
    metafield,
    secondMetafield,
    thirdMetafield,
    ingredientsTitle,
    brewingGuideTitle,
  } = product;
  const {shippingPolicy, refundPolicy} = shop;

  const parseAndConvertRichText = (metafieldValue: string) => {
    try {
      const richText = JSON.parse(metafieldValue) as RichTextNode; // Asserting the type
      return convertRichTextToHTML(richText);
    } catch (error) {
      return ''; // Fallback to an empty string in case of parsing error
    }
  };

  // Use the function for each of the metafields
  const metafieldHtml = metafield
    ? parseAndConvertRichText(metafield.value)
    : '';
  const secondMetafieldHtml = secondMetafield
    ? parseAndConvertRichText(secondMetafield.value)
    : '';
  const thirdMetafieldHtml = thirdMetafield
    ? parseAndConvertRichText(thirdMetafield.value)
    : '';
  const ingredientsTitleValue = ingredientsTitle?.value || 'Ingredients';
  const brewingGuideTitleValue =
    brewingGuideTitle?.value || 'Tea Brewing Guide';

  return (
    <>
      <Section className="px-4 md:px-8 lg:px-16 xl:px-24 2xl:px-40">
        <div className="grid items-start md:gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 h-auto">
          <ProductGallery
            media={media.nodes}
            className="w-full xl:col-span-2"
          />
          <div className="sticky md:-mb-nav md:top-nav md:-translate-y-nav md:pt-nav hiddenScroll md:overflow-y-scroll">
            <section className="flex flex-col w-full max-w-xl gap-8 p-6 md:mx-auto md:max-w-xl md:px-0">
              <div className="grid gap-2">
                <Heading as="h1" className="whitespace-normal">
                  {title}
                </Heading>
                {/* {vendor && (
                  <Text className={'opacity-50 font-medium'}>{vendor}</Text>
                )} */}
              </div>
              <Suspense fallback={<ProductForm variants={[]} />}>
                <Await
                  errorElement="There was a problem loading related products"
                  resolve={variants}
                >
                  {(resp) => (
                    <ProductForm
                      variants={resp.product?.variants.nodes || []}
                    />
                  )}
                </Await>
              </Suspense>
              <div className="grid gap-4 py-4">
                {metafield && (
                  <ProductDetail
                    title={ingredientsTitleValue} // Use the value from the query as the title
                    content={metafieldHtml} // Use the excerpt as content
                  />
                )}
                {secondMetafield && (
                  <ProductDetail
                    title="Nutritional Information"
                    content={secondMetafieldHtml} // Use the excerpt as content
                  />
                )}
                {thirdMetafield && (
                  <ProductDetail
                    title={brewingGuideTitleValue} // Use the value from the query as the ti
                    content={thirdMetafieldHtml} // Use the excerpt as content
                  />
                )}
                {shippingPolicy?.body && (
                  <ProductDetail
                    title={shippingPolicy.title}
                    content={getExcerpt(shippingPolicy.body)}
                    learnMore={`/policies/${shippingPolicy.handle}`}
                  />
                )}
              </div>
            </section>
          </div>
        </div>
        {descriptionHtml && (
          <div
            dangerouslySetInnerHTML={{__html: descriptionHtml}}
            className="prose text-primary dark:text-contrast mt-8 w-full max-w-7xl px-8 md:font-light md:text-lead"
          />
        )}{' '}
      </Section>
      <Suspense fallback={<Skeleton className="h-32" />}>
        <Await
          errorElement="There was a problem loading related products"
          resolve={recommended}
        >
          {(products) => (
            <RecommendedProducts
              title="You May Also Like"
              products={products}
            />
          )}
        </Await>
      </Suspense>
    </>
  );
}

export function ProductForm({
  variants,
}: {
  variants: ProductVariantFragmentFragment[];
}) {
  const {product, analytics, storeDomain} = useLoaderData<typeof loader>();

  const closeRef = useRef<HTMLButtonElement>(null);

  /**
   * Likewise, we're defaulting to the first variant for purposes
   * of add to cart if there is none returned from the loader.
   * A developer can opt out of this, too.
   */
  const selectedVariant = product.selectedVariant!;
  const isOutOfStock = !selectedVariant?.availableForSale;

  const isOnSale =
    selectedVariant?.price?.amount &&
    selectedVariant?.compareAtPrice?.amount &&
    selectedVariant?.price?.amount < selectedVariant?.compareAtPrice?.amount;

  const productAnalytics: ShopifyAnalyticsProduct = {
    ...analytics.products[0],
    quantity: 1,
  };

  return (
    <div className="grid gap-10">
      <div className="grid gap-4">
        <VariantSelector
          handle={product.handle}
          options={product.options}
          variants={variants}
        >
          {({option}) => {
            return (
              <div
                key={option.name}
                className="flex flex-col flex-wrap mb-4 gap-y-2 last:mb-0"
              >
                <Heading as="legend" size="copy" className="min-w-[4rem]">
                  {option.name}
                </Heading>
                <div className="flex flex-wrap items-baseline gap-4">
                  {option.values.length > 7 ? (
                    <div className="relative w-full">
                      <Listbox>
                        {({open}) => (
                          <>
                            <Listbox.Button
                              ref={closeRef}
                              className={clsx(
                                'flex items-center justify-between w-full py-3 px-4 border border-primary',
                                open
                                  ? 'rounded-b md:rounded-t md:rounded-b-none'
                                  : 'rounded',
                              )}
                            >
                              <span>{option.value}</span>
                              <IconCaret direction={open ? 'up' : 'down'} />
                            </Listbox.Button>
                            <Listbox.Options
                              className={clsx(
                                'border-primary bg-contrast absolute bottom-12 z-30 grid h-48 w-full overflow-y-scroll rounded-t border px-2 py-2 transition-[max-height] duration-150 sm:bottom-auto md:rounded-b md:rounded-t-none md:border-t-0 md:border-b',
                                open ? 'max-h-48' : 'max-h-0',
                              )}
                            >
                              {option.values
                                .filter((value) => value.isAvailable)
                                .map(({value, to, isActive}) => (
                                  <Listbox.Option
                                    key={`option-${option.name}-${value}`}
                                    value={value}
                                  >
                                    {({active}) => (
                                      <Link
                                        to={to}
                                        className={clsx(
                                          'text-primary w-full p-2 transition rounded flex justify-start items-center text-left cursor-pointer',
                                          active && 'bg-primary/10',
                                        )}
                                        onClick={() => {
                                          if (!closeRef?.current) return;
                                          closeRef.current.click();
                                        }}
                                      >
                                        {value}
                                        {isActive && (
                                          <span className="ml-2">
                                            <IconCheck />
                                          </span>
                                        )}
                                      </Link>
                                    )}
                                  </Listbox.Option>
                                ))}
                            </Listbox.Options>
                          </>
                        )}
                      </Listbox>
                    </div>
                  ) : (
                    option.values.map(({value, isAvailable, isActive, to}) => (
                      <Link
                        key={option.name + value}
                        to={to}
                        preventScrollReset
                        prefetch="intent"
                        replace
                        className={clsx(
                          'leading-none py-2 px-4 rounded-3xl border-2 border-primary dark:border-contrast cursor-pointer transition-all duration-200 font-semibold',
                          isActive
                            ? 'bg-lilac dark:bg-blue-green dark:text-primary'
                            : 'bg-blue-green/10',
                          isAvailable ? 'opacity-100' : 'opacity-50',
                        )}
                      >
                        {value}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          }}
        </VariantSelector>
        {selectedVariant && (
          <div className="grid items-stretch gap-4">
            {isOutOfStock ? (
              <Button variant="secondary" disabled>
                <Text>Sold out</Text>
              </Button>
            ) : (
              <AddToCartButton
                lines={[
                  {
                    merchandiseId: selectedVariant.id!,
                    quantity: 1,
                  },
                ]}
                variant="primary"
                data-test="add-to-cart"
                analytics={{
                  products: [productAnalytics],
                  totalValue: parseFloat(productAnalytics.price),
                }}
              >
                <Text
                  as="span"
                  className="flex items-center justify-center gap-2"
                >
                  <span>Add to Cart</span> <span>·</span>{' '}
                  <Money
                    withoutTrailingZeros
                    data={selectedVariant?.price!}
                    as="span"
                    data-test="price"
                  />
                  {isOnSale && (
                    <Money
                      withoutTrailingZeros
                      data={selectedVariant?.compareAtPrice!}
                      as="span"
                      className="opacity-50 strike"
                    />
                  )}
                </Text>
              </AddToCartButton>
            )}
            {!isOutOfStock && (
              <ShopPayButton
                width="100%"
                variantIds={[selectedVariant?.id!]}
                storeDomain={storeDomain}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductDetail({
  title,
  content,
  learnMore,
}: {
  title: string;
  content: string;
  learnMore?: string;
}) {
  return (
    <Disclosure
      key={title}
      as="div"
      className="
      grid w-full gap-2 border-2 border-primary dark:border-contrast
      bg-blue-green dark:bg-primary text-primary dark:text-contrast p-3 rounded-md 
      transition-shadow duration-200 hover:shadow-sm focus-within:shadow-sm 
      focus-within:border-primary/80 focus-within:outline-none 
      focus-within:ring-2 focus-within:ring-lilac/80 dark:focus-within:ring-blue-green/80
      focus-within:ring-offset-2 focus-within:ring-offset-lilac/60 dark:focus-within:ring-offset-blue-green/60"
    >
      {({open}) => (
        <>
          <Disclosure.Button className="text-left">
            <div className="flex justify-between items-center">
              <Text size="lead" as="h4">
                {title}
              </Text>
              <IoIosArrowRoundDown
                className={clsx(
                  'transition-transform transform-gpu duration-200 h-8 w-8',
                  open ? 'rotate-180' : 'rotate-0',
                )}
              />
            </div>
          </Disclosure.Button>

          <Disclosure.Panel
            className={
              'pb-4 pt-2 grid gap-2 transition-all duration-500 ease-in-out'
            }
            style={{
              maxHeight: open ? '1000px' : '0', // Adjust '1000px' based on your content's max height
              overflow: 'hidden',
            }}
          >
            <div
              className="prose text-primary dark:text-contrast"
              dangerouslySetInnerHTML={{__html: content}}
            />
            {learnMore && (
              <div className="">
                <Link
                  className="pb-px border-b border-primary/30 text-primary"
                  to={learnMore}
                >
                  Learn more
                </Link>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

async function getRecommendedProducts(
  storefront: Storefront,
  productId: string,
) {
  const products = await storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
    variables: {productId, count: 12},
  });

  invariant(products, 'No data returned from Shopify API');

  const mergedProducts = (products.recommended ?? [])
    // additional products
    // .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts.findIndex(
    (item) => item.id === productId,
  );

  mergedProducts.splice(originalProduct, 1);

  return {nodes: mergedProducts};
}
