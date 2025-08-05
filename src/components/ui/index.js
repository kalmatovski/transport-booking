import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
export const Button = forwardRef(({ 
  children, 
  variant = 'default', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className = '', 
  ...props 
}, ref) => {
  const baseStyles = `
    inline-flex items-center justify-center rounded-lg font-medium
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    default: `
      bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600
      text-white shadow-lg hover:shadow-xl focus:ring-yellow-500
    `,
    secondary: `
      bg-yellow-100 hover:bg-yellow-200 text-yellow-800 
      border border-yellow-300 focus:ring-yellow-500
    `,
    outline: `
      bg-white hover:bg-yellow-50 text-yellow-700 border border-yellow-300
      hover:border-yellow-400 focus:ring-yellow-500
    `,
    ghost: `
      bg-transparent hover:bg-yellow-100 text-yellow-700 focus:ring-yellow-500
    `,
    destructive: `
      bg-red-500 hover:bg-red-600 text-white shadow-lg focus:ring-red-500
    `
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
});
Button.displayName = 'Button';

export const Input = forwardRef(({ 
  label, 
  error, 
  helperText,
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          block w-full px-3 py-2 border rounded-lg shadow-sm
          transition-all duration-200 
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
          ${error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 hover:border-yellow-300'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});
Input.displayName = 'Input';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`
        bg-white rounded-xl border border-yellow-200 shadow-lg
        backdrop-blur-sm overflow-hidden
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`
        px-6 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white
        ${className}
      `} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const Alert = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  };

  return (
    <div className={`
      p-4 border rounded-lg flex items-center space-x-2
      ${variants[variant]} ${className}
    `}>
      {children}
    </div>
  );
};

export const LoadingSpinner = ({ className = '', ...props }) => {
  return (
    <Loader2
      className={`h-6 w-6 animate-spin text-yellow-600 ${className}`}
      {...props}
    />
  );
};
