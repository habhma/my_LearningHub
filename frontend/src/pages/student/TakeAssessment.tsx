import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { submissionService } from '@/services/submissionService';
import { StartAttemptResponse } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

function TakeAssessment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attemptData, setAttemptData] = useState<StartAttemptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [testStarted, setTestStarted] = useState(false); // Track if test has been started

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // in seconds
  const [timeElapsed, setTimeElapsed] = useState<number>(0); // in seconds
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Load the assessment data (but don't start timer until user clicks Start)
  useEffect(() => {
    if (!id) return;

    submissionService
      .startAttempt(id)
      .then((data) => {
        setAttemptData(data);

        // Get duration from test config (in minutes, convert to seconds)
        const testConfig = (data.attempt as any).test?.testConfig;
        const durationInMinutes = testConfig?.duration;

        if (!durationInMinutes) {
          console.error('Test duration not found in testConfig:', testConfig);
          toast.error('Test duration not configured. Please contact admin.');
          setLoading(false);
          return;
        }

        const durationInSeconds = durationInMinutes * 60;

        // Check if this is a resumed attempt (more than 5 seconds elapsed)
        const attemptStartTime = new Date((data.attempt as any).startedAt);
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - attemptStartTime.getTime()) / 1000);

        // If more than 5 seconds have elapsed, this is a genuine resume
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

          // If time already expired, auto-submit
          if (remainingSeconds <= 0) {
            toast.error('Time has expired for this assessment!');
            handleAutoSubmit(data.attempt.id);
          }
        } else {
          // Fresh attempt - wait for user to click Start Test
          setTimeRemaining(durationInSeconds);
          setTimeElapsed(0);
        }
      })
      .catch((error: any) => toast.error(error.message || 'Failed to start assessment'))
      .finally(() => setLoading(false));
  }, [id]);

  // Timer countdown (only when test is started)
  useEffect(() => {
    if (!attemptData || !testStarted || timeRemaining <= 0) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        setTimeElapsed((elapsed) => elapsed + 1);

        // Time's up! Auto-submit
        if (newTime <= 0) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          toast.error('Time\'s up! Submitting your assessment...');
          handleAutoSubmit(attemptData.attempt.id);
          return 0;
        }

        // Warning at 5 minutes
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

        // Warning at 1 minute
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

  // Auto-submit when time expires
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

      setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
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
    [attemptData, testStarted, timeRemaining]
  );

  const handleSubmit = async () => {
    if (!attemptData) return;

    // Confirm submission
    if (!window.confirm('Are you sure you want to submit your assessment? You cannot change your answers after submission.')) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await submissionService.submitAttempt(attemptData.attempt.id);

      // Clear timer
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

  // Start the test timer
  const handleStartTest = () => {
    if (!attemptData) return;

    setTestStarted(true);
    startTimeRef.current = new Date();
    toast.success('Test started! Good luck!');
  };

  // Format time display (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get timer color based on time remaining
  const getTimerColor = (): string => {
    if (timeRemaining > 300) return 'text-green-600 dark:text-green-400'; // > 5 mins
    if (timeRemaining > 60) return 'text-yellow-600 dark:text-yellow-400'; // > 1 min
    return 'text-red-600 dark:text-red-400'; // <= 1 min
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

  // Show instruction screen if test hasn't started yet
  if (!testStarted) {
    const testConfig = (attemptData.attempt as any).test?.testConfig;
    const duration = testConfig?.duration;
    const testName = (attemptData.attempt as any).test?.testName || 'Assessment';

    // If duration is missing, show error
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
                      <span>Once you click "Start Test", the timer will begin and cannot be paused.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold mt-0.5">•</span>
                      <span>Your answers are automatically saved as you select them.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold mt-0.5">•</span>
                      <span>If time expires, your test will be automatically submitted with all saved answers.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold mt-0.5">•</span>
                      <span>You cannot change answers after the time limit or after submission.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold mt-0.5">•</span>
                      <span>Make sure you have a stable internet connection throughout the test.</span>
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
      <div className="max-w-3xl mx-auto">
        {/* Header with Timer */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Take Assessment</h1>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {answeredCount} / {questions.length} answered
            </span>
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

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q, index) => (
            <Card key={q.questionId}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {index + 1}. {q.questionText}
                  </h3>
                  {savingQuestionId === q.questionId && (
                    <span className="text-xs text-gray-400">Saving...</span>
                  )}
                </div>
                <div className="space-y-2">
                  {q.options.length > 0 ? (
                    q.options.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          answers[q.questionId] === opt.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        } ${!testStarted || timeRemaining <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.questionId}`}
                          checked={answers[q.questionId] === opt.id}
                          onChange={() => handleSelectOption(q.questionId, opt.id)}
                          disabled={!testStarted || timeRemaining <= 0}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {opt.optionText}
                        </span>
                      </label>
                    ))
                  ) : (
                    <textarea
                      rows={3}
                      value={answers[q.questionId] || ''}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [q.questionId]: e.target.value }))
                      }
                      onBlur={async (e) => {
                        if (!attemptData || !testStarted || timeRemaining <= 0) return;
                        setSavingQuestionId(q.questionId);
                        try {
                          await submissionService.submitAnswer(attemptData.attempt.id, {
                            questionId: q.questionId,
                            textAnswer: e.target.value,
                          });
                        } catch (error: any) {
                          toast.error(error.message || 'Failed to save answer');
                        } finally {
                          setSavingQuestionId(null);
                        }
                      }}
                      disabled={!testStarted || timeRemaining <= 0}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Type your answer..."
                    />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            isLoading={submitting}
            disabled={!testStarted || timeRemaining <= 0}
          >
            Submit Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TakeAssessment;
