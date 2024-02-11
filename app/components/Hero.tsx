import clsx from 'clsx';
import {MediaFile} from '@shopify/hydrogen';
import type {
  MediaImage,
  Media,
  Video as MediaVideo,
} from '@shopify/hydrogen/storefront-api-types';
import Marquee from 'react-fast-marquee';

import type {CollectionContentFragment} from 'storefrontapi.generated';
import {Heading, Text, Link} from '~/components';

type HeroProps = CollectionContentFragment & {
  height?: 'full';
  top?: boolean;
  loading?: HTMLImageElement['loading'];
};

/**
 * Hero component that renders metafields attached to collection resources
 **/
export function Hero({
  byline,
  cta,
  handle,
  heading,
  height,
  loading,
  spread,
  spreadSecondary,
  top,
}: HeroProps) {
  return (
    <Link to={`/collections/${handle}`}>
      <section
        className={clsx(
          'relative justify-end flex flex-col max-h-[50rem] md:max-h-[70rem] w-full mx-auto overflow-hidden',
          top && '',
          height === 'full'
            ? 'h-screen'
            : 'aspect-[4/5] sm:aspect-square md:aspect-[5/4] lg:aspect-[3/2] xl:aspect-[5/2]',
        )}
      >
        <div className="absolute inset-0 grid flex-grow grid-flow-col pointer-events-none auto-cols-fr -z-10 content-stretch overflow-clip">
          {spread?.reference && (
            <div>
              <SpreadMedia
                sizes={
                  spreadSecondary?.reference
                    ? '(min-width: 48em) 50vw, 100vw'
                    : '100vw'
                }
                data={spread.reference as Media}
                loading={loading}
              />
            </div>
          )}
          {spreadSecondary?.reference && (
            <div className="hidden md:block">
              <SpreadMedia
                sizes="50vw"
                data={spreadSecondary.reference as Media}
                loading={loading}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between gap-0 pb-12 bg-gradient-to-t dark:from-contrast/60 dark:text-primary from-primary/60 text-contrast">
          {heading?.value && (
            <div className="flex items-center justify-center bg-gradient w-full h-20 border-t-4 border-primary">
              <Marquee speed={150} gradient={false} pauseOnHover>
                <Heading
                  format
                  as="h2"
                  size="display"
                  className="max-w-full overflow-hidden py-8"
                >
                  {heading.value}
                </Heading>
              </Marquee>
            </div>
          )}
          {byline?.value && (
            <div className="flex items-center justify-center bg-gradient w-full h-12 border-b-4 border-primary">
              <Marquee speed={100} gradient={false} pauseOnHover>
                <Text
                  format
                  width="narrow"
                  as="p"
                  size="lead"
                  className="max-w-full overflow-hidden py-4"
                >
                  {byline.value}
                </Text>
              </Marquee>
            </div>
          )}
          <hr className="my-4 h-0.5 border-t-0" />
          {cta?.value && (
            <div className="px-4">
              <button
                type="button"
                className="
                w-full bg-primary text-contrast hover:text-contrast border-4 
                border-contrast hover:bg-blue-green focus:ring-4 focus:outline-none 
                focus:ring-blue-green rounded-full px-8 py-6 text-center mb-2 
                dark:text-contrast dark:hover:bg-blue-green dark:focus:ring-lilac"
              >
                <Text size="lead">{cta.value}</Text>
              </button>
            </div>
          )}
        </div>
      </section>
    </Link>
  );
}

type SpreadMediaProps = {
  data: Media | MediaImage | MediaVideo;
  loading?: HTMLImageElement['loading'];
  sizes: string;
};

function SpreadMedia({data, loading, sizes}: SpreadMediaProps) {
  return (
    <MediaFile
      data={data}
      className="block object-cover w-full h-full"
      mediaOptions={{
        video: {
          controls: false,
          muted: true,
          loop: true,
          playsInline: true,
          autoPlay: true,
          previewImageOptions: {src: data.previewImage?.url ?? ''},
        },
        image: {
          loading,
          crop: 'center',
          sizes,
          alt: data.alt || '',
        },
      }}
    />
  );
}
