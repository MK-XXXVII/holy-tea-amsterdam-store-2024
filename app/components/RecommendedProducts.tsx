import React from 'react';
import Slider from 'react-slick';
import {useSpring, animated} from 'react-spring';
import {FaArrowRight, FaArrowLeft} from 'react-icons/fa';

import type {HomepageFeaturedProductsQuery} from 'storefrontapi.generated';
import {ProductCard, Section} from '~/components';

const mockProducts = {
  nodes: new Array(12).fill(''),
};

type RecommendedProductsProps = HomepageFeaturedProductsQuery & {
  products?: typeof mockProducts;
  title?: string;
  count?: number;
};

export function RecommendedProducts({
  title = 'Featured Products',
  products = mockProducts,
  count = 12,
  ...props
}: RecommendedProductsProps) {
  return (
    <Section heading={title} padding="y" {...props}>
      <div className="swimlane md:pb-8">
        {products.nodes.map((product) => (
          <ProductCard
            product={product}
            key={product.id}
            className="snap-start w-80"
          />
        ))}
      </div>
    </Section>
  );
}
