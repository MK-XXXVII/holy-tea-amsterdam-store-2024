import {Await} from '@remix-run/react';
import {Suspense} from 'react';
import {RiUserHeartLine} from 'react-icons/ri';
import {GrUserExpert} from 'react-icons/gr';

import {useRootLoaderData} from '~/root';
import {Link} from '~/components';

export function AccountLink({className}: {className?: string}) {
  const rootData = useRootLoaderData();
  const isLoggedIn = rootData?.isLoggedIn;

  return (
    <Link to="/account" className={className}>
      <Suspense fallback={<RiUserHeartLine />}>
        <Await resolve={isLoggedIn} errorElement={<RiUserHeartLine />}>
          {(isLoggedIn) =>
            isLoggedIn ? (
              <GrUserExpert className="w-8 h-8" />
            ) : (
              <RiUserHeartLine className="w-8 h-8" />
            )
          }
        </Await>
      </Suspense>
    </Link>
  );
}
