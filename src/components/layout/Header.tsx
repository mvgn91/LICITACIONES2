
'use client';

import Link from 'next/link';
import Logo from '../Logo';
import { AddContractModal } from '../contracts/AddContractModal';

const Header = () => {
  // This is a dummy function for now. The real logic is in ContractList.
  const handleAddContract = () => {};

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
           <AddContractModal onAddContract={handleAddContract} />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

    