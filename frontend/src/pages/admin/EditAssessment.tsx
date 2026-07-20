import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import apiClient from '@/services/api';

function EditAssessment() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    testName: '',
    testType: 'PRACTICE' as 'PRACTICE' | 'MOCK' | 'DIAGNOSTIC',
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    classLevel: 10,
    showResults: true,
    shuffleQuestions: false,
    allowReview: true,
    isActive: true,
  });

  // Fetch assessment data on component mount
  useEffect(() => {
    const fetchAssessment = async () => {
      if (!id) {
        setError('Assessment ID is missing');
        setFetchLoading(false);
        return;
      }

      try {
        const response = await apiClient.get<{ success: boolean; data: any }>(
          `/assessments/${id}`
        );
        const assessment = response.data.data;

        // Pre-fill form with existing data
        setFormData({
          testName: assessment.testName || '',
          testType: assessment.testType || 'PRACTICE',
          duration: assessment.testConfig?.duration || 60,
          totalMarks: assessment.testConfig?.totalMarks || 100,
          passingMarks: assessment.testConfig?.passingMarks || 40,
          classLevel: assessment.classLevel || 10,
          showResults: assessment.testConfig?.showResults ?? true,
          shuffleQuestions: assessment.testConfig?.shuffleQuestions ?? false,
          allowReview: assessment.testConfig?.allowReview ?? true,
          isActive: assessment.isActive ?? true,
        });
        setError(null);
      } catch (err: any) {
        const message = err.message || 'Failed to load assessment';
        setError(message);
        toast.error(message);
        console.error('Fetch assessment error:', err);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.testName.trim()) {
      toast.error('Please enter a test name');
      return;
    }

    if (formData.duration < 1) {
      toast.error('Duration must be at least 1 minute');
      return;
    }

    if (!id) {
      toast.error('Assessment ID is missing');
      return;
    }

    setLoading(true);

    try {
      await apiClient.put(`/assessments/${id}`, {
        testName: formData.testName,
        testType: formData.testType,
        testConfig: {
          duration: formData.duration,
          totalMarks: formData.totalMarks,
          passingMarks: formData.passingMarks,
          showResults: formData.showResults,
          shuffleQuestions: formData.shuffleQuestions,
          allowReview: formData.allowReview,
        },
        classLevel: formData.classLevel,
        accessLevel: 'FREE',
        isActive: formData.isActive,
      });

      toast.success('Assessment updated successfully!');
      navigate('/admin/assessments');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update assessment');
      console.error('Update assessment error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading assessment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <div className="text-center py-8">
              <div className="text-red-600 dark:text-red-400 text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Assessment Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <Button onClick={() => navigate('/admin/assessments')}>
                Back to Assessments
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/assessments')}
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 flex items-center gap-2"
          >
            ← Back to Assessments
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Assessment
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Update the details below to modify this assessment
          </p>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Basic Information
              </h2>

              <div className="space-y-4">
                {/* Test Name */}
                <div>
                  <label htmlFor="testName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Test Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="testName"
                    name="testName"
                    value={formData.testName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="e.g., Mathematics Final Exam"
                  />
                </div>

                {/* Test Type */}
                <div>
                  <label htmlFor="testType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Test Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="testType"
                    name="testType"
                    value={formData.testType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="PRACTICE">Practice Test</option>
                    <option value="MOCK">Mock Exam</option>
                    <option value="DIAGNOSTIC">Diagnostic Test</option>
                  </select>
                </div>

                {/* Class Level */}
                <div>
                  <label htmlFor="classLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Class Level
                  </label>
                  <input
                    type="number"
                    id="classLevel"
                    name="classLevel"
                    value={formData.classLevel}
                    onChange={handleChange}
                    min="1"
                    max="12"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Test Configuration */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Test Configuration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Duration */}
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Total Marks */}
                <div>
                  <label htmlFor="totalMarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    id="totalMarks"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Passing Marks */}
                <div>
                  <label htmlFor="passingMarks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Passing Marks
                  </label>
                  <input
                    type="number"
                    id="passingMarks"
                    name="passingMarks"
                    value={formData.passingMarks}
                    onChange={handleChange}
                    min="1"
                    max={formData.totalMarks}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Options
              </h2>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="showResults"
                    checked={formData.showResults}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Show results immediately after submission
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="shuffleQuestions"
                    checked={formData.shuffleQuestions}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Shuffle questions for each student
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="allowReview"
                    checked={formData.allowReview}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Allow students to review answers
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Assessment is active
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Updating...' : 'Update Assessment'}
              </Button>

              <button
                type="button"
                onClick={() => navigate('/admin/assessments')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default EditAssessment;
