import type { ButtonHTMLAttributes, ReactNode, FC } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'neural';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  fullWidth = false,
  type = 'button',
  onClick,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-2 text-xs sm:text-sm',
    lg: 'px-4 py-2.5 text-sm sm:text-base',
  }[size];

  const variantClasses = {
    primary:
      'bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-sm shadow-xs active:bg-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2',
    secondary:
      'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium border border-zinc-200 rounded-sm',
    outline:
      'bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 hover:border-zinc-400 font-medium rounded-sm shadow-2xs',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-sm shadow-xs',
    ghost: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-sm font-medium',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-sm shadow-xs',
    neural:
      'bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-sm shadow-xs active:bg-zinc-950 border border-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-700 focus-visible:ring-offset-2 transition-all',
  }[variant];

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`font-sans transition-all duration-150 active:scale-[0.98] select-none inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${
        fullWidth ? 'w-full' : ''
      } ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      {children}
    </button>
  );
};
