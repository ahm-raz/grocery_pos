import { LazyMotion, m, AnimatePresence } from 'framer-motion';

const loadFeatures = () => import('framer-motion').then((res) => res.domAnimation);

const AnimatedModal = ({ isOpen, onClose, children, className = '' }) => {
  return (
    <LazyMotion features={loadFeatures} strict>
      <AnimatePresence>
        {isOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={onClose}
            />
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1],
              }}
              className={`fixed inset-0 flex items-center justify-center z-50 pointer-events-none ${className}`}
            >
              <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                {children}
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
};

export default AnimatedModal;

