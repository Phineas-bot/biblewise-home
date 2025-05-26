import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import CourseCard from './CourseCard';
import { BookCourse } from '@/types/course';
import { ActiveUserPurchase } from '@/contexts/AuthContext';

// Mock hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));
jest.mock('@/hooks/useAuth');

const mockNavigate = jest.fn();
const mockUseAuth = useAuth as jest.Mock;

const sampleCourse: BookCourse = {
  id: 101,
  title: "Test Course",
  author: "Test Author",
  cover: "test-cover.jpg",
  status: "published",
  progress: 0,
  description: "A test course description.",
  category: "Testing",
  isNew: false,
  isPopular: false,
  lessons: 10,
};

describe('CourseCard', () => {
  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    // Default mock for useAuth
    mockUseAuth.mockReturnValue({
      user: null,
      userPurchases: null,
      isLoadingPurchases: false,
    });
    mockNavigate.mockClear();
  });

  it('should render course details correctly', () => {
    render(<CourseCard course={sampleCourse} />);
    expect(screen.getByText(sampleCourse.title)).toBeInTheDocument();
    expect(screen.getByText(`by ${sampleCourse.author}`)).toBeInTheDocument();
    expect(screen.getByText(sampleCourse.description)).toBeInTheDocument();
    expect(screen.getByAltText(sampleCourse.title)).toHaveAttribute('src', sampleCourse.cover);
  });

  describe('CTA Button and Access Logic', () => {
    it('should show "Loading..." when isLoadingPurchases is true', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userPurchases: null,
        isLoadingPurchases: true,
      });
      render(<CourseCard course={sampleCourse} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Loading...');
    });

    it('should show "Login to View" and navigate to /auth if user is not logged in', () => {
      render(<CourseCard course={sampleCourse} />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Login to View');
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });
    
    it('should show "Get Access" and navigate to /subscription-plans if user is logged in but has no access', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user1' },
        userPurchases: [], // No purchases
        isLoadingPurchases: false,
      });
      render(<CourseCard course={sampleCourse} />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Get Access');
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith('/subscription-plans');
    });

    it('should show "View Course" and navigate to reader if user has an active subscription', () => {
      const purchases: ActiveUserPurchase[] = [
        { id: 1, item_id: 'sub_monthly', item_type: 'subscription_plan', purchase_status: 'completed', subscription_end_date: new Date(Date.now() + 86400000).toISOString() }
      ];
      mockUseAuth.mockReturnValue({
        user: { id: 'user1' },
        userPurchases: purchases,
        isLoadingPurchases: false,
      });
      render(<CourseCard course={sampleCourse} />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('View Course');
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith(`/bookreader/${sampleCourse.id}`);
    });

    it('should show "View Course" and navigate to reader if user has purchased this specific course', () => {
      const purchases: ActiveUserPurchase[] = [
        { id: 1, item_id: sampleCourse.id.toString(), item_type: 'course', purchase_status: 'completed', subscription_end_date: null }
      ];
      mockUseAuth.mockReturnValue({
        user: { id: 'user1' },
        userPurchases: purchases,
        isLoadingPurchases: false,
      });
      render(<CourseCard course={sampleCourse} />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('View Course');
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith(`/bookreader/${sampleCourse.id}`);
    });
    
    it('should show "Get Access" if user has purchased a different course but not this one and no subscription', () => {
      const purchases: ActiveUserPurchase[] = [
        { id: 1, item_id: '999', item_type: 'course', purchase_status: 'completed', subscription_end_date: null } // Different course
      ];
      mockUseAuth.mockReturnValue({
        user: { id: 'user1' },
        userPurchases: purchases,
        isLoadingPurchases: false,
      });
      render(<CourseCard course={sampleCourse} />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Get Access');
      fireEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith('/subscription-plans');
    });
  });
});
