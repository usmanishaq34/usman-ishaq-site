// The dashboard's stylesheet names these families directly ('Fraunces',
// 'Inter', 'JetBrains Mono'), so the admin loads them from Google Fonts.
export const LEGACY_FONTS =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..900,0..100;1,9..144,300..900,0..100&family=Inter:wght@400;500;600;700;800&family=Manrope:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap";

export function LegacyFonts() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={LEGACY_FONTS} precedence="default" />
    </>
  );
}
