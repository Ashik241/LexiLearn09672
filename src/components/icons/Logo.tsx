import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="256"
      height="256"
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(props.className)}
      {...props}
    >
      <rect width="256" height="256" rx="60" fill="hsl(var(--background))" />
      <path
        d="M76 190V76H97.6L143.2 144.8V76H163V190H141.4L95.8 121.2V190H76Z"
        fill="hsl(var(--primary))"
      />
    </svg>
  );
}
