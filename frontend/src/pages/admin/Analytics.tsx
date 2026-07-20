import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { userService } from '@/services/userService';
import { assessmentService } from '@/services/assessmentService';
import { questionService } from '@/services/questionService';
import { submissionService } from '@/services/submissionService';

interface AnalyticsData {
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalAssessments: number;
  activeAssessments: number;
  totalQuestions: number;
  totalSubmissions: number;
  averagePercentage: number;
}

function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [userStats, assessments, questions, submissionStats] = await Promise.all([
          userService.getUserStats(),
          assessmentService.getAssessments({ page: 1, pageSize: 200 }),
          questionService.getQuestions({ page: 1, pageSize: 1 }),
          submissionService.getStats(),
        ]);

        setData({
          totalStudents: userStats.totalStudents,
          totalTeachers: userStats.totalTeachers,
          totalAdmins: userStats.totalAdmins,
          totalAssessments: assessments.total,
          activeAssessments: assessments.data.filter((a) => a.isActive).length,
          totalQuestions: questions.total,
          totalSubmissions: submissionStats.totalSubmissions,
          averagePercentage: submissionStats.averagePercentage,
        });
      } catch (error: any) {
        toast.error(error.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const cards = data
    ? [
        { label: 'Total Students', value: data.totalStudents, color: 'blue' },
        { label: 'Total Teachers', value: data.totalTeachers, color: 'green' },
        { label: 'Total Admins', value: data.totalAdmins, color: 'red' },
        { label: 'Total Assessments', value: data.totalAssessments, color: 'purple' },
        { label: 'Active Assessments', value: data.activeAssessments, color: 'orange' },
        { label: 'Questions in Bank', value: data.totalQuestions, color: 'indigo' },
        { label: 'Total Submissions', value: data.totalSubmissions, color: 'teal' },
        { label: 'Average Score', value: `${data.averagePercentage}%`, color: 'yellow' },
      ]
    : [];

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Platform-wide statistics, computed live from the database
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => (
              <div key={card.label} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.label}</p>
                <p className={`mt-2 inline-flex px-2 py-1 rounded-lg text-2xl font-bold ${colorClasses[card.color]}`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAnalytics;
