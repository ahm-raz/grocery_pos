import { LazyMotion, m } from 'framer-motion';

const loadFeatures = () => import('framer-motion').then((res) => res.domAnimation);

const MetricCard = ({ title, value, subtitle, icon, color = 'blue', delay = 0 }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400',
    gray: 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300',
  };

  return (
    <LazyMotion features={loadFeatures} strict>
      <m.div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 ${colorClasses[color]}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay,
          ease: [0.4, 0, 0.2, 1],
        }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className={`text-3xl ${colorClasses[color].split(' ')[0]}`}>
              {icon}
            </div>
          )}
        </div>
      </m.div>
    </LazyMotion>
  );
};

export default MetricCard;

