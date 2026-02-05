import React from 'react';
import { Button } from '../ui/button';
import { Delete } from 'lucide-react';

interface PinPadProps {
  onComplete: (pin: string) => void;
  onBackspace?: () => void;
  pin: string;
  setPin: (pin: string) => void;
}

const PinPad: React.FC<PinPadProps> = ({
  onComplete,
  onBackspace,
  pin,
  setPin,
}) => {
  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        onComplete(newPin);
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      onBackspace?.();
    }
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-[320px] mx-auto">
      {numbers.map((num) => (
        <Button
          key={num}
          variant="ghost"
          className="h-[70px] text-2xl font-semibold rounded-full hover:bg-gray-100"
          onClick={() => handleNumberClick(num)}
        >
          {num}
        </Button>
      ))}
      <Button
        variant="ghost"
        className="h-[70px] text-2xl font-semibold rounded-full hover:bg-gray-100"
        onClick={handleBackspace}
      >
        <Delete className="w-8 h-8" />
      </Button>
      <Button
        variant="ghost"
        className="h-[70px] text-2xl font-semibold rounded-full hover:bg-gray-100"
        onClick={() => handleNumberClick('0')}
      >
        0
      </Button>
      <div className="h-[70px]" />
    </div>
  );
};

export default PinPad;
