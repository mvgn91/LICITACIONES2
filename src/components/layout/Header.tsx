
'use client';

import Link from 'next/link';
import Logo from '../Logo';
import { AddContractModal } from '../contracts/AddContractModal';
import { useAuth, useUser, initiateAnonymousSignIn } from '@/firebase';
import { useEffect } from 'react';
import { Button } from '../ui/button';

const Header = () => {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  
  useEffect(() => {
      if (!isUserLoading && !user) {
          initiateAnonymousSignIn(auth);
      }
  }, [isUserLoading, user, auth]);


  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between space-x-4 px-4 sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-6 w-auto text-primary" />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
           {isUserLoading ? <Button disabled>Cargando...</Button> : user ? <AddContractModal /> : <Button disabled>Iniciando sesión...</Button> }
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
