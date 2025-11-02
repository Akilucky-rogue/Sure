import { render, screen } from '@testing-library/react';
import App from './App';

test('renders credit card parser', () => {
  render(<App />);
  const heading = screen.getByText(/Credit Card Statement Parser/i);
  expect(heading).toBeInTheDocument();
});
