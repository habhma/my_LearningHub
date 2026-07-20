import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';

// Mock the auth store
jest.mock('@/store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('DashboardLayout - Student Navigation', () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders student navigation items correctly', () => {
    (useAuthStore as any).mockReturnValue({
      user: {
        id: 1,
        email: 'student@test.com',
        role: UserRole.STUDENT,
        profile: { fullName: 'Test Student' },
      },
      logout: mockLogout,
    });

    render(
      <MemoryRouter initialEntries={['/student']}>
        <DashboardLayout>
          <div>Student Content</div>
        </DashboardLayout>
      </MemoryRouter>
    );

    // Check student navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Assessments')).toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();

    // Check user info
    expect(screen.getByText('Test Student')).toBeInTheDocument();
    expect(screen.getByText('STUDENT')).toBeInTheDocument();
  });

  it('highlights active student navigation tab', () => {
    (useAuthStore as any).mockReturnValue({
      user: {
        id: 1,
        email: 'student@test.com',
        role: UserRole.STUDENT,
      },
      logout: mockLogout,
    });

    render(
      <MemoryRouter initialEntries={['/student/assessments']}>
        <DashboardLayout>
          <div>Assessments Content</div>
        </DashboardLayout>
      </MemoryRouter>
    );

    const assessmentsLink = screen.getByText('Assessments').closest('a');
    expect(assessmentsLink).toHaveClass('border-blue-500');
    expect(assessmentsLink).toHaveClass('text-blue-600');
  });

  it('navigates between student tabs', () => {
    (useAuthStore as any).mockReturnValue({
      user: {
        id: 1,
        email: 'student@test.com',
        role: UserRole.STUDENT,
      },
      logout: mockLogout,
    });

    render(
      <MemoryRouter initialEntries={['/student']}>
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      </MemoryRouter>
    );

    const resultsLink = screen.getByText('Results');
    expect(resultsLink.closest('a')).toHaveAttribute('href', '/student/results');

    const profileLink = screen.getByText('Profile');
    expect(profileLink.closest('a')).toHaveAttribute('href', '/student/profile');
  });

  it('handles student logout', async () => {
    (useAuthStore as any).mockReturnValue({
      user: {
        id: 1,
        email: 'student@test.com',
        role: UserRole.STUDENT,
      },
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      </MemoryRouter>
    );

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('displays student email when fullName is not available', () => {
    (useAuthStore as any).mockReturnValue({
      user: {
        id: 1,
        email: 'student@test.com',
        role: UserRole.STUDENT,
      },
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('student@test.com')).toBeInTheDocument();
  });
});

describe('DashboardLayout - Admin Navigation', () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders admin navigation items correctly', () => {
    (useAuthStore as any).mockReturnValue({
      user: {
        id: 1,
        email: 'admin@test.com',
        role: UserRole.ADMIN,
        profile: { fullName: 'Test Admin' },
      },
      logout: mockLogout,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <DashboardLayout>
          <div>Admin Content</div>
        </DashboardLayout>
      </MemoryRouter>
    );

    // Check admin navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Assessments')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();

    // Check user info
    expect(screen.getByText('Test Admin')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('highlights active admin navigation tab', () => {
    (useAuthStore as any).mockReturnValue({
      user: {
        id: 1,
        email: 'admin@test.com',
        role: UserRole.ADMIN,
      },
      logout: mockLogout,
    });

    render(
      <MemoryRouter initialEntries={['/admin/users']}>
        <DashboardLayout>
          <div>Users Content</div>
        </DashboardLayout>
      </MemoryRouter>
    );

    const usersLink = screen.getByText('Users').closest('a');
    expect(usersLink).toHaveClass('border-blue-500');
    expect(usersLink).toHaveClass('text-blue-600');
  });

  it('navigates between admin tabs', () => {
    (useAuthStore as any).mockReturnValue({
      user: {
        id: 1,
        email: 'admin@test.com',
        role: UserRole.ADMIN,
      },
      logout: mockLogout,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      </MemoryRouter>
    );

    const usersLink = screen.getByText('Users');
    expect(usersLink.closest('a')).toHaveAttribute('href', '/admin/users');

    const assessmentsLink = screen.getByText('Assessments');
    expect(assessmentsLink.closest('a')).toHaveAttribute('href', '/admin/assessments');

    const analyticsLink = screen.getByText('Analytics');
    expect(analyticsLink.closest('a')).toHaveAttribute('href', '/admin/analytics');
  });

  it('handles admin logout', async () => {
    (useAuthStore as any).mockReturnValue({
      user: {
        id: 1,
        email: 'admin@test.com',
        role: UserRole.ADMIN,
      },
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      </MemoryRouter>
    );

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('does not show student navigation to admin users', () => {
    (useAuthStore as any).mockReturnValue({
      user: {
        id: 1,
        email: 'admin@test.com',
        role: UserRole.ADMIN,
      },
      logout: mockLogout,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      </MemoryRouter>
    );

    // Admin should not see Profile link (student-only)
    const profileLinks = screen.queryAllByText('Profile');
    expect(profileLinks.length).toBe(0);

    // Admin should not see Results link (student-only)
    const resultsLinks = screen.queryAllByText('Results');
    expect(resultsLinks.length).toBe(0);
  });
});

describe('DashboardLayout - Common Features', () => {
  const mockLogout = jest.fn();

  it('renders children content', () => {
    (useAuthStore as any).mockReturnValue({
      user: {
        id: 1,
        email: 'test@test.com',
        role: UserRole.STUDENT,
      },
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <DashboardLayout>
          <div data-testid="custom-content">Custom Dashboard Content</div>
        </DashboardLayout>
      </MemoryRouter>
    );

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('Custom Dashboard Content')).toBeInTheDocument();
  });

  it('displays platform branding', () => {
    (useAuthStore as any).mockReturnValue({
      user: {
        id: 1,
        email: 'test@test.com',
        role: UserRole.STUDENT,
      },
      logout: mockLogout,
    });

    render(
      <MemoryRouter>
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('📚 Assessment Platform')).toBeInTheDocument();
  });
});
