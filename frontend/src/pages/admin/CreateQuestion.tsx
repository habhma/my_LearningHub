import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { questionService } from '@/services/questionService';
import { QuestionBankFormData } from '@/types';
import QuestionForm from './QuestionForm';

function CreateQuestion() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: QuestionBankFormData) => {
    setLoading(true);
    try {
      await questionService.createQuestion(data);
      toast.success('Question created successfully!');
      navigate('/admin/questions');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add Question</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Fill in the details below to add a new question to the bank
          </p>
        </div>

        <QuestionForm onSubmit={handleSubmit} submitLabel="Create Question" loading={loading} />
      </div>
    </div>
  );
}

export default CreateQuestion;
