// src/utils/fontLoader.js
export function loadFonts(fonts) {
  // Remove any existing font links
  document.querySelectorAll('link[rel="stylesheet"][href*="fonts.googleapis.com"]').forEach(link => {
    link.remove();
  });

  // Load Google Fonts
  const fontFamilies = fonts
    .filter(font => !font.includes('Arial') && 
                   !font.includes('Times New Roman') && 
                   !font.includes('Courier New') && 
                   !font.includes('Georgia') && 
                   !font.includes('Verdana'))
    .map(font => {
      // Extract font name (remove any fallback fonts)
      const fontName = font.split(',')[0].trim();
      // Replace spaces with + for Google Fonts URL
      return fontName.replace(/ /g, '+');
    })
    .join('|');

  if (fontFamilies) {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies}:wght@300;400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
}

// Save and load font preference from localStorage
export function saveFontPreference(font) {
  localStorage.setItem('userFontPreference', font);
}

export function getFontPreference() {
  return localStorage.getItem('userFontPreference') || 'Arial, sans-serif';
}