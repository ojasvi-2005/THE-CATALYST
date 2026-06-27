import React from 'react';

interface MascotDrawingProps {
  pose: 'waving' | 'sleeping' | 'studying' | 'flag' | 'dancing';
  className?: string;
  size?: number;
}

export default function MascotDrawing({ pose, className = '', size = 110 }: MascotDrawingProps) {
  // Common styles: Pure white fills, thick clean black outlines, hand-drawn manga aesthetic.
  const strokeColor = '#111111';
  const strokeWidth = 2;
  const fillColor = '#FFFFFF';
  const accentFill = '#FAF6F0';

  switch (pose) {
    case 'sleeping':
      // Panel 2 top card: sleepy cat with eyes closed on a pillow under a cozy blanket
      return (
        <svg
          width={size}
          height={size * 0.75}
          viewBox="0 0 160 110"
          className={`select-none ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bed / Cushion Pillow */}
          <path
            d="M 10 90 Q 80 105 150 90 Q 155 70 145 60 Q 80 65 15 60 Q 5 70 10 90 Z"
            fill={accentFill}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Sleeping Cat body/head */}
          <path
            d="M 45 65 Q 40 40 60 30 Q 70 42 75 42 Q 80 42 90 30 Q 110 40 105 65 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {/* Left Ear */}
          <path d="M 46 45 L 38 22 L 56 34" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />
          {/* Right Ear */}
          <path d="M 104 45 L 112 22 L 94 34" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />
          
          {/* Cozy Blanket covering the body */}
          <path
            d="M 25 88 Q 80 50 135 88"
            stroke={strokeColor}
            strokeWidth={strokeWidth + 0.5}
            strokeLinecap="round"
            fill="none"
          />
          {/* Blanket details / stripes */}
          <path d="M 50 78 Q 80 58 110 78" stroke={strokeColor} strokeWidth={1} strokeDasharray="3 3" fill="none" />
          <path d="M 60 84 Q 80 65 100 84" stroke={strokeColor} strokeWidth={1} strokeDasharray="3 3" fill="none" />

          {/* Sleeping eyes (closed curves) */}
          <path d="M 60 52 Q 65 57 70 52" stroke={strokeColor} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <path d="M 80 52 Q 85 57 90 52" stroke={strokeColor} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          
          {/* Little nose and smiling mouth */}
          <path d="M 75 56 Q 74 59 75 59" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" fill="none" />
          <path d="M 72 61 Q 74 63 75 61 Q 76 63 78 61" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" fill="none" />
          
          {/* Blush cheeks */}
          <ellipse cx="55" cy="58" rx="4" ry="2" fill="#FFAAAA" opacity="0.7" />
          <ellipse cx="95" cy="58" rx="4" ry="2" fill="#FFAAAA" opacity="0.7" />

          {/* Cat whiskers */}
          <line x1="38" y1="54" x2="28" y2="52" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" />
          <line x1="38" y1="59" x2="26" y2="59" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" />
          <line x1="112" y1="54" x2="122" y2="52" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" />
          <line x1="112" y1="59" x2="124" y2="59" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" />

          {/* Floating sleepy Zs */}
          <text x="120" y="30" fill={strokeColor} fontSize="14" fontWeight="bold" fontFamily="sans-serif">Z</text>
          <text x="135" y="45" fill={strokeColor} fontSize="10" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="145" y="58" fill={strokeColor} fontSize="8" fontWeight="bold" fontFamily="sans-serif">z</text>
        </svg>
      );

    case 'studying':
      // Panel 2 middle bubble: cat at laptop with mug
      return (
        <svg
          width={size}
          height={size * 0.9}
          viewBox="0 0 150 130"
          className={`select-none ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ground outline */}
          <path d="M 10 115 L 140 115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />

          {/* Cozy Cat Body */}
          <path
            d="M 60 115 Q 50 55 85 55 Q 120 55 110 115 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />

          {/* Ears */}
          <path d="M 66 65 L 58 40 L 78 54" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <path d="M 104 65 L 112 40 L 92 54" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />

          {/* Face details */}
          <circle cx="76" cy="74" r="2.5" fill={strokeColor} />
          <circle cx="94" cy="74" r="2.5" fill={strokeColor} />
          <path d="M 83 78 Q 85 80 87 78" stroke={strokeColor} strokeWidth={1.5} fill="none" />
          
          {/* Whiskers */}
          <line x1="56" y1="74" x2="44" y2="72" stroke={strokeColor} strokeWidth={1.2} />
          <line x1="56" y1="79" x2="42" y2="80" stroke={strokeColor} strokeWidth={1.2} />
          <line x1="114" y1="74" x2="126" y2="72" stroke={strokeColor} strokeWidth={1.2} />
          <line x1="114" y1="79" x2="128" y2="80" stroke={strokeColor} strokeWidth={1.2} />

          {/* Little Blush */}
          <ellipse cx="71" cy="79" rx="3" ry="1.5" fill="#FFAAAA" />
          <ellipse cx="99" cy="79" rx="3" ry="1.5" fill="#FFAAAA" />

          {/* Laptop (folded open) */}
          <path
            d="M 25 115 L 45 90 L 80 90 L 80 115 Z"
            fill={accentFill}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {/* Laptop Screen outline */}
          <path d="M 45 90 L 50 68 L 78 68 L 80 90" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
          {/* Keyboard lines */}
          <line x1="32" y1="110" x2="72" y2="110" stroke={strokeColor} strokeWidth={1.5} />
          {/* Paw typing */}
          <path
            d="M 52 100 Q 48 94 44 98"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />

          {/* Coffee Mug */}
          <rect x="112" y="98" width="16" height="17" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} />
          {/* Mug handle */}
          <path d="M 128 102 Q 133 106 128 111" stroke={strokeColor} strokeWidth={1.5} fill="none" />
          {/* Steamy swirls */}
          <path d="M 116 93 Q 118 89 116 86" stroke={strokeColor} strokeWidth={1} fill="none" />
          <path d="M 122 93 Q 124 89 122 86" stroke={strokeColor} strokeWidth={1} fill="none" />

          {/* Decorative Sparkles */}
          <path d="M 115 45 L 118 48 L 123 45 L 118 42 Z" fill="#FFAAAA" />
          <path d="M 28 55 L 31 58 L 36 55 L 31 52 Z" fill="#FFAAAA" />
        </svg>
      );

    case 'flag':
      // Panel 2 progress card: cat holding a flag on a hill
      return (
        <svg
          width={size}
          height={size * 0.9}
          viewBox="0 0 140 130"
          className={`select-none ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* A small hill/mound */}
          <path
            d="M 10 115 Q 70 85 130 115"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill={accentFill}
          />

          {/* Tiny Cat */}
          <path
            d="M 45 105 Q 35 60 62 60 Q 90 60 80 105 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {/* Ears */}
          <path d="M 48 70 L 42 50 L 58 61" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <path d="M 76 70 L 82 50 L 66 61" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />

          {/* Face */}
          <circle cx="56" cy="76" r="2" fill={strokeColor} />
          <circle cx="70" cy="76" r="2" fill={strokeColor} />
          <path d="M 61 80 Q 63 81 65 80" stroke={strokeColor} strokeWidth={1.2} fill="none" />

          {/* Tail */}
          <path d="M 38 102 Q 25 100 28 85" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />

          {/* Flagpole */}
          <line x1="88" y1="108" x2="88" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          {/* Triangular Flag */}
          <path
            d="M 88 35 L 115 47 L 88 60 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          {/* Flag star drawing */}
          <polygon points="98,46 100,48 103,48 101,50 102,53 100,51 98,53 99,50" fill={strokeColor} />

          {/* Cat paw planting flagpole */}
          <path
            d="M 75 88 Q 83 88 88 88"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );

    case 'dancing':
      // Panel 2 streak card: cute happy jumping cat
      return (
        <svg
          width={size}
          height={size * 0.9}
          viewBox="0 0 130 120"
          className={`select-none ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sparkles / Little stars around */}
          <path d="M 20 25 L 24 32 L 31 32 L 25 36 L 27 43 L 20 39 L 13 43 L 15 36 L 9 32 L 16 32 Z" fill="#FFF275" stroke={strokeColor} strokeWidth={1} />
          <path d="M 105 20 L 108 25 L 114 25 L 109 29 L 111 35 L 105 31 L 99 35 L 101 29 L 96 25 L 102 25 Z" fill="#FFF275" stroke={strokeColor} strokeWidth={1} />
          
          {/* Jumping body */}
          <path
            d="M 40 85 Q 35 40 65 40 Q 95 40 90 85 Q 80 95 65 95 Q 50 95 40 85 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />

          {/* Ears */}
          <path d="M 46 50 L 38 25 L 58 38" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <path d="M 84 50 L 92 25 L 72 38" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />

          {/* Face: Happy closed eyes ^ ^ */}
          <path d="M 52 56 L 58 50 L 64 56" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 72 56 L 78 50 L 84 56" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* Blush and mouth */}
          <path d="M 64 64 Q 66 66 68 64 Q 70 66 72 64" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" fill="none" />
          <ellipse cx="48" cy="62" rx="4" ry="2" fill="#FFAAAA" />
          <ellipse cx="86" cy="62" rx="4" ry="2" fill="#FFAAAA" />

          {/* Happy raised paws */}
          <path d="M 36 65 Q 22 55 26 48" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
          <path d="M 94 65 Q 108 55 104 48" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />

          {/* Wiggling feet */}
          <path d="M 52 94 Q 50 108 55 108" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
          <path d="M 78 94 Q 80 108 75 108" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'waving':
    default:
      // Waving cat greeting card / general mascot
      return (
        <svg
          width={size}
          height={size * 0.9}
          viewBox="0 0 130 120"
          className={`select-none ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Fat Cat Body */}
          <path
            d="M 35 95 Q 30 40 65 40 Q 100 40 95 95 Q 85 105 65 105 Q 45 105 35 95 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />

          {/* Ears */}
          <path d="M 42 50 L 34 25 L 54 38" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <path d="M 88 50 L 96 25 L 76 38" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinejoin="round" />

          {/* Eyes (Round dots with sparkle highlights) */}
          <circle cx="54" cy="58" r="3.5" fill={strokeColor} />
          <circle cx="76" cy="58" r="3.5" fill={strokeColor} />
          
          {/* Whiskers */}
          <line x1="32" y1="62" x2="18" y2="60" stroke={strokeColor} strokeWidth={1.2} />
          <line x1="32" y1="68" x2="16" y2="68" stroke={strokeColor} strokeWidth={1.2} />
          <line x1="98" y1="62" x2="112" y2="60" stroke={strokeColor} strokeWidth={1.2} />
          <line x1="98" y1="68" x2="114" y2="68" stroke={strokeColor} strokeWidth={1.2} />

          {/* Blush cheeks */}
          <ellipse cx="48" cy="64" rx="4" ry="2" fill="#FFAAAA" />
          <ellipse cx="82" cy="64" rx="4" ry="2" fill="#FFAAAA" />

          {/* Happy w-shaped mouth */}
          <path d="M 61 63 Q 63 65 65 63 Q 67 65 69 63" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" fill="none" />

          {/* Left paw waving up */}
          <path
            d="M 92 70 Q 112 55 108 45"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
          {/* Left paw pads */}
          <circle cx="106" cy="46" r="2" fill="#FFAAAA" />
          <circle cx="111" cy="50" r="1" fill="#FFAAAA" />
          <circle cx="106" cy="52" r="1" fill="#FFAAAA" />

          {/* Right resting paw */}
          <path
            d="M 38 72 Q 28 72 24 74"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Tail */}
          <path
            d="M 32 90 Q 15 95 18 80"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      );
  }
}
