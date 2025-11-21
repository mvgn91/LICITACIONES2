import React from 'react';

const Logo = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 20"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Pietra Fina Logo"
    >
      <text
        x="0"
        y="15"
        fontFamily="var(--font-playfair-display), serif"
        fontSize="16"
        fontWeight="700"
        fill="currentColor"
        className="font-headline"
      >
        Pietra Fina
      </text>
    </svg>
  );
};

export default Logo;
