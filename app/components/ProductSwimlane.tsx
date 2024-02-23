import React, {useState, useEffect} from 'react';
import Slider from 'react-slick';
import {useSpring, animated} from 'react-spring';
import {FaArrowRight, FaArrowLeft, FaSpinner} from 'react-icons/fa';

import type {HomepageFeaturedProductsQuery} from 'storefrontapi.generated';
import {ProductCard, Heading, Text} from '~/components';

type ProductSwimlaneProps = HomepageFeaturedProductsQuery & {
  title?: string;
  tagline?: string;
  count?: number;
};

export function ProductSwimlane({
  collectionByHandle,
  title,
  tagline,
}: ProductSwimlaneProps) {
  const [isLoading, setIsLoading] = useState(true);
  const sliderRef = React.useRef<Slider>(null);
  const [prevProps, setPrev] = useSpring(() => ({scale: 1}));
  const [nextProps, setNext] = useSpring(() => ({scale: 1}));

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100); // 0.1 second delay

    return () => clearTimeout(timer); // Clean up on component unmount
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin h-16 w-16" />
      </div>
    );
  }

  const settings = {
    className: 'center',
    centerMode: true,
    infinite: true,
    centerPadding: '40px',
    slidesToShow: 6,
    slidesToScroll: 1,
    speed: 500,
    arrows: false,
    swipeToSlide: true, // Enable this to make the slides draggable
    draggable: true, // Enable this to allow swiping to slide
    responsive: [
      {
        breakpoint: 1536, // tailwindcss default 2xl breakpoint
        settings: {
          slidesToShow: 5,
          infinite: true,
        },
      },
      {
        breakpoint: 1280, // tailwindcss default xl breakpoint
        settings: {
          slidesToShow: 3,
          infinite: true,
        },
      },
      {
        breakpoint: 1024, // tailwindcss default lg breakpoint
        settings: {
          slidesToShow: 2,
          infinite: true,
        },
      },
      {
        breakpoint: 768, // tailwindcss default md breakpoint
        settings: {
          slidesToShow: 2,
          infinite: true,
        },
      },
      {
        breakpoint: 640, // tailwindcss default sm breakpoint
        settings: {
          slidesToShow: 1,
          infinite: true,
        },
      },
    ],
  };

  return (
    <div className="slider-container py-8">
      <div className="max-w-4xl px-8">
        {title && (
          <Heading size="display" className="pb-4">
            {title}
          </Heading>
        )}
        {tagline && (
          <Text size="lead" className="font-light">
            {tagline}
          </Text>
        )}{' '}
      </div>
      <Slider ref={sliderRef} {...settings}>
        {collectionByHandle?.products?.nodes.map((product) => (
          <div key={`slide-${product.id}`} className="flex-nowrap">
            <ProductCard product={product} key={product.id} />
          </div>
        ))}
      </Slider>
      <div
        className="
        flex justify-center border-4 dark:border-contrast bg-gradient dark:bg-blue-green
        border-primary rounded-full p-2 mx-4 mt-8 space-x-12"
      >
        <animated.button
          className="
          border-2 border-primary dark:border-contrast bg-contrast dark:bg-primary 
          rounded-full p-2 text-primary dark:text-contrast text-heading"
          onClick={() => sliderRef.current?.slickPrev()}
          aria-label="Previous Product"
          style={{
            transform: prevProps.scale.to((scale) => `scale(${scale})`),
          }}
          onMouseEnter={() => setPrev({scale: 1.1})}
          onMouseLeave={() => setPrev({scale: 1})}
        >
          <FaArrowLeft />
        </animated.button>
        <animated.button
          className="
          border-2 border-primary dark:border-contrast bg-contrast dark:bg-primary 
          rounded-full p-2 text-primary dark:text-contrast text-heading"
          onClick={() => sliderRef.current?.slickNext()}
          aria-label="Next Product"
          style={{
            transform: nextProps.scale.to((scale) => `scale(${scale})`),
          }}
          onMouseEnter={() => setNext({scale: 1.1})}
          onMouseLeave={() => setNext({scale: 1})}
        >
          <FaArrowRight />
        </animated.button>
      </div>
    </div>
  );
}
