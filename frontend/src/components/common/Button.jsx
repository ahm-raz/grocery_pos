import { LazyMotion, m } from 'framer-motion';

const loadFeatures = () => import('framer-motion').then((res) => res.domAnimation);

const Button = ({ children, onClick, variant = 'primary', disabled, className = '', type = 'button' }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
    success: 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
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

