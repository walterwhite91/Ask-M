import { useState, useEffect } from 'react';
import { BookOpen, FileText, ImageIcon, ExternalLink } from 'lucide-react';
import { ThinkingAnimation } from './ThinkingAnimation';
import { StreamingResponse } from './StreamingResponse';

interface SearchResponseProps {
  query: string;
}

// Mock AI response generator
const generateResponse = (query: string) => {
  return {
    summary: [
      'B-Trees are self-balancing tree data structures that maintain sorted data and allow searches, sequential access, insertions, and deletions in logarithmic time.',
      'Key properties include: All leaves are at the same level, nodes can have multiple keys (not just one), and the minimum degree t determines the range of keys.',
      'B-Trees are commonly used in databases and file systems because they minimize disk I/O operations by storing multiple keys per node.',
      'Time complexity: Search, Insert, Delete operations all run in O(log n) where n is the number of keys.',
    ],
    sources: [
      {
        type: 'syllabus',
        title: 'KU CS Syllabus Unit 4.1',
        subtitle: 'Advanced Data Structures - Trees',
        icon: BookOpen,
      },
      {
        type: 'document',
        title: 'Lecture_Slides_Wk5.pdf',
        subtitle: 'Page 12-18',
        icon: FileText,
      },
      {
        type: 'ocr',
        title: 'Handwritten_Notes_03.jpg',
        subtitle: 'OCR Extracted Content',
        icon: ImageIcon,
      },
    ],
  };
};

export function SearchResponse({ query }: SearchResponseProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);

  useEffect(() => {
    // Simulate initial loading phase (RAG retrieval)
    setIsLoading(true);
    setIsStreaming(false);
    setResponseData(null);

    const loadingTimer = setTimeout(() => {
      // After 1.5s, start streaming phase
      setIsLoading(false);
      setIsStreaming(true);
      setResponseData(generateResponse(query));

      // Mark as complete after streaming animation duration
      const streamingTimer = setTimeout(() => {
        setIsStreaming(false);
      }, 2500); // Allow time for all points to appear

      return () => clearTimeout(streamingTimer);
    }, 1500); // Simulate RAG retrieval time

    return () => clearTimeout(loadingTimer);
  }, [query]);

  // Show thinking animation during initial loading
  if (isLoading) {
    return <ThinkingAnimation query={query} />;
  }

  // Show streaming response
  if (isStreaming && responseData) {
    return (
      <StreamingResponse 
        query={query} 
        content={responseData} 
        isComplete={false}
      />
    );
  }

  // Show final complete response (fallback to instant display if needed)
  if (responseData) {
    return (
      <StreamingResponse 
        query={query} 
        content={responseData} 
        isComplete={true}
      />
    );
  }

  // Fallback loading state
  return <ThinkingAnimation query={query} />;
}