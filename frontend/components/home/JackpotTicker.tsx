'use client';

import { useState, useEffect } from 'react';

export default function JackpotTicker() {
  const [jackpots, setJackpots] = useState([
    { id: 1, name: 'Mega Moolah', amount: 5234567 },
    { id: 2, name: 'Divine Fortune', amount: 1567890 },
    { id: 3, name: 'Hall of Gods', amount: 987654 },
    { id: 4, name: 'Mega Fortune', amount: 3456789 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setJackpots((prev) =>
        prev.map((jackpot) => ({
          ...jackpot,
          amount: jackpot.amount + Math.floor(Math.random() * 50),
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatSC = (amount: number) => {
    return `${amount.toLocaleString()} SC`;
  };

  return (
    <section className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 py-6 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-12 animate-marquee">
          {jackpots.map((jackpot) => (
            <div key={jackpot.id} className="flex items-center space-x-3 whitespace-nowrap">
              <span className="text-2xl">&#x2B50;</span>
              <div>
                <p className="text-sm font-bold text-gray-900">{jackpot.name}</p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">
                  {formatSC(jackpot.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
