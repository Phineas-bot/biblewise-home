import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BookReader from '../BookReader';
import { AuthProvider } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { DbCourse, DbChapter, DbSection } from '@/types/course'; // Assuming these are the DB types

// Mocks
jest.mock('@/integrations/supabase/client');
const mockSupabaseClient = supabase as jest.Mocked<typeof supabase>;

let mockAuthUser: any = { id: 'user-123', email: 'test@example.com' };
let mockAuthLoading = false;
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockAuthUser,
    isLoading: mockAuthLoading,
  }),
}));

jest.mock('@/components/ui/use-toast');
const mockAppToast = jest.fn();

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: jest.fn(),
}));

// Mock child components to simplify testing BookReader itself
jest.mock('@/components/TableOfContents', () => () => <div>Table of Contents Mock</div>);
jest.mock('@/components/ReadingPane', () => () => <div>Reading Pane Mock</div>);
// ReadingControls might not need mocking if it's simple buttons without complex logic

const mockCourseId = '1';
const mockCourseNumericId = 1;

const mockCourseData: DbCourse = {
  id: mockCourseNumericId,
  title: 'Test Course Title',
  author: 'Test Author',
  cover_image_url: 'http://example.com/cover.jpg',
  description: 'A test course description.',
  category: 'Testing',
  stripe_price_id_single_purchase: 'price_single_123',
  part_of_subscription_plan_id: 'plan_sub_123', // Assumes this course can be part of a subscription
  created_at: new Date().toISOString(),
};

const mockFreeCourseData: DbCourse = {
    ...mockCourseData,
    id: 2,
    stripe_price_id_single_purchase: null,
    part_of_subscription_plan_id: null,
};

const mockChaptersData: DbChapter[] = [
  { id: 10, course_id: mockCourseNumericId, title: 'Chapter 1', order: 1 },
  { id: 11, course_id: mockCourseNumericId, title: 'Chapter 2', order: 2 },
];

const mockSectionsDataCh1: DbSection[] = [
  { id: 101, chapter_id: 10, title: 'Section 1.1', content_html: '<p>Content 1.1</p>', order: 1 },
  { id: 102, chapter_id: 10, title: 'Section 1.2', content_html: '<p>Content 1.2</p>', order: 2 },
];
const mockSectionsDataCh2: DbSection[] = [
  { id: 103, chapter_id: 11, title: 'Section 2.1', content_html: '<p>Content 2.1</p>', order: 1 },
];

// Helper to setup mocks for a specific scenario
const setupSupabaseMocks = ({
  courseData,
  chaptersData,
  sectionsForChapterMap, // Map of chapterId to its sections
  purchaseData,
  subscriptionData,
  courseError,
  chaptersError,
  sectionsError,
  purchaseError,
  subscriptionError,
}: any) => {
  // Default from().select().eq().single() mock for courses
  const courseQueryMock = jest.fn().mockReturnThis(); // for .eq()
  const courseSingleMock = jest.fn();
  if (courseError) courseSingleMock.mockResolvedValue({ data: null, error: courseError });
  else courseSingleMock.mockResolvedValue({ data: courseData, error: null });
  (mockSupabaseClient.from as jest.Mock).mockImplementation((table: string) => {
    if (table === 'courses') {
      return { select: jest.fn().mockReturnValue({ eq: courseQueryMock, single: courseSingleMock }) };
    }
    if (table === 'purchases') {
      const purchaseQueryMock = jest.fn().mockReturnThis();
      const purchaseMaybeSingleMock = jest.fn();
      if (purchaseError) purchaseMaybeSingleMock.mockResolvedValue({ data: null, error: purchaseError });
      else purchaseMaybeSingleMock.mockResolvedValue({ data: purchaseData, error: null });
      return { select: jest.fn().mockReturnValue({ eq: purchaseQueryMock, maybeSingle: purchaseMaybeSingleMock }) };
    }
    if (table === 'subscriptions') {
      const subQueryMock = jest.fn().mockReturnThis(); // for .eq().in().limit()
      const subLimitMock = jest.fn(); // for .limit()
      if (subscriptionError) subLimitMock.mockResolvedValue({ data: null, error: subscriptionError });
      else subLimitMock.mockResolvedValue({ data: subscriptionData, error: null });
      // Simplified: assume .in().limit() is the chain
      return { select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnThis(), in: jest.fn().mockReturnThis(), limit: subLimitMock }) };
    }
    if (table === 'chapters') {
      const chapterOrderMock = jest.fn();
      if (chaptersError) chapterOrderMock.mockResolvedValue({ data: null, error: chaptersError });
      else {
        // Simulate nested sections fetch logic if Supabase client supports it or mock the structure
        const enrichedChaptersData = chaptersData.map((ch: DbChapter) => ({
            ...ch,
            sections: sectionsForChapterMap[ch.id] || [] 
        }));
        chapterOrderMock.mockResolvedValue({ data: enrichedChaptersData, error: null });
      }
      return { select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnThis(), order: chapterOrderMock }) };
    }
    // Default mock for any other table
    return {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: { message: 'Default mock error' } }),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Default mock error' } }),
      limit: jest.fn().mockResolvedValue({ data: null, error: { message: 'Default mock error' } }),
      order: jest.fn().mockResolvedValue({ data: null, error: { message: 'Default mock error' } }),
    };
  });
};


const renderBookReaderPage = (courseIdToUse: string = mockCourseId) => {
  (jest.requireMock('react-router-dom').useParams as jest.Mock).mockReturnValue({ courseId: courseIdToUse });
  (useToast as jest.Mock).mockReturnValue({ toast: mockAppToast });

  return render(
    <MemoryRouter initialEntries={[`/reader/${courseIdToUse}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/reader/:courseId" element={<BookReader />} />
          <Route path="/auth" element={<div>Auth Page</div>} />
          <Route path="/courses" element={<div>Courses Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('BookReader.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthUser = { id: 'user-123', email: 'test@example.com' }; // Reset user
    mockAuthLoading = false;
  });

  it('redirects to /auth if user is not authenticated', async () => {
    mockAuthUser = null; // Logged out
    renderBookReaderPage();
    await waitFor(() => {
      expect(mockAppToast).toHaveBeenCalledWith({
        title: "Authentication Required",
        description: "Please sign in to access courses.",
        variant: "destructive",
      });
    });
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  it('shows loading state initially', () => {
    mockAuthLoading = true; // Simulate auth still loading
    setupSupabaseMocks({ courseData: mockCourseData }); // Basic mock
    renderBookReaderPage();
    expect(screen.getByText(/Loading course content.../i)).toBeInTheDocument();
  });

  it('handles invalid course ID format', async () => {
    renderBookReaderPage('invalid-course-id');
    await waitFor(() => {
      expect(screen.getByText(/Invalid Course ID format./i)).toBeInTheDocument();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/courses');
  });
  
  it('handles course not found', async () => {
    setupSupabaseMocks({ courseError: { message: 'Course not found.' } });
    renderBookReaderPage();
    await waitFor(() => {
      expect(screen.getByText(/Course not found./i)).toBeInTheDocument(); // Error message in component
    });
  });

  describe('Access Control & Content Loading', () => {
    const sectionsMap = {
        [mockChaptersData[0].id]: mockSectionsDataCh1,
        [mockChaptersData[1].id]: mockSectionsDataCh2,
    };

    it('loads content if user has a single purchase', async () => {
      setupSupabaseMocks({
        courseData: mockCourseData,
        purchaseData: { id: 'purchase-1', user_id: mockAuthUser.id, course_id: mockCourseNumericId, status: 'succeeded' },
        subscriptionData: [], // No active subscription
        chaptersData: mockChaptersData,
        sectionsForChapterMap: sectionsMap,
      });
      renderBookReaderPage();

      await waitFor(() => {
        expect(screen.getByText(mockCourseData.title)).toBeInTheDocument();
      });
      expect(screen.getByText('Table of Contents Mock')).toBeInTheDocument();
      expect(screen.getByText('Reading Pane Mock')).toBeInTheDocument();
      expect(screen.queryByText(/Access Denied/i)).not.toBeInTheDocument();
    });

    it('loads content if user has an active subscription that grants access', async () => {
      setupSupabaseMocks({
        courseData: mockCourseData, // This course has part_of_subscription_plan_id
        purchaseData: null,
        subscriptionData: [{ 
            status: 'active', 
            user_id: mockAuthUser.id, 
            // products: { part_of_subscription_plan_id: 'plan_sub_123' } // Simulate this structure if needed for specific plan matching
        }],
        chaptersData: mockChaptersData,
        sectionsForChapterMap: sectionsMap,
      });
      renderBookReaderPage();

      await waitFor(() => {
        expect(screen.getByText(mockCourseData.title)).toBeInTheDocument();
      });
      expect(screen.getByText('Table of Contents Mock')).toBeInTheDocument();
    });

    it('loads content if course is free', async () => {
        setupSupabaseMocks({
          courseData: mockFreeCourseData, // Free course
          purchaseData: null,
          subscriptionData: [],
          chaptersData: mockChaptersData.map(c => ({...c, course_id: mockFreeCourseData.id })), // Adjust chapter course_id
          sectionsForChapterMap: sectionsMap, 
        });
        renderBookReaderPage(String(mockFreeCourseData.id));
  
        await waitFor(() => {
          expect(screen.getByText(mockFreeCourseData.title)).toBeInTheDocument();
        });
        expect(screen.getByText('Table of Contents Mock')).toBeInTheDocument();
      });

    it('denies access if no purchase or relevant active subscription', async () => {
      setupSupabaseMocks({
        courseData: mockCourseData,
        purchaseData: null,
        subscriptionData: [], // No subscriptions or non-relevant ones
        chaptersData: [], sectionsForChapterMap: {}
      });
      renderBookReaderPage();

      await waitFor(() => {
        expect(mockAppToast).toHaveBeenCalledWith({
          title: "Access Denied",
          description: "You do not have access to this course. Please purchase it or subscribe.",
          variant: "destructive",
        });
      });
      expect(mockNavigate).toHaveBeenCalledWith('/courses');
    });
    
    it('handles error when fetching chapters/sections after access grant', async () => {
        setupSupabaseMocks({
          courseData: mockCourseData,
          purchaseData: { id: 'purchase-1', user_id: mockAuthUser.id, course_id: mockCourseNumericId, status: 'succeeded' },
          chaptersError: { message: 'Failed to fetch chapters.' },
          sectionsForChapterMap: {}
        });
        renderBookReaderPage();
  
        await waitFor(() => {
          expect(screen.getByText(/Error Loading Course/i)).toBeInTheDocument();
          expect(screen.getByText(/Failed to fetch chapters./i)).toBeInTheDocument();
        });
        expect(mockAppToast).toHaveBeenCalledWith(expect.objectContaining({
            title: "Error",
            description: expect.stringContaining("Failed to fetch chapters."),
        }));
    });
  });

  // Basic interaction tests (assuming content is loaded)
  describe('Interactions (assuming content loaded)', () => {
    beforeEach(() => {
        const sectionsMap = {
            [mockChaptersData[0].id]: mockSectionsDataCh1,
            [mockChaptersData[1].id]: mockSectionsDataCh2,
        };
        setupSupabaseMocks({
            courseData: mockCourseData,
            purchaseData: { id: 'purchase-1', user_id: mockAuthUser.id, course_id: mockCourseNumericId, status: 'succeeded' },
            chaptersData: mockChaptersData,
            sectionsForChapterMap: sectionsMap,
        });
    });

    it('toggles dark mode', async () => {
      renderBookReaderPage();
      await waitFor(() => expect(screen.getByText(mockCourseData.title)).toBeInTheDocument());

      const darkModeToggle = screen.getByRole('button', { name: /moon|sun/i }); // More flexible selector
      const mainDiv = screen.getByRole('banner').parentElement; // Get the top-level div BookReader renders

      expect(mainDiv).not.toHaveClass('dark:bg-gray-900'); // Assuming light mode initially
      fireEvent.click(darkModeToggle);
      // Check if class for dark mode is applied. This depends on how cn() and Tailwind are setup.
      // For this test, we can check if the button icon changes if that's easier.
      // Or if a specific dark mode class is applied to a known element.
      // The test here would be more robust if we checked the actual visual change or a state variable.
      // For now, just clicking. A more detailed test would check `document.documentElement.classList.contains('dark')` if that's how it's implemented.
      // Or, check if the button's icon changes (e.g. to Sun icon)
      expect(screen.getByRole('button', {name: /sun/i})).toBeInTheDocument(); // Assuming icon changes
      fireEvent.click(darkModeToggle);
      expect(screen.getByRole('button', {name: /moon/i})).toBeInTheDocument();
    });
    
    // Add bookmark is harder to test without seeing the internal state or a visual change.
    // Navigation (Previous/Next) is also tricky as it relies on the mocked ReadingPane and TableOfContents
    // and internal state updates. The logic for goToNextSection/goToPreviousSection is in BookReader.
    // We can test if the callbacks are called, but the visual change is in child components.
  });

});
