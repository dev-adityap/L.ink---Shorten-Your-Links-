import { useState, useEffect } from 'react';

export default function LastUpdated() {
  const [date, setDate] = useState('');

  useEffect(() => {
    // Try to get from document lastModified, fallback to current year
    const lastMod = document.lastModified;
    if (lastMod && lastMod !== 'Invalid Date') {
      setDate(new Date(lastMod).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
    } else {
      setDate(new Date().toLocaleDateString(undefined, { year: 'numeric' }));
    }
  }, []);

  return (
    <p className="text-[10px] text-gray-500 font-sans">
      Last updated: {date || new Date().getFullYear()}
    </p>
  );
}
