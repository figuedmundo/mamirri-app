import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import PinPad from './PinPad';
import PinDots from './PinDots';
import { api } from '../../lib/axios';
import { useAuth } from '../../hooks/use-auth';

interface PinSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PinSetupModal: React.FC<PinSetupModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const { checkPinStatus } = useAuth();

  const handlePinComplete = async (completedPin: string) => {
    if (step === 'enter') {
      setPin(completedPin);
      setConfirmPin('');
      setStep('confirm');
    } else {
      if (completedPin === pin) {
        try {
          await api.post('/auth/pin/setup', { pin: completedPin });
          await checkPinStatus();
          onClose();
        } catch (err) {
          setError('Error al guardar el PIN');
          reset();
        }
      } else {
        setError('Los PINs no coinciden');
        reset();
      }
    }
  };

  const reset = () => {
    setPin('');
    setConfirmPin('');
    setStep('enter');
  };

  const handleSkip = () => {
    localStorage.setItem('pin_setup_skipped', 'true');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {step === 'enter' ? 'Configurar PIN' : 'Confirmar PIN'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 'enter'
              ? 'Crea un PIN de 4 dígitos para acceder más rápido.'
              : 'Ingresa el PIN nuevamente para confirmar.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <PinDots
            length={4}
            filled={step === 'enter' ? pin.length : confirmPin.length}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm text-center mb-4">
              {error}
            </div>
          )}

          <PinPad
            pin={step === 'enter' ? pin : confirmPin}
            setPin={step === 'enter' ? setPin : setConfirmPin}
            onComplete={handlePinComplete}
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:underline"
          >
            Omitir por ahora
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PinSetupModal;
