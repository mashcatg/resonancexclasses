import { useEffect, useRef, useState } from 'react';

interface YouTubePlayerProps {
  url: string;
  title?: string;
  className?: string;
}

export const YouTubePlayer = ({ url, title, className = '' }: YouTubePlayerProps) => {
  const [embedUrl, setEmbedUrl] = useState<string>('');

  useEffect(() => {
    // Extract video ID from various YouTube URL formats
    const extractVideoId = (url: string): string | null => {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      return null;
    };

    const videoId = extractVideoId(url);
    if (videoId) {
      setEmbedUrl(`https://www.youtube.com/embed/${videoId}`);
    }
  }, [url]);

  if (!embedUrl) {
    return (
      <div className={`w-full aspect-video bg-muted flex items-center justify-center ${className}`}>
        <p className="text-muted-foreground">Invalid video URL</p>
      </div>
    );
  }

  return (
    <div className={`w-full aspect-video ${className}`}>
      <iframe
        src={embedUrl}
        title={title || 'YouTube video player'}
        className="w-full h-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};
