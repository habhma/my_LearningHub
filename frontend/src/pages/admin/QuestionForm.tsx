import { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { questionService } from '@/services/questionService';
import {
  QuestionBankFormData,
  QuestionBankItem,
  QuestionBankMeta,
  QuestionBankOption,
} from '@/types';

const TYPES_WITH_OPTIONS = new Set(['multiple_choice', 'true_false']);

interface QuestionFormProps {
  initialData?: QuestionBankItem;
  onSubmit: (data: QuestionBankFormData) => Promise<void>;
  submitLabel: string;
  loading?: boolean;
}

function QuestionForm({ initialData, onSubmit, submitLabel, loading = false }: QuestionFormProps) {
  const [meta, setMeta] = useState<QuestionBankMeta | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);

  const [questionText, setQuestionText] = useState(initialData?.questionText || '');
  const [subjectId, setSubjectId] = useState(initialData?.subjectId ?? 0);
  const [topicId, setTopicId] = useState<number | ''>(initialData?.topicId ?? '');
  const [classLevel, setClassLevel] = useState(initialData?.classLevel ?? 5);
  const [examCategoryId, setExamCategoryId] = useState(initialData?.examCategoryId ?? 0);
  const [typeId, setTypeId] = useState(initialData?.typeId ?? 0);
  const [difficultyId, setDifficultyId] = useState(initialData?.difficultyId ?? 0);
  const [marks, setMarks] = useState(Number(initialData?.marks ?? 1));
  const [negativeMarks, setNegativeMarks] = useState(Number(initialData?.negativeMarks ?? 0));
  const [status, setStatus] = useState(initialData?.status || 'DRAFT');
  const [correctAnswer, setCorrectAnswer] = useState(initialData?.correctAnswer || '');
  const [options, setOptions] = useState<QuestionBankOption[]>(
    initialData?.options?.length
      ? initialData.options
      : [
          { optionText: '', optionOrder: 1, isCorrect: false },
          { optionText: '', optionOrder: 2, isCorrect: false },
        ]
  );
  const [explanationText, setExplanationText] = useState(
    initialData?.explanations?.[0]?.explanationText || ''
  );

  useEffect(() => {
    questionService
      .getMeta()
      .then(setMeta)
      .finally(() => setMetaLoading(false));
  }, []);

  const selectedTypeCode = meta?.questionTypes.find((t) => t.id === typeId)?.typeCode;
  const showOptions = selectedTypeCode ? TYPES_WITH_OPTIONS.has(selectedTypeCode) : false;
  const filteredTopics = meta?.topics.filter((t) => t.subjectId === subjectId) || [];

  const handleOptionTextChange = (index: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, optionText: value } : opt)));
  };

  const handleOptionCorrectChange = (index: number) => {
    if (selectedTypeCode === 'true_false') {
      setOptions((prev) => prev.map((opt, i) => ({ ...opt, isCorrect: i === index })));
    } else {
      setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt)));
    }
  };

  const addOption = () => {
    setOptions((prev) => [...prev, { optionText: '', optionOrder: prev.length + 1, isCorrect: false }]);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index).map((opt, i) => ({ ...opt, optionOrder: i + 1 })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      return alert('Please enter the question text');
    }
    if (!subjectId || !examCategoryId || !typeId || !difficultyId) {
      return alert('Please select subject, exam category, question type, and difficulty');
    }
    if (showOptions) {
      const filled = options.filter((o) => o.optionText.trim());
      if (filled.length < 2) {
        return alert('Please provide at least 2 options');
      }
      if (!filled.some((o) => o.isCorrect)) {
        return alert('Please mark the correct option');
      }
    }

    const data: QuestionBankFormData = {
      questionText: questionText.trim(),
      typeId,
      typeCode: selectedTypeCode || '',
      difficultyId,
      subjectId,
      ...(topicId !== '' ? { topicId } : {}),
      classLevel,
      examCategoryId,
      marks,
      negativeMarks,
      status,
      ...(showOptions
        ? { options: options.filter((o) => o.optionText.trim()) }
        : { correctAnswer: correctAnswer.trim() }),
      ...(explanationText.trim()
        ? { explanations: [{ explanationType: 'WRONG_ANSWER', explanationText: explanationText.trim() }] }
        : {}),
    };

    await onSubmit(data);
  };

  if (metaLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Question Text <span className="text-red-500">*</span>
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder="e.g., What is the sum of 7 and 5?"
          />
        </div>

        {/* Classification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(parseInt(e.target.value));
                setTopicId('');
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value={0}>Select subject</option>
              {meta?.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subjectName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Topic
            </label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              disabled={!subjectId}
            >
              <option value="">No topic</option>
              {filteredTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.topicName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Class Level <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={12}
              value={classLevel}
              onChange={(e) => setClassLevel(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Exam Category <span className="text-red-500">*</span>
            </label>
            <select
              value={examCategoryId}
              onChange={(e) => setExamCategoryId(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value={0}>Select exam category</option>
              {meta?.examCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Question Type <span className="text-red-500">*</span>
            </label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value={0}>Select type</option>
              {meta?.questionTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.typeName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Difficulty <span className="text-red-500">*</span>
            </label>
            <select
              value={difficultyId}
              onChange={(e) => setDifficultyId(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value={0}>Select difficulty</option>
              {meta?.difficultyLevels.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.difficultyName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Options or Correct Answer */}
        {showOptions ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Options <span className="text-red-500">*</span>{' '}
              <span className="text-xs text-gray-500">(select the correct one)</span>
            </label>
            <div className="space-y-2">
              {options.map((opt, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type={selectedTypeCode === 'true_false' ? 'radio' : 'checkbox'}
                    name="correctOption"
                    checked={opt.isCorrect}
                    onChange={() => handleOptionCorrectChange(index)}
                    className="h-4 w-4"
                  />
                  <input
                    type="text"
                    value={opt.optionText}
                    onChange={(e) => handleOptionTextChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    disabled={selectedTypeCode === 'true_false'}
                  />
                  {selectedTypeCode !== 'true_false' && options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            {selectedTypeCode !== 'true_false' && (
              <button
                type="button"
                onClick={addOption}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Add option
              </button>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Correct Answer
            </label>
            <textarea
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="Expected answer / model answer"
            />
          </div>
        )}

        {/* Marks / Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Marks
            </label>
            <input
              type="number"
              step="0.5"
              min={0}
              value={marks}
              onChange={(e) => setMarks(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Negative Marks
            </label>
            <input
              type="number"
              step="0.5"
              min={0}
              value={negativeMarks}
              onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="FLAGGED">Flagged</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Explanation (shown for wrong answers)
          </label>
          <textarea
            value={explanationText}
            onChange={(e) => setExplanationText(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder="Explain the correct approach/answer"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" isLoading={loading}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default QuestionForm;
