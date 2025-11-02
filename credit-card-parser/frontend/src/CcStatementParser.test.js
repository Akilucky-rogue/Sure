import React from 'react';
import { render, screen } from '@testing-library/react';
import CcStatementParser from './components/CcStatementParser';

test('renders parser heading', () => {
  render(<CcStatementParser />);
  expect(screen.getByText(/Credit Card Statement Parser/i)).toBeInTheDocument();
});
