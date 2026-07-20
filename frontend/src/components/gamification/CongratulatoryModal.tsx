import { useEffect, useState } from 'react';
import { SportsStar, getCongratulatoryMessage } from '@/data/sportsStars';

interface CongratulatoryModalProps {
  star: SportsStar;
  milestone: number;
  isOpen: boolean;
  onClose: () => void;
}

function CongratulatoryModal({ star, milestone, isOpen, onClose }: CongratulatoryModalProps) {
  const [show, setShow] = useState(false);

  // Get celebration duration from environment variable (default to 5000ms if not set)
  const celebrationDuration = Number(import.meta.env.VITE_CELEBRATION_DURATION_MS) || 5000;

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      // Auto close after configured duration
      const timer = setTimeout(() => {
        handleClose();
      }, celebrationDuration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, celebrationDuration]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 300); // Wait for animation to finish
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={handleClose}
    >
      <div
        className={`relative max-w-md w-full transform transition-all duration-300 ${
          show ? 'scale-100 rotate-0' : 'scale-0 rotate-12'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Celebration Effects */}
        <div className="absolute inset-0 -z-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '2s',
              }}
            >
              {['🎉', '⭐', '🏆', '💫', '✨'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>

        {/* Modal Content */}
        <div
          className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl overflow-hidden border-4"
          style={{ borderColor: star.color }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header with Star Image */}
          <div
            className="relative h-[28rem] flex items-center justify-center overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${star.color}20 0%, ${star.color}40 100%)`,
            }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            </div>
            <img
              src={star.imageUrl}
              alt={star.name}
              className="relative w-96 h-96 rounded-full border-4 border-white dark:border-gray-700 shadow-2xl object-cover z-10"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(star.name)}&size=384&background=random`;
              }}
            />
            {/* Trophy Badge */}
            <div
              className="absolute bottom-4 right-4 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg"
              style={{ backgroundColor: star.color }}
            >
              🏆
            </div>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            {/* Milestone Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold text-sm shadow-lg mb-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {milestone}% Milestone Reached!
            </div>

            {/* Star Name */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {star.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {star.sport} • {star.country}
            </p>

            {/* Message */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 mb-4">
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {getCongratulatoryMessage(star.name, milestone)}
              </p>
            </div>

            {/* Quote */}
            <div className="border-l-4 pl-4 py-2 mb-4" style={{ borderColor: star.color }}>
              <p className="text-sm italic text-gray-700 dark:text-gray-300">
                "{star.quote}"
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                - {star.name}
              </p>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${star.color} 0%, ${star.color}dd 100%)`,
              }}
            >
              Keep Going! 💪
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CongratulatoryModal;
