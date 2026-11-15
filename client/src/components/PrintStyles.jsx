export default function PrintStyles() {
  return (
    <style>
      {'@media print {'}
      {'  body { background: #ffffff !important; color: #000000 !important; }'}
      {'  .no-print, nav, footer, .cookie-banner, .back-to-top, .scroll-progress { display: none !important; }'}
      {'  .card-base { border: none; box-shadow: none; background: #ffffff !important; }'}
      {'  a::after { content: " (" attr(href) ")"; font-size: 0.8rem; color: #666; }'}
      {'  .stats-number { color: #000000 !important; }'}
      {'}'}
    </style>
  );
}
