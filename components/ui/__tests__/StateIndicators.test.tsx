import React from 'react';
import { render } from '@testing-library/react-native';
import { Loading, EmptyState, ErrorState } from '../StateIndicators';

describe('StateIndicators Components', () => {
  describe('Loading', () => {
    it('renders correctly with default message', () => {
      const { getByText } = render(<Loading />);
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('renders correctly with custom message', () => {
      const { getByText } = render(<Loading message="Fetching data..." />);
      expect(getByText('Fetching data...')).toBeTruthy();
    });
  });

  describe('EmptyState', () => {
    it('renders correctly with title and subtitle', () => {
      const { getByText } = render(
        <EmptyState 
          title="No Customers Found" 
          subtitle="Try searching for a different name" 
        />
      );
      expect(getByText('No Customers Found')).toBeTruthy();
      expect(getByText('Try searching for a different name')).toBeTruthy();
      expect(getByText('📭')).toBeTruthy();
    });

    it('renders custom icon', () => {
      const { getByText } = render(
        <EmptyState title="Empty" icon="🔍" />
      );
      expect(getByText('🔍')).toBeTruthy();
    });
  });

  describe('ErrorState', () => {
    it('renders title and message correctly', () => {
      const { getByText } = render(
        <ErrorState title="System Error" message="Something went wrong" />
      );
      expect(getByText('System Error')).toBeTruthy();
      expect(getByText('Something went wrong')).toBeTruthy();
      expect(getByText('⚠️')).toBeTruthy();
    });
  });
});
