import { motion, AnimatePresence } from 'motion/react';
import { WelcomeScreen } from './WelcomeScreen';
import { SearchResponse } from './SearchResponse';

interface MainContentProps {
  activeSearch: string | null;
  onQuickStart: (query: string) => void;
}

export function MainContent({ activeSearch, onQuickStart }: MainContentProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-32 md:pb-32 pt-16 md:pt-0">
      <AnimatePresence mode="wait">
        {!activeSearch ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <WelcomeScreen onQuickStart={onQuickStart} />
          </motion.div>
        ) : (
          <motion.div
            key={`search-${activeSearch}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SearchResponse query={activeSearch} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}