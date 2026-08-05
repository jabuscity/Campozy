'use client';

const UNIVERSITIES = [
  'University of Nairobi',
  'Kenyatta University',
  'Moi University',
  'JKUAT',
  'Egerton University',
  'Maseno University',
  'MMUST',
  'Chuka University',
  'Karatina University',
  'Laikipia University',
  'Meru University',
  'Technical University of Mombasa',
  'Kibabii University',
  'Rongo University',
  'University of Eldoret',
  'University of Kabianga',
  'University of Kisii',
  'University of Embu',
  'UEAB',
  'SEKU',
  'Pwani University',
  'Dedan Kimathi University',
  'Technical University of Kenya',
  'Multimedia University',
  'Masai Mara University',
];

export function UniversityTicker() {
  const repeated = [...UNIVERSITIES, ...UNIVERSITIES];

  return (
    <div className="w-full bg-white/80 backdrop-blur-md border-b border-neutral-200 py-3 overflow-hidden">
      <div className="relative">
        <div className="flex whitespace-nowrap animate-ticker">
          {repeated.map((name, i) => (
            <span
              key={i}
              className="mx-6 text-xs font-bold uppercase tracking-widest text-neutral-400 whitespace-nowrap"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
        @media (max-width: 768px) {
          .animate-ticker {
            animation: ticker 14s linear infinite;
          }
        }
      `}</style>
    </div>
  );
}
