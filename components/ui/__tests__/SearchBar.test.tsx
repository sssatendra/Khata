import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '../SearchBar';
import { useUIStore } from '../../../store/uiStore';

// Mock the zustand store
jest.mock('../../../store/uiStore', () => ({
  useUIStore: jest.fn(),
}));

describe('SearchBar Component', () => {
  const mockSetSearchQuery = jest.fn();
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      searchQuery: '',
      setSearchQuery: mockSetSearchQuery,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default placeholder', () => {
    const { getByPlaceholderText } = render(<SearchBar />);
    expect(getByPlaceholderText('Search customers...')).toBeTruthy();
  });

  it('renders with custom placeholder', () => {
    const { getByPlaceholderText } = render(<SearchBar placeholder="Find me" />);
    expect(getByPlaceholderText('Find me')).toBeTruthy();
  });

  it('updates query and calls onSearch when text changes', () => {
    const { getByPlaceholderText } = render(<SearchBar onSearch={mockOnSearch} />);
    const input = getByPlaceholderText('Search customers...');
    
    fireEvent.changeText(input, 'test query');
    
    expect(mockSetSearchQuery).toHaveBeenCalledWith('test query');
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('displays the current search query from the store', () => {
    (useUIStore as unknown as jest.Mock).mockReturnValue({
      searchQuery: 'existing search',
      setSearchQuery: mockSetSearchQuery,
    });
    
    const { getByDisplayValue } = render(<SearchBar />);
    expect(getByDisplayValue('existing search')).toBeTruthy();
  });
});
