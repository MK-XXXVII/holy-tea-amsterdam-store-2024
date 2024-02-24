import {useWindowScroll} from 'react-use';
import {useParams, Form} from '@remix-run/react';
import {BsSearchHeartFill} from 'react-icons/bs';

import {
  LogoIcon,
  Link,
  Input,
  ThemeSwitcher,
  AccountLink,
  CartCount,
} from '~/components';
import {type EnhancedMenu} from '~/lib/utils';

export function DesktopHeader({
  isHome,
  menu,
  openCart,
  title,
}: {
  isHome: boolean;
  openCart: () => void;
  menu?: EnhancedMenu;
  title: string;
}) {
  const params = useParams();
  const {y} = useWindowScroll();

  return (
    <header
      role="banner"
      className={`${
        isHome
          ? 'bg-lilac/80 dark:bg-blue-green/80 text-primary shadow-darkHeader'
          : 'bg-blue-green/60 text-primary dark:bg-lilac/60 shadow-lightHeader'
      } ${
        !isHome && y > 50 && 'shadow-lightHeader'
      } hidden lg:flex items-center sticky transition duration-300 backdrop-blur-lg z-40 top-0 justify-between w-full leading-none gap-8 px-12 py-4`}
    >
      <div className="flex items-center gap-6">
        {' '}
        {/* Ensure alignment of logo, title, and nav */}
        <Link to="/" prefetch="intent" className="flex items-center font-bold">
          <LogoIcon
            size={50}
            className={`border-2 border-primary rounded-full ${
              isHome
                ? 'bg-blue-green dark:bg-lilac'
                : 'bg-lilac dark:bg-blue-green'
            }`}
          />{' '}
          <span className="ml-2">{title}</span> {/* Title next to logo */}
        </Link>
        <nav className="flex items-center mt-3 gap-5">
          {' '}
          {/* Navigation items aligned with logo and title */}
          {(menu?.items || []).map((item) => (
            <Link
              key={item.id}
              to={item.to}
              target={item.target}
              prefetch="intent"
              className={({isActive}) =>
                isActive ? 'pb-1 border-b border-primary/80 -mb-px' : 'pb-1'
              }
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <Form
          method="get"
          action={params.locale ? `/${params.locale}/search` : '/search'}
          className="flex items-center gap-2"
        >
          <label htmlFor="searchInput" className="sr-only">
            Search
          </label>{' '}
          <Input
            id="searchInput"
            className={
              isHome
                ? 'focus:border-contrast/20 dark:focus:border-primary/20'
                : 'focus:border-primary/20'
            }
            type="search"
            variant="minisearch"
            placeholder="Search"
            name="q"
          />
          <button
            type="submit"
            className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
            aria-label="Submit Search"
          >
            <BsSearchHeartFill className="w-8 h-8" />
          </button>
        </Form>
        <AccountLink className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5" />
        <CartCount isHome={isHome} openCart={openCart} />
        <ThemeSwitcher isHome={isHome} />
      </div>
    </header>
  );
}
