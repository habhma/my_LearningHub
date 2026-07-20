import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import apiClient from '@/services/api';

interface QuestionOption {
  id: string;
  optionText: string;
  isCorrect?: boolean;
}

interface QuestionExplanation {
  id: string;
  explanationType: string;
  explanationText: string;
  explanationHtml: string | null;
  explanationImages: any[];
  explanationVideoUrl: string | null;
  stepByStep: any | null;
  displayOrder: number;
}

interface QuestionResponse {
  id: string;
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  marksAwarded: number;
  marksPossible: number;
  timeTakenSeconds: number;
  question: {
    id: string;
    questionText: string;
    correctAnswer: string;
    options?: QuestionOption[];
    explanations?: QuestionExplanation[];
  };
  selectedOption: {
    optionText: string;
  } | null;
}

interface AttemptDetail {
  id: string;
  status: string;
  startedAt: string;
  submittedAt: string;
  timeTakenSeconds: number;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unattempted: number;
  score: number;
  maxScore: number;
  percentage: number;
  test: {
    id: string;
    testName: string;
    testType: string;
    subject?: {
      subjectName: string;
    };
  };
  responses: QuestionResponse[];
}

function ResultDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'unattempted'>('all');

  useEffect(() => {
    if (!id) return;

    const fetchAttemptDetail = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<{ success: boolean; data: AttemptDetail }>(
          `/submissions/${id}`
        );
        setAttempt(response.data.data);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load result details');
        console.error('Fetch attempt error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <Card>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Result Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The result you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link
              to="/student/results"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to Results
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const filteredResponses = attempt.responses.filter((response) => {
    if (filter === 'correct') return response.isCorrect;
    if (filter === 'wrong') return !response.isCorrect && response.selectedOptionId;
    if (filter === 'unattempted') return !response.selectedOptionId;
    return true;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/student/results')}
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 flex items-center gap-2"
          >
            ← Back to Results
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {attempt.test.testName}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {attempt.test.subject?.subjectName} • {attempt.test.testType}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Score
              </p>
              <div className={`text-3xl font-bold ${getScoreColor(attempt.percentage)}`}>
                {Math.round(attempt.percentage)}%
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {attempt.score} / {attempt.maxScore} points
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Correct Answers
              </p>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {attempt.correctAnswers}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                out of {attempt.totalQuestions}
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Wrong Answers
              </p>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {attempt.wrongAnswers}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {attempt.unattempted} unattempted
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Time Taken
              </p>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(attempt.timeTakenSeconds / 60)}m
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatTime(attempt.timeTakenSeconds)}
              </p>
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            All Questions ({attempt.responses.length})
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'correct'
                ? 'bg-green-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Correct ({attempt.correctAnswers})
          </button>
          <button
            onClick={() => setFilter('wrong')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'wrong'
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Wrong ({attempt.wrongAnswers})
          </button>
          <button
            onClick={() => setFilter('unattempted')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unattempted'
                ? 'bg-gray-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Unattempted ({attempt.unattempted})
          </button>
        </div>

        {/* Questions and Answers */}
        <div className="space-y-6">
          {filteredResponses.map((response, index) => (
            <Card key={response.id}>
              <div className="p-6">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        response.isCorrect
                          ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                          : response.selectedOptionId
                          ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {response.isCorrect ? '✓' : response.selectedOptionId ? '✗' : '-'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Question {index + 1}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {response.question.questionText}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        response.isCorrect
                          ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {response.marksAwarded} / {response.marksPossible} marks
                    </span>
                    {response.timeTakenSeconds > 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTime(response.timeTakenSeconds)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Answer Section */}
                <div className="space-y-3 mt-4">
                  {response.selectedOptionId ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Your Answer:
                        </p>
                        <div
                          className={`p-3 rounded-lg ${
                            response.isCorrect
                              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                          }`}
                        >
                          <p className="text-gray-900 dark:text-white">
                            {response.selectedOption?.optionText}
                          </p>
                        </div>
                      </div>
                      {!response.isCorrect && (
                        <>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Correct Answer:
                            </p>
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                              <p className="text-gray-900 dark:text-white">
                                {response.question.correctAnswer}
                              </p>
                            </div>
                          </div>
                          {/* Explanation for Wrong Answers */}
                          {response.question.explanations && response.question.explanations.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Explanation:
                              </p>
                              <div className="space-y-3">
                                {response.question.explanations
                                  .filter(exp => exp.explanationType === 'WRONG_ANSWER' || exp.explanationType === 'CORRECT_ANSWER')
                                  .map((explanation) => (
                                    <div
                                      key={explanation.id}
                                      className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                    >
                                      {explanation.explanationHtml ? (
                                        <div
                                          className="text-gray-900 dark:text-white prose dark:prose-invert max-w-none"
                                          dangerouslySetInnerHTML={{ __html: explanation.explanationHtml }}
                                        />
                                      ) : (
                                        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                          {explanation.explanationText}
                                        </p>
                                      )}
                                      {explanation.explanationVideoUrl && (
                                        <div className="mt-3">
                                          <a
                                            href={explanation.explanationVideoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                                          >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                            </svg>
                                            Watch Video Explanation
                                          </a>
                                        </div>
                                      )}
                                      {explanation.stepByStep && (
                                        <div className="mt-3 border-t border-blue-200 dark:border-blue-700 pt-3">
                                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Step-by-Step Solution:
                                          </p>
                                          <ol className="list-decimal list-inside space-y-1 text-gray-900 dark:text-white">
                                            {Array.isArray(explanation.stepByStep) ? (
                                              explanation.stepByStep.map((step: string, idx: number) => (
                                                <li key={idx}>{step}</li>
                                              ))
                                            ) : (
                                              <li>{JSON.stringify(explanation.stepByStep)}</li>
                                            )}
                                          </ol>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Status:
                      </p>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-600 dark:text-gray-400 italic">
                          Not attempted
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Correct Answer:
                        </p>
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <p className="text-gray-900 dark:text-white">
                            {response.question.correctAnswer}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredResponses.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No questions found for this filter.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ResultDetail;
