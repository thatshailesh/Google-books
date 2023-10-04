import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import styles from './Books.module.css'

export default function Books() {
    const [query, setQuery] = useState('');
    const [limit, setLimit] = useState(10);
    const [skip, setSkip] = useState(0); // Number of items to skip
    const [results, setResults] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [error, setError] = useState<string | null>(null); // Error state
    const [mostCommonAuthor, setMostCommonAuthor] = useState<string>('');
    const [earliestPublicationDate, setEarliestPublicationDate] = useState<string>('');
    const [mostRecentPublicationDate, setMostRecentPublicationDate] = useState<string>('');
    const [responseTime, setResponseTime] = useState<number | null>(null);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    axios.defaults.baseURL = process.env.API_URL

    const searchBooks = async () => {
        try {
            const response = await axios.get(`/api/books?query=${query}&skip=${skip}&limit=${limit}`);
            setResults(response.data.items || []);
            setTotalItems(response.data.totalResults || 0);
            setMostCommonAuthor(response.data.mostCommonAuthor || '');
            setEarliestPublicationDate(response.data.earliestPublicationDate || '');
            setMostRecentPublicationDate(response.data.mostRecentPublicationDate || '');
            setResponseTime(response.data.responseTime || null);
            setError(null); // Clear any previous errors on successful request
        } catch (error) {
            console.log('Error searching books:', error);
            if (axios.isAxiosError(error)) {
                // The request was made, but the server responded with an error status code (e.g., 404)
                const axiosError = error as AxiosError;
                if (axiosError.response) {
                    // The request was made, but the server responded with an error status code (e.g., 404)
                    setError('Server Error: Please try again later.');
                } else if (axiosError.request) {
                    // The request was made but no response was received (e.g., network issue)
                    setError('Network Error: Please check your internet connection.');
                } else {
                    // Something else caused the request to fail
                    setError('An unknown error occurred.');
                }
            } else {
                // Something else caused the request to fail
                setError('An unknown error occurred.');
            }
        }
    };

    useEffect(() => {
        if (query) {
            searchBooks();
        }
    }, [limit, skip]); // Trigger a search when skip value changes

    const handlePreviousPage = () => {
        if (skip - limit >= 0) {
          setSkip(skip - limit);
        }
    };
    
    const handleNextPage = () => {
        if (skip + limit < totalItems) {
          setSkip(skip + limit);
        }
    };

    const handleExpandItem = (itemId: string) => {
        // Toggle the expanded state of the clicked item
        setExpandedItem(prevItem => (prevItem === itemId ? null : itemId));
    };
    const isSearchDisabled = query === ''
    return (
        <div className={styles.container}>
          <h1>Google Books Search</h1>
          <div className={styles.form}>
            <input
                type="text"
                placeholder="Enter your search query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <select onChange={(e) => setLimit(parseInt(e.target.value))} value={limit}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
            </select>
            <button onClick={searchBooks} disabled={isSearchDisabled}>Search</button>
          </div>
            {error ? ( // Display error message if error exists
                <div className={`${styles.error}`}>
                    {error}
                </div>): null }
            {results.length > 0 ? (
                <div className={styles.stats}>
                    <p>Most Common Author: {mostCommonAuthor}</p>
                    <p>Earliest Publication Date: {earliestPublicationDate}</p>
                    <p>Most Recent Publication Date: {mostRecentPublicationDate}</p>
                    <p>Server Response Time: {responseTime} ms</p>
                </div>
            ): null}
                <div className={styles.results}>
                    {results.map((book) => (
                    <div key={book.id} className={styles.item}>
                        <p className={styles.title} onClick={() => handleExpandItem(book.id)}>
                            {book.volumeInfo.authors?.join(', ') || 'Unknown author'} - {book.volumeInfo.title}</p>
                            {
                                expandedItem === book.id ? (
                                    <p className={styles.description}>
                                        {book.volumeInfo.description || "No description available."}
                                    </p>
                                ) : null
                            }
                    </div>
                    ))}
                </div>
                <div className={styles.pagination}>
                    <button className={styles['pagination-button']} onClick={handlePreviousPage} disabled={skip === 0}>Previous</button>
                    <button className={styles['pagination-button']} onClick={handleNextPage} disabled={skip + limit >= totalItems}>Next</button>
                </div>
        </div>
      );
}