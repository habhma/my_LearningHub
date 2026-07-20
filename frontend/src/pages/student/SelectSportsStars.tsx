import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { SPORTS_STARS } from '@/data/sportsStars';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import apiClient from '@/services/api';
import { useAuthStore } from '@/store/authStore';

function SelectSportsStars() {
  const navigate = useNavigate();
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const [selectedStars, setSelectedStars] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleToggleStar = (starId: string) => {
    if (selectedStars.includes(starId)) {
      setSelectedStars(selectedStars.filter(id => id !== starId));
    } else {
      if (selectedStars.length >= 5) {
        toast.error('You can select maximum 5 sports stars!');
        return;
      }
      setSelectedStars([...selectedStars, starId]);
    }
  };

  const handleSave = async () => {
    if (selectedStars.length !== 5) {
      toast.error('Please select exactly 5 sports stars!');
      return;
    }

    setSaving(true);
    try {
      // Update user preferences with selected sports stars
      await apiClient.put('/users/me', {
        preferences: {
          favoriteSportsStars: selectedStars,
          sportsStarsSelectedAt: new Date().toISOString(),
        }
      });

      // Refresh user data in auth store to get updated preferences
      await refreshUser();

      toast.success('Your favorite sports stars have been saved! 🌟');

      // Navigate to dashboard
      navigate('/student');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigate('/student');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Choose Your Champions! 🏆
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            Select <strong>5 favorite sports stars</strong> to motivate you during your tests
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            They'll cheer you on with special messages when you're doing great!
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Selected:
            </span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    selectedStars.length >= num
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg scale-110'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }`}
                >
                  {selectedStars.length >= num ? '✓' : num}
                </div>
              ))}
            </div>
            <span className={`text-lg font-bold ${selectedStars.length === 5 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {selectedStars.length}/5
            </span>
          </div>
        </div>

        {/* Sports Stars Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {SPORTS_STARS.map((star) => {
            const isSelected = selectedStars.includes(star.id);
            return (
              <Card key={star.id}>
                <button
                  onClick={() => handleToggleStar(star.id)}
                  className={`w-full p-4 text-center transition-all ${
                    isSelected
                      ? 'ring-4 ring-offset-2 dark:ring-offset-gray-800 shadow-xl transform scale-105'
                      : 'hover:shadow-lg hover:scale-102'
                  }`}
                  style={isSelected ? {
                    borderColor: star.color,
                  } : undefined}
                >
                  {/* Star Image */}
                  <div className="relative mb-3">
                    <img
                      src={star.imageUrl}
                      alt={star.name}
                      className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
                      onError={(e) => {
                        // Fallback to a placeholder if image fails to load
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(star.name)}&size=96&background=random`;
                      }}
                    />
                    {isSelected && (
                      <div
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                        style={{ backgroundColor: star.color }}
                      >
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Star Info */}
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                    {star.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {star.sport}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {star.country}
                  </p>
                </button>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleSkip}
            className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
          >
            Skip for now
          </button>
          <Button
            onClick={handleSave}
            isLoading={saving}
            disabled={selectedStars.length !== 5}
            className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500"
          >
            {selectedStars.length === 5 ? 'Save My Champions! 🎉' : `Select ${5 - selectedStars.length} More`}
          </Button>
        </div>

        {/* Info Box */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Your chosen sports stars will appear during tests</li>
                  <li>They'll celebrate with you at milestones (20%, 40%, 60%, 80%, 100%)</li>
                  <li>Only when ALL questions in that milestone are correct!</li>
                  <li>You can change your selection later from your profile</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectSportsStars;
