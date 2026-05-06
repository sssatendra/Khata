import React from 'react';
import { render } from '@testing-library/react-native';
import { CustomerCard } from '../CustomerCard';

import { Customer } from '../../../types';

// Mock helpers
jest.mock('../../../utils/helpers', () => ({
  formatCurrency: (val: number) => `Rs ${val}`,
  getDaysSince: () => 5,
}));

const mockCustomer: Customer = {
  id: '1',
  shopId: 'shop-1',
  name: 'John Doe',
  phone: '9876543210',
  balance: 500,
  status: 'active',
  lastTransactionDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CustomerCard Component', () => {
  it('renders customer details correctly', () => {
    const { getByText } = render(
      <CustomerCard customer={mockCustomer} onPress={() => {}} />
    );
    
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('9876543210')).toBeTruthy();
    expect(getByText('Rs 500')).toBeTruthy();
    expect(getByText('5 days')).toBeTruthy();
  });

  it('shows risk level badge by default', () => {
    const { getByText } = render(
      <CustomerCard customer={mockCustomer} onPress={() => {}} />
    );
    // Green circle emoji for low risk
    expect(getByText('🟢')).toBeTruthy();
  });

  it('hides risk level badge when showRiskLevel is false', () => {
    const { queryByText } = render(
      <CustomerCard 
        customer={mockCustomer} 
        onPress={() => {}} 
        showRiskLevel={false} 
      />
    );
    expect(queryByText('🟢')).toBeNull();
  });
});
