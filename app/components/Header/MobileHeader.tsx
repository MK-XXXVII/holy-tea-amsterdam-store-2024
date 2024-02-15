import {useParams, Form} from '@remix-run/react';
import {BsSearchHeartFill} from 'react-icons/bs';

import {
  Input,
  Heading,
  IconMenu,
  ThemeSwitcher,
  Link,
  AccountLink,
  CartCount,
} from '~/components';

export function MobileHeader({
  title,
  isHome,
  openCart,
  openMenu,
}: {
  title: string;
  isHome: boolean;
  openCart: () => void;
  openMenu: () => void;
}) {
  // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);

  const params = useParams();

  return (
    <header
      role="banner"
      className={`${
        isHome
          ? 'bg-lilac/60 dark:bg-blue-green/60 text-primary shadow-darkHeader'
          : 'bg-blue-green/60 text-primary dark:bg-lilac/60 shadow-lightHeader'
      } flex lg:hidden items-center h-nav py-8 sticky backdrop-blur-lg z-40 top-0 justify-between w-full leading-none gap-4 px-4 md:px-8`}
    >
      <div className="flex items-center justify-start w-full gap-4">
        <button
          onClick={openMenu}
          className="relative flex items-center justify-center w-8 h-8"
          aria-label="Open Menu"
        >
          <IconMenu />
        </button>
        <Form
          method="get"
          action={params.locale ? `/${params.locale}/search` : '/search'}
          className="items-center gap-2 sm:flex"
        >
          <button
            type="submit"
            className="relative flex items-center justify-center w-8 h-8"
            aria-label="Submit Search"
          >
            <BsSearchHeartFill className="w-8 h-8" />
          </button>
          <label htmlFor="searchInput" className="sr-only">
            Search
          </label>{' '}
          <Input
            id="searchInput"
            className={
              isHome
                ? 'focus:border-contrast dark:focus:border-primary/20'
                : 'focus:border-primary/20'
            }
            type="search"
            variant="minisearch"
            placeholder="Search"
            name="q"
          />
        </Form>
      </div>

      <Link
        className="flex items-center self-stretch leading-[3rem] md:leading-[4rem] justify-center flex-grow w-full h-full"
        to="/"
      >
        <Heading
          className="font-bold text-center leading-none"
          as={isHome ? 'h1' : 'h2'}
        >
          {title}
        </Heading>
      </Link>

      <div className="flex items-center justify-end w-full gap-2">
        <AccountLink className="relative flex items-center justify-center w-8 h-8" />
        <CartCount isHome={isHome} openCart={openCart} />
        <ThemeSwitcher isHome={isHome} />
      </div>
    </header>
  );
}
