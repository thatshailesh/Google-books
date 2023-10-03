// import React from 'react';
import '@testing-library/jest-dom'
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Books from '../Books';

jest.mock('axios', () => ({
    get: jest.fn()
}));

describe('Books Component', () => {
  // Sample response data for testing
  const sampleResponse = {
    data: {
      totalResults: 1000,
      mostCommonAuthor: 'James',
      earliestPublicationDate: '2018-06-18',
      mostRecentPublicationDate: '2018-06-18',
      responseTime: 200,
      items: [
        {
          id: '1',
          volumeInfo: {
            authors: ['Author1'],
            title: 'Book1',
            description: 'Description1',
          },
        },
        {
          id: '2',
          volumeInfo: {
            authors: ['Author2'],
            title: 'Book2',
          },
        },
      ],
    },
  };

  it('should render the Books component', () => {
    const { getByText, getByPlaceholderText, getByDisplayValue } = render(<Books />);
    
    // Verify that initial elements are rendered
    const searchButton = getByText('Search');
    const searchInput = getByPlaceholderText('Enter your search query');
    const limitSelect = getByDisplayValue('10');

    expect(searchButton).toBeInTheDocument();
    expect(searchInput).toBeInTheDocument();
    expect(limitSelect).toBeInTheDocument();
  });

  it('should display an error message on network error', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

    const { getByText } = render(<Books />);
    
    const searchButton = getByText('Search');
    fireEvent.click(searchButton);

    const errorMessage = await waitFor(() => getByText('Network Error: Please check your internet connection.'));
    expect(errorMessage).toBeInTheDocument();
  });

  it('should display search results', async () => {
    (axios.get as jest.Mock).mockResolvedValue(sampleResponse);

    const { getByText } = render(<Books />);
    
    const searchButton = getByText('Search');
    fireEvent.click(searchButton);

    // Wait for the search results to be displayed
    const book1Title = await waitFor(() => getByText('Author1 - Book1'));
    const book2Title = await waitFor(() => getByText('Author2 - Book2'));

    expect(book1Title).toBeInTheDocument();
    expect(book2Title).toBeInTheDocument();
  });

  it('should expand and collapse book description', async () => {
    (axios.get as jest.Mock).mockResolvedValue(sampleResponse);

    const { getByText, queryByText } = render(<Books />);
    
    const searchButton = getByText('Search');
    fireEvent.click(searchButton);

    // Wait for the search results to be displayed
    const book1Title = await waitFor(() => getByText('Author1 - Book1'));

    fireEvent.click(book1Title); // Expand description

    const book1Description = await waitFor(() => getByText('Description1'));
    expect(book1Description).toBeInTheDocument();

    fireEvent.click(book1Title); // Collapse description

    // Wait for the description to be removed from the DOM
    await waitFor(() => {
      const description = queryByText('Description1');
      expect(description).toBeNull();
    });
  });
});
