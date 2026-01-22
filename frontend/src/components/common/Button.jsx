import { LazyMotion, m } from 'framer-motion';

const loadFeatures = () => import('framer-motion').then((res) => res.domAnimation);

const Button = ({ children, onClick, variant = 'primary', disabled, className = '', type = 'button' }) => {
  const baseClasses = 'px-4 py-2.5 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg focus:ring-blue-500 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 shadow-sm hover:shadow-md focus:ring-gray-500',
    danger: 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 shadow-md hover:shadow-lg focus:ring-red-500 dark:from-red-500 dark:to-pink-500 dark:hover:from-red-600 dark:hover:to-pink-600',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg focus:ring-green-500 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600',
  };

  return (
    <LazyMotion features={loadFeatures} strict>
      <m.button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${variants[variant]} ${className}`}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.98 }}
        transition={{ duration: 0.1, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </m.button>
    </LazyMotion>
  );
};

export default Button;

