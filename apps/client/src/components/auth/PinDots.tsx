import React from 'react';

interface PinDotsProps {
  length: number;
  filled: number;
}

const PinDots: React.FC<PinDotsProps> = ({ length, filled }) => {
  return (
    <div className="flex justify-center gap-4 py-6">
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
            i < filled
              ? 'bg-primary border-primary scale-110'
              : 'bg-transparent border-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

export default PinDots;
