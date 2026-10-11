import type { HTMLAttributes, FC } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'interactive';
}

export const Card: FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const base = 'rounded-xl transition-all duration-200';
  const variants = {
    default: 'bg-white border border-zinc-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)]',
    subtle: 'bg-zinc-50/80 border border-zinc-200/70',
    interactive:
      'bg-white border border-zinc-200/90 hover:border-zinc-300 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer',
  }[variant];

  return (
    <div className={`${base} ${variants} ${className}`} {...props}>
      {children}
    </div>
  );
};
