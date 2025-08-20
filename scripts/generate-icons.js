// Simple script to generate PWA icons from the SVG
// Run this with: node scripts/generate-icons.js

console.log(`
To generate PWA icons:

1. Use the icon.svg in the public folder
2. Go to: https://realfavicongenerator.net/ or https://maskable.app/
3. Upload the SVG
4. Download the generated icons
5. Place them in the public folder:
   - icon-192.png (192x192)
   - icon-512.png (512x512)
   - apple-touch-icon.png (180x180)
   - favicon.ico

Or use imagemagick:
  convert public/icon.svg -resize 192x192 public/icon-192.png
  convert public/icon.svg -resize 512x512 public/icon-512.png
`);
