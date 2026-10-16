# OASIS brand kit (derived from the supplied logo)

Source: `oasis-logo.png` (1024×1024, champagne-gold line art on navy). Nothing here is recolored or redrawn. The other files are crops, scales and one optical adjustment (noted under favicons).

| File | Use |
|---|---|
| `oasis-logo.png` | Full lockup: ring + 12-point star + "OASIS" + "Odisha · Startup Community". The original. Minimum 160 px wide (below that the tagline is unreadable). |
| `oasis-mark.png` | Ring and star only, on navy, 1024 px. |
| `icon-192.png`, `icon-512.png` | PWA manifest icons. |
| `icon-maskable-512.png` | Maskable PWA icon. The mark sits inside the 80% safe zone. |
| `apple-touch-icon.png` | 180 px iOS home-screen icon. |
| `favicon.ico`, `favicon-32.png`, `favicon-16.png` | Favicons. The hairlines are thickened slightly before downscaling so they survive at tiny sizes. This is the only adjustment made. |
| `og-image.png` | 1200×630 link/social preview. |
| `oasis-logo-email.png` | 480 px email header logo. Display at 240 px wide for sharp retina rendering. |

## Colors (sampled from the logo)

- Navy `#1E1F33`
- Champagne gold `#F3D3A2` (the line color ranges from `#E9C68C` to `#FBE4B5`)
- Cream `#FCF6E3`

The full light and dark token sets (ivory canvas, antique gold for text on light surfaces, status colors) are in the frontend prompt, section 3.2. All 22 text and UI color pairs were checked against WCAG 2.1 AA.

## Rules

- Always place the logo on navy. It is gold on navy and has no light-background version.
- Do not recolor, stretch, rotate, outline or add effects. Clear space around it equals the height of the "O" in OASIS.

## Known limits

- These are raster files. Ask the designer for an SVG master. The 1024 px PNG looks soft above roughly 400 px on high-density screens.
- A navy-on-ivory version of the logo does not exist yet. Until it does, keep the logo on navy surfaces.
- The 16 px favicon is only an approximation of the wheel. A designer-made simplified mark for tiny sizes would look better.
