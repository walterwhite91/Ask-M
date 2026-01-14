import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, FileText, ImageIcon, ExternalLink } from 'lucide-react';
import logoImage from 'figma:asset/1694061c55bf8d6ca212824ee7cf12e9c950947f.png';

interface StreamingResponseProps {
  query: string;
  content: {
    summary: string[];
    sources: Array<{
      type: string;
      title: string;
      subtitle: string;
      icon: any;
    }>;
  };
  isComplete: boolean;
}

export function StreamingResponse({ query, content, isComplete }: StreamingResponseProps) {
  const [visiblePoints, setVisiblePoints] = useState(0);
  const [showSources, setShowSources] = useState(false);

  useEffect(() => {
    // Simulate streaming by revealing points one by one
    if (visiblePoints < content.summary.length) {
      const timer = setTimeout(() => {
        setVisiblePoints(prev => prev + 1);
      }, 400); // 400ms delay between each point
      return () => clearTimeout(timer);
    } else if (isComplete && !showSources) {
      // Show sources after all points are visible
      const timer = setTimeout(() => {
        setShowSources(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visiblePoints, content.summary.length, isComplete, showSources]);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-4 md:space-y-6">
      {/* User Query */}
      <motion.div 
        className="flex justify-end"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-[#2D2E30] rounded-2xl px-4 md:px-6 py-3 md:py-4 max-w-2xl">
          <p className="text-white text-sm md:text-base">{query}</p>
        </div>
      </motion.div>

      {/* Ask-M Response */}
      <motion.div 
        className="bg-[#1E1F20] rounded-2xl md:rounded-3xl p-4 md:p-8 border border-[#2D2E30]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <img src={logoImage} alt="Ask-M Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
          <span className="text-lg md:text-xl text-white">Ask-M</span>
        </div>

        {/* Summary Content - Streaming */}
        <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
          <AnimatePresence>
            {content.summary.slice(0, visiblePoints).map((point, index) => (
              <motion.div 
                key={index} 
                className="flex gap-2 md:gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.span 
                  className="text-[#A0A0A0] mt-1 text-sm md:text-base"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  •
                </motion.span>
                <p className="text-white leading-relaxed text-sm md:text-base">
                  {point}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator while streaming */}
          {!isComplete && visiblePoints < content.summary.length && (
            <motion.div 
              className="flex gap-3 items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-[#A0A0A0] mt-1 text-sm md:text-base">•</span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-white rounded-full shadow-sm shadow-white/50"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sources & Syllabus Alignment - Fade in when complete */}
        <AnimatePresence>
          {showSources && (
            <motion.div 
              className="border-t border-[#2D2E30] pt-4 md:pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-[#A0A0A0] text-xs md:text-sm mb-3 md:mb-4">
                Sources & Syllabus Alignment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                {content.sources.map((source, index) => {
                  const IconComponent = source.icon;
                  return (
                    <motion.button
                      key={index}
                      className="bg-[#2D2E30] hover:bg-[#3D3E40] rounded-xl p-3 md:p-4 text-left transition-colors group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-[#1E1F20] rounded-lg">
                          <IconComponent className="w-3 h-3 md:w-4 md:h-4 text-[#A0A0A0]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-white text-xs md:text-sm truncate">
                              {source.title}
                            </p>
                            <ExternalLink className="w-3 h-3 text-[#A0A0A0] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </div>
                          <p className="text-[#A0A0A0] text-xs mt-1">
                            {source.subtitle}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}