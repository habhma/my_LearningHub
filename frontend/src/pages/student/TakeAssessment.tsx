import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { submissionService } from '@/services/submissionService';
import { StartAttemptResponse } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { soundManager } from '@/utils/sounds';
import { useAuthStore } from '@/store/authStore';
import { SPORTS_STARS, SportsStar } from '@/data/sportsStars';
import CongratulatoryModal from '@/components/gamification/CongratulatoryModal';

function TakeAssessment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [attemptData, setAttemptData] = useState<StartAttemptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answerFeedback, setAnswerFeedback] = useState<Record<string, boolean>>({}); // Track correct/wrong per question
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // NEW: Track current question

  // Gamification state
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [currentCelebratingStar, setCurrentCelebratingStar] = useState<SportsStar | null>(null);
  const [currentMilestone, setCurrentMilestone] = useState(0);
  const [milestonesReached, setMilestonesReached] = useState<Set<number>>(new Set());

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Load the assessment data
  useEffect(() => {
    if (!id) return;

    submissionService
      .startAttempt(id)
      .then((data) => {
        setAttemptData(data);

        const testConfig = (data.attempt as any).test?.testConfig;
        const durationInMinutes = testConfig?.duration;

        if (!durationInMinutes) {
          console.error('Test duration not found in testConfig:', testConfig);
          toast.error('Test duration not configured. Please contact admin.');
          setLoading(false);
          return;
        }

        const durationInSeconds = durationInMinutes * 60;
        const attemptStartTime = new Date((data.attempt as any).startedAt);
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - attemptStartTime.getTime()) / 1000);

        if (elapsedSeconds > 5) {
          const remainingSeconds = Math.max(0, durationInSeconds - elapsedSeconds);
          setTimeRemaining(remainingSeconds);
          setTimeElapsed(elapsedSeconds);
          startTimeRef.current = attemptStartTime;
          setTestStarted(true);

          toast('Resuming your previous attempt...', {
            duration: 3000,
            icon: '⏱️',
          });

          if (remainingSeconds <= 0) {
            toast.error('Time has expired for this assessment!');
            handleAutoSubmit(data.attempt.id);
          }
        } else {
          setTimeRemaining(durationInSeconds);
          setTimeElapsed(0);
        }
      })
      .catch((error: any) => toast.error(error.message || 'Failed to start assessment'))
      .finally(() => setLoading(false));
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (!attemptData || !testStarted || timeRemaining <= 0) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        setTimeElapsed((elapsed) => elapsed + 1);

        if (newTime <= 0) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          toast.error('Time is up! Submitting your assessment...');
          handleAutoSubmit(attemptData.attempt.id);
          return 0;
        }

        if (newTime === 300) {
          toast('5 minutes remaining!', {
            duration: 5000,
            icon: '⏰',
            style: {
              background: '#fef3c7',
              color: '#92400e',
            }
          });
        }

        if (newTime === 60) {
          toast('1 minute remaining!', {
            duration: 5000,
            icon: '⚠️',
            style: {
              background: '#fee2e2',
              color: '#991b1b',
            }
          });
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [attemptData, testStarted, timeRemaining]);

  const handleAutoSubmit = async (attemptId: string) => {
    try {
      const result = await submissionService.submitAttempt(attemptId);
      toast.success(`Assessment auto-submitted! Score: ${result.score}/${result.maxScore} (${Number(result.percentage).toFixed(0)}%)`);
      navigate('/student/results');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit assessment');
    }
  };

  const handleSelectOption = useCallback(
    async (questionId: string, optionId: string) => {
      if (!attemptData || !testStarted || timeRemaining <= 0) {
        toast.error('Time has expired or test not started!');
        return;
      }

      // Prevent changing answer if already answered
      if (questionId in answerFeedback) {
        toast.error('You cannot change your answer once selected!');
        return;
      }

      const currentQuestion = attemptData.questions[currentQuestionIndex];
      if (!currentQuestion) {
        toast.error('Question not found');
        return;
      }

      const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);
      const isCorrect = selectedOption?.isCorrect || false;

      // Play sound immediately
      if (isCorrect) {
        soundManager.playCorrect();
      } else {
        soundManager.playWrong();
      }

      // Store answer and feedback
      setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
      setAnswerFeedback((prev) => {
        const newFeedback = { ...prev, [questionId]: isCorrect };
        // Check milestone after updating feedback
        checkMilestone(newFeedback);
        return newFeedback;
      });

      setSavingQuestionId(questionId);
      try {
        await submissionService.submitAnswer(attemptData.attempt.id, {
          questionId,
          selectedOptionId: optionId,
        });
      } catch (error: any) {
        toast.error(error.message || 'Failed to save answer');
      } finally {
        setSavingQuestionId(null);
      }
    },
    [attemptData, testStarted, timeRemaining, currentQuestionIndex, answerFeedback]
  );

  const handleSubmit = async () => {
    if (!attemptData) return;

    if (!window.confirm('Are you sure you want to submit your assessment? You cannot change your answers after submission.')) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await submissionService.submitAttempt(attemptData.attempt.id);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      toast.success(`Submitted! Score: ${result.score}/${result.maxScore} (${Number(result.percentage).toFixed(0)}%)`);
      navigate('/student/results');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartTest = () => {
    if (!attemptData) return;
    setTestStarted(true);
    startTimeRef.current = new Date();
    toast.success('Test started! Good luck!');
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (attemptData?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      soundManager.playClick();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      soundManager.playClick();
    }
  };

  // Check if milestone is reached (20%, 40%, 60%, 80%, 100%)
  const checkMilestone = (feedback: Record<string, boolean>) => {
    if (!attemptData) return;

    const totalQuestions = attemptData.questions.length;
    const answeredQuestions = Object.keys(feedback).length;

    console.log('=== MILESTONE CHECK ===');
    console.log('Total questions:', totalQuestions);
    console.log('Answered questions:', answeredQuestions);
    console.log('Feedback:', feedback);
    console.log('Milestones reached so far:', Array.from(milestonesReached));

    // Calculate milestones
    const milestones = [20, 40, 60, 80, 100];

    for (const milestone of milestones) {
      const questionsNeeded = Math.ceil((milestone / 100) * totalQuestions);

      console.log(`Checking milestone ${milestone}%: need ${questionsNeeded} questions`);

      // Check if we've reached this milestone
      if (answeredQuestions >= questionsNeeded && !milestonesReached.has(milestone)) {
        // Check if ALL questions answered so far (in order) are correct
        // We need to check the first N questions by their order in the questions array
        const firstNQuestions = attemptData.questions.slice(0, questionsNeeded);
        console.log('First N questions:', firstNQuestions.map(q => q.questionId));

        const allCorrectInMilestone = firstNQuestions.every(q => {
          const isCorrect = feedback[q.questionId] === true;
          console.log(`Question ${q.questionId}: ${isCorrect ? 'CORRECT' : 'WRONG/UNANSWERED'}`);
          return isCorrect;
        });

        console.log(`All correct in milestone? ${allCorrectInMilestone}`);

        if (allCorrectInMilestone) {
          // Show celebration!
          console.log('🎉 SHOWING CELEBRATION FOR MILESTONE:', milestone);
          showMilestoneCelebration(milestone);
          setMilestonesReached(prev => new Set([...prev, milestone]));
          break; // Only show one milestone at a time
        }
      }
    }
  };

  const showMilestoneCelebration = (milestone: number) => {
    console.log('=== SHOW CELEBRATION ===');
    console.log('User:', user);

    // Get user's favorite sports stars from preferences
    const preferences = (user as any)?.profile?.preferences;
    console.log('Preferences:', preferences);

    const favoriteSportsStars = preferences?.favoriteSportsStars || [];
    console.log('Favorite sports stars:', favoriteSportsStars);

    if (favoriteSportsStars.length === 0) {
      // No sports stars selected, skip celebration
      console.log('❌ No sports stars selected, skipping celebration');
      return;
    }

    // Rotate through stars based on milestone
    // Milestones: 20%, 40%, 60%, 80%, 100% (0-4 index)
    const milestones = [20, 40, 60, 80, 100];
    const milestoneIndex = milestones.indexOf(milestone);
    const starIndex = milestoneIndex % favoriteSportsStars.length;
    const selectedStarId = favoriteSportsStars[starIndex];
    console.log(`Milestone ${milestone} (index ${milestoneIndex}) -> using star at index ${starIndex}: ${selectedStarId}`);

    const star = SPORTS_STARS.find(s => s.id === selectedStarId);
    console.log('Found star:', star);

    if (star) {
      console.log('✅ Setting celebration state');
      setCurrentCelebratingStar(star);
      setCurrentMilestone(milestone);
      setShowCongratulations(true);
    } else {
      console.log('❌ Star not found in SPORTS_STARS array');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    if (timeRemaining > 300) return 'text-green-600 dark:text-green-400';
    if (timeRemaining > 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getTimerBgColor = (): string => {
    if (timeRemaining > 300) return 'bg-green-100 dark:bg-green-900/30';
    if (timeRemaining > 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!attemptData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">This assessment is not available.</p>
      </div>
    );
  }

  const { questions } = attemptData;
  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentQuestionIndex];

  // Safety check - if currentQuestion is undefined, something went wrong
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">Question not found. Please restart the assessment.</p>
      </div>
    );
  }

  // Show instruction screen if test hasn't started yet
  if (!testStarted) {
    const testConfig = (attemptData.attempt as any).test?.testConfig;
    const duration = testConfig?.duration;
    const testName = (attemptData.attempt as any).test?.testName || 'Assessment';

    if (!duration) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-3xl mx-auto">
            <Card>
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-4">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Configuration Error
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This assessment is missing duration configuration. Please contact your administrator.
                </p>
                <button
                  onClick={() => navigate('/student/assessments')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  ← Back to Assessments
                </button>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600 dark:text-blue-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {testName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Read the instructions carefully before starting
                </p>
              </div>

              <div className="space-y-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Test Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <svg
                          className="w-5 h-5 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{duration} minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <svg
                          className="w-5 h-5 text-green-600 dark:text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Questions</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{questions.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <svg
                          className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Marks</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{questions.reduce((sum, q) => sum + q.marks, 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Important Instructions
                  </h3>
                  <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                    <li className="flex items-start gap-2">
                      <span className="font-bold mt-0.5">•</span>
                      <span>You'll see <strong>one question at a time</strong> with Next/Previous buttons for navigation.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold mt-0.5">•</span>
                      <span>You'll receive <strong>instant feedback</strong> (correct/wrong) with a sound when you select an answer.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold mt-0.5">•</span>
                      <span>Once you click "Start Test", the timer will begin and cannot be paused.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold mt-0.5">•</span>
                      <span>Your answers are automatically saved as you select them.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold mt-0.5">•</span>
                      <span>Detailed explanations for wrong answers will be shown after you submit the test.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => navigate('/student/assessments')}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  ← Back to Assessments
                </button>
                <Button
                  onClick={handleStartTest}
                  className="px-8 py-3 text-lg"
                >
                  Start Test
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Timer and Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Take Assessment</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {answeredCount} / {questions.length} answered
              </span>
            </div>
          </div>

          {/* Timer Card */}
          <Card>
            <div className={`p-4 ${getTimerBgColor()} transition-colors`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <svg
                      className={`w-6 h-6 ${getTimerColor()}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Time Remaining
                    </p>
                    <p className={`text-2xl font-bold ${getTimerColor()}`}>
                      {formatTime(timeRemaining)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 max-w-md mx-8">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-600 dark:bg-blue-500 transition-all"
                      style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Time Elapsed
                  </p>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {formatTime(timeElapsed)}
                  </p>
                </div>
              </div>
              {timeRemaining <= 300 && timeRemaining > 0 && (
                <div className="mt-3 text-sm font-medium text-center">
                  {timeRemaining <= 60 ? (
                    <span className="text-red-600 dark:text-red-400 animate-pulse">
                      ⚠️ Less than 1 minute remaining! Submit soon!
                    </span>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400">
                      ⏰ Less than 5 minutes remaining
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Current Question Card */}
        <Card>
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-semibold">
                    Question {currentQuestionIndex + 1}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentQuestion.marks} mark{currentQuestion.marks > 1 ? 's' : ''}
                  </span>
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white leading-relaxed">
                  {currentQuestion.questionText}
                </h3>
                {currentQuestion.questionImageUrl && (
                  <img
                    src={currentQuestion.questionImageUrl}
                    alt="Question"
                    className="mt-4 rounded-lg max-w-full h-auto"
                  />
                )}
              </div>
              {savingQuestionId === currentQuestion.questionId && (
                <span className="text-xs text-gray-400 ml-4">Saving...</span>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.length > 0 ? (
                currentQuestion.options.map((opt) => {
                  const isSelected = answers[currentQuestion.questionId] === opt.id;
                  const isAnswered = currentQuestion.questionId in answerFeedback;
                  const isCorrectAnswer = isAnswered && answerFeedback[currentQuestion.questionId];
                  const isWrongAnswer = isAnswered && !answerFeedback[currentQuestion.questionId];
                  const isDisabled = !testStarted || timeRemaining <= 0 || isAnswered; // Disable after answer is selected

                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        isSelected && isCorrectAnswer
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                          : isSelected && isWrongAnswer
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                          : isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.questionId}`}
                        checked={isSelected}
                        onChange={() => handleSelectOption(currentQuestion.questionId, opt.id)}
                        disabled={isDisabled}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="flex-1 text-base text-gray-900 dark:text-gray-100">
                        {opt.optionText}
                      </span>
                      {isSelected && isCorrectAnswer && (
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {isSelected && isWrongAnswer && (
                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </label>
                  );
                })
              ) : (
                <textarea
                  rows={4}
                  value={answers[currentQuestion.questionId] || ''}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [currentQuestion.questionId]: e.target.value }))
                  }
                  onBlur={async (e) => {
                    if (!attemptData || !testStarted || timeRemaining <= 0) return;
                    setSavingQuestionId(currentQuestion.questionId);
                    try {
                      await submissionService.submitAnswer(attemptData.attempt.id, {
                        questionId: currentQuestion.questionId,
                        textAnswer: e.target.value,
                      });
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to save answer');
                    } finally {
                      setSavingQuestionId(null);
                    }
                  }}
                  disabled={!testStarted || timeRemaining <= 0}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your answer..."
                />
              )}
            </div>

            {/* Instant Feedback Message */}
            {currentQuestion.questionId in answerFeedback && (
              <div className={`p-4 rounded-lg mb-6 ${
                answerFeedback[currentQuestion.questionId]
                  ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700'
                  : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700'
              }`}>
                <div className="flex items-center gap-2">
                  {answerFeedback[currentQuestion.questionId] ? (
                    <>
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-green-700 dark:text-green-300">
                        Correct! Well done! 🎉
                      </span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-red-700 dark:text-red-300">
                        Incorrect. Don't worry, you'll see the explanation after submission!
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Navigation and Submit Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                ← Previous
              </Button>

              <div className="flex gap-3">
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    isLoading={submitting}
                    disabled={!testStarted || timeRemaining <= 0}
                    className="px-8 py-2 bg-green-600 hover:bg-green-700"
                  >
                    Submit Assessment
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="px-6 py-2 disabled:cursor-not-allowed"
                  >
                    Next →
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Question Navigator - Mini dots */}
        <div className="mt-6 flex justify-center gap-2 flex-wrap">
          {questions.map((q, idx) => (
            <button
              key={q.questionId}
              onClick={() => {
                setCurrentQuestionIndex(idx);
                soundManager.playClick();
              }}
              className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                idx === currentQuestionIndex
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                  : answers[q.questionId]
                  ? 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              title={`Question ${idx + 1}${answers[q.questionId] ? ' (Answered)' : ''}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Congratulatory Modal */}
      {showCongratulations && currentCelebratingStar && (
        <CongratulatoryModal
          star={currentCelebratingStar}
          milestone={currentMilestone}
          isOpen={showCongratulations}
          onClose={() => setShowCongratulations(false)}
        />
      )}
    </div>
  );
}

export default TakeAssessment;
