# Google Books Search

Full Stack application to search for books using Google API

## Features

- Allows text based search for books
- Display paginated results
- Most Common Author
- Earliest Publication Date
- Most Recent Publication Date
- Server Response Time

## Technologies Used

- Node.js
- React.js
- NestJs
- Typescript
- Jest

## Usage
Refer .sample.env to add the relevant environment variables before running application via docker

```bash
docker-compose build
docker-compose up
```

## API Documentation

### Search for a book
Endpoint: `GET /api/books?query=$q&skip=${skip}&limit=${limit}`

Response:

```
{
  mostCommonAuthor: "",
  earliestPublicationDate: "YYYY-MM-DD",
  mostRecentPublicationDate: "YYYY-MM-DD",
  items: [
    {
          kind: 'books#volume',
          id: 'rruOEAAAQBAJ',
          etag: 'Z7frc3g0z7w',
          selfLink: 'https://www.googleapis.com/books/v1/volumes/rruOEAAAQBAJ',
          volumeInfo: [Object]
    }
  ],
  totalResults: 1
}
```

## Testing

### Unit test
```
npm run test
```
