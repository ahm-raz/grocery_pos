import { LazyMotion, m } from 'framer-motion';

const loadFeatures = () => import('framer-motion').then((res) => res.domAnimation);

const AnimatedCard = ({ children, className = '', onClick, delay = 0 }) => {
  return (
    <LazyMotion features={loadFeatures} strict>
      <m.div
        className={className}
        onClick={onClick}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay,
          ease: [0.4, 0, 0.2, 1],
        }}
        whileHover={onClick ? { y: -2, transition: { duration: 0.2 } } : {}}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
};

export default AnimatedCard;

