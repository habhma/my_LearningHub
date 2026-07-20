import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { questionService } from '@/services/questionService';
import { QuestionBankFormData, QuestionBankItem } from '@/types';
import QuestionForm from './QuestionForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';

function EditQuestion() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<QuestionBankItem | null>(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    questionService
      .getQuestion(id)
      .then(setQuestion)
      .catch((error: any) => toast.error(error.message || 'Failed to load question'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (data: QuestionBankFormData) => {
    if (!id) return;
    setLoading(true);
    try {
      await questionService.updateQuestion(id, data);
      toast.success('Question updated successfully!');
      navigate('/admin/questions');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update question');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <LoadingSpinner fullScreen />;
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">Question not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/questions')}
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 flex items-center gap-2"
          >
            ← Back to Question Bank
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Question</h1>
        </div>

        <QuestionForm
          initialData={question}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          loading={loading}
        />
      </div>
    </div>
  );
}

export default EditQuestion;
