import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import apiClient from '@/services/api';

interface Question {
  id: string;
  questionText: string;
  subject: { subjectName: string };
  difficulty: { difficultyName: string };
  type: { typeName: string };
  marks: number;
  classLevel: number;
}

interface AssessmentQuestion extends Question {
  questionOrder: number;
}

function ManageAssessmentQuestions() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [assessment, setAssessment] = useState<any>(null);

  // Available questions (not in assessment)
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Questions already in assessment
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);

  // Filters for available questions
  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    difficulty: '',
    classLevel: '',
  });

  // Fetch assessment and its questions
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setFetchLoading(true);

        // Fetch assessment details
        const assessmentRes = await apiClient.get(`/assessments/${id}`);
        const assessmentData = assessmentRes.data.data;
        setAssessment(assessmentData);

        // Fetch questions in this assessment
        const questionsInAssessment = assessmentData.testQuestions || [];
        setAssessmentQuestions(
          questionsInAssessment.map((tq: any) => ({
            ...tq.question,
            questionOrder: tq.questionOrder,
            marks: tq.marks,
          }))
        );

        // Fetch all available questions
        const questionsRes = await apiClient.get('/questions', {
          params: {
            page: 1,
            limit: 100,
            isActive: true,
            status: 'ACTIVE',
          },
        });

        const allQuestions = questionsRes.data.data.data || [];
        const questionIdsInAssessment = new Set(questionsInAssessment.map((tq: any) => String(tq.questionId)));

        // Filter out questions already in assessment
        const available = allQuestions.filter((q: any) => !questionIdsInAssessment.has(String(q.id)));
        setAvailableQuestions(available);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load data');
        console.error('Fetch error:', error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestionIds(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleAddQuestions = async () => {
    if (selectedQuestionIds.length === 0) {
      toast.error('Please select at least one question');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(`/assessments/${id}/questions`, {
        questionIds: selectedQuestionIds,
      });

      toast.success(`Added ${selectedQuestionIds.length} question(s) successfully!`);

      // Refresh the page data
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add questions');
      console.error('Add questions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to remove this question from the assessment?')) {
      return;
    }

    setLoading(true);
    try {
      await apiClient.delete(`/assessments/${id}/questions/${questionId}`);
      toast.success('Question removed successfully!');

      // Move question from assessment back to available
      const removedQuestion = assessmentQuestions.find(q => String(q.id) === String(questionId));
      if (removedQuestion) {
        setAssessmentQuestions(prev => prev.filter(q => String(q.id) !== String(questionId)));
        setAvailableQuestions(prev => [...prev, removedQuestion]);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove question');
      console.error('Remove question error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = availableQuestions.filter(q => {
    if (filters.search && !q.questionText.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.classLevel && String(q.classLevel) !== filters.classLevel) {
      return false;
    }
    return true;
  });

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/assessments')}
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 flex items-center gap-2"
          >
            ← Back to Assessments
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Questions
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Assessment: {assessment?.testName || 'Loading...'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Questions Already in Assessment */}
          <Card>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Questions in Assessment ({assessmentQuestions.length})
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                These questions are currently part of this assessment
              </p>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {assessmentQuestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No questions added yet
                </div>
              ) : (
                assessmentQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            Q{index + 1}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {question.marks} marks
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                          {question.questionText}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {question.subject?.subjectName}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {question.difficulty?.difficultyName}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveQuestion(String(question.id))}
                        disabled={loading}
                        className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Right: Available Questions */}
          <Card>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Available Questions
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Select questions to add to this assessment
              </p>
            </div>

            {/* Filters */}
            <div className="mb-4 space-y-3">
              <input
                type="text"
                placeholder="Search questions..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
              />
              <select
                value={filters.classLevel}
                onChange={(e) => setFilters(prev => ({ ...prev, classLevel: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
              >
                <option value="">All Class Levels</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(level => (
                  <option key={level} value={level}>Class {level}</option>
                ))}
              </select>
            </div>

            {/* Selected Count */}
            {selectedQuestionIds.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    {selectedQuestionIds.length} question(s) selected
                  </span>
                  <Button
                    onClick={handleAddQuestions}
                    disabled={loading}
                    size="sm"
                  >
                    {loading ? 'Adding...' : 'Add Selected'}
                  </Button>
                </div>
              </div>
            )}

            {/* Question List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No questions available
                </div>
              ) : (
                filteredQuestions.map((question) => (
                  <div
                    key={question.id}
                    onClick={() => handleSelectQuestion(String(question.id))}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedQuestionIds.includes(String(question.id))
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedQuestionIds.includes(String(question.id))}
                        onChange={() => {}}
                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white line-clamp-2 mb-2">
                          {question.questionText}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {question.subject?.subjectName}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {question.difficulty?.difficultyName}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            Class {question.classLevel}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {question.marks} marks
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ManageAssessmentQuestions;
