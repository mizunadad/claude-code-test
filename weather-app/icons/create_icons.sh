#!/bin/bash

# Create simple SVG weather icons
for size in 72 96 128 144 152 192 384 512; do
    cat > "icon-${size}x${size}.svg" << EOF
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7BB3F0;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" rx="$((size/8))"/>
  <circle cx="50%" cy="35%" r="$((size/5))" fill="#FFD700" opacity="0.9"/>
  <ellipse cx="$((size/4))" cy="$((size*3/4))" rx="$((size/6))" ry="$((size/8))" fill="#87CEEB" opacity="0.7"/>
  <ellipse cx="$((size*3/4))" cy="$((size*2/3))" rx="$((size/7))" ry="$((size/10))" fill="#87CEEB" opacity="0.7"/>
  <text x="50%" y="95%" text-anchor="middle" font-family="Arial, sans-serif" font-size="$((size/12))" fill="white" opacity="0.8">Weather</text>
</svg>
EOF
done

echo "Created SVG icons for all sizes"