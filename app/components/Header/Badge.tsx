import {useMemo} from 'react';
import {BsBagHeart} from 'react-icons/bs';

import {Link} from '~/components';
import {useIsHydrated} from '~/hooks/useIsHydrated';

export function Badge({
  openCart,
  dark,
  count,
}: {
  count: number;
  dark: boolean;
  openCart: () => void;
}) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => (
      <>
        <BsBagHeart className="w-10 h-10" />
        <div
          className={`${
            dark ? 'text-primary bg-burnt-orange' : 'text-contrast bg-primary'
          } absolute -bottom-1 -right-1 text-[0.625rem] font-medium subpixel-antialiased h-4 w-4 min-w-[0.75rem] flex items-center justify-center leading-none text-center rounded-full px-[0.125rem] pb-px`}
        >
          <span>{count || 0}</span>
        </div>
      </>
    ),
    [count, dark],
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link
      to="/cart"
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </Link>
  );
}
