import { LazyMotion, m, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const loadFeatures = () => import('framer-motion').then((res) => res.domAnimation);

const AnimatedRoute = ({ children, skipAnimation = false }) => {
  const location = useLocation();

  if (skipAnimation) {
    return <>{children}</>;
  }

  return (
    <LazyMotion features={loadFeatures} strict>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );
};

export default AnimatedRoute;

