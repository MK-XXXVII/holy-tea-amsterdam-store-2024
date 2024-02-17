import React from 'react';
import Slider from 'react-slick';
import {FaArrowRight, FaArrowLeft} from 'react-icons/fa';

import type {HomepageFeaturedProductsQuery} from 'storefrontapi.generated';
import {ProductCard} from '~/components';

type ProductSwimlaneProps = HomepageFeaturedProductsQuery & {
  title?: string;
  count?: number;
};

export function ProductSwimlane({collectionByHandle}: ProductSwimlaneProps) {
  const sliderRef = React.useRef<Slider>(null);

  const settings = {
    className: 'center',
    centerMode: true,
    infinite: true,
    centerPadding: '40px',
    slidesToShow: 6,
    slidesToScroll: 1,
    speed: 500,
    arrows: false,
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 5,
          infinite: true,
        },
      },
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          infinite: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          infinite: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          initialSlide: 1,
        },
      },
    ],
  };

  return (
    <div className="slider-container px-8 py-12">
      <Slider ref={sliderRef} {...settings}>
        {collectionByHandle?.products?.nodes.map((product) => (
          <div key={`slide-${product.id}`} className="flex-nowrap px-2">
            <ProductCard product={product} key={product.id} />
          </div>
        ))}
      </Slider>
      <div
        className="
      flex justify-center border-4 dark:border-contrast bg-gradient dark:bg-blue-green
      border-primary rounded-full p-2 mt-12 space-x-12"
      >
        <button
          className="
          border-2 border-primary dark:border-contrast bg-contrast dark:bg-primary 
          rounded-full p-2 text-primary dark:text-contrast text-heading"
          onClick={() => sliderRef.current?.slickPrev()}
          aria-label="Previous Product"
        >
          <FaArrowLeft />
        </button>
        <button
          className="
          border-2 border-primary dark:border-contrast bg-contrast dark:bg-primary 
          rounded-full p-2 text-primary dark:text-contrast text-heading"
          onClick={() => sliderRef.current?.slickNext()}
          aria-label="Next Product"
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
}
