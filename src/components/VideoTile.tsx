'use client';
// src/components/VideoTile.tsx — click-to-play YouTube tile: shows the video's own thumbnail clean,
// loads the player only when clicked (keeps titles uncovered, keeps the page light).
import { useState } from 'react';

export default function VideoTile({ id, title, sub, alt }: { id: string; title: string; sub: string; alt?: string }) {
  const [play, setPlay] = useState(false);
  const [src, setSrc] = useState(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`);
  if (!id) return null;
  return (
    <div>
      <div className="cn-vid">
        {play ? (
          <iframe
            src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
            title={alt || title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button className="cn-vid-btn" onClick={() => setPlay(true)} aria-label={`Play ${title}`}>
            <img src={src} alt={alt || title} loading="lazy" onError={() => setSrc(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)} />
            <span className="cn-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="30" height="30"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
            </span>
          </button>
        )}
      </div>
      <p className="cn-vid-title">{title}</p>
      <p className="cn-vid-sub">{sub}</p>
    </div>
  );
}
