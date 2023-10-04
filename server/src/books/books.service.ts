import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import SearchBookResult from './interfaces/googlebook.interface';

@Injectable()
export class BooksService {
    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService
    ) {}

    async searchBooks(query: string, skip: number = 0, limit: number = 10): Promise<SearchBookResult> {
        if (!query) throw new BadRequestException('Query is missing')
        const googlebaseAPIUrl = this.configService.get('GOOGLE_API_URL')
        const googleAPIKey = this.configService.get('GOOGLE_API_KEY')
        const queryUrl = `${googlebaseAPIUrl}/books/v1/volumes?key=${googleAPIKey}&q=${query}&startIndex=${skip}&maxResults=${limit}`
        const startTime = new Date().getTime(); // Record start time
        const { data = {} } = await lastValueFrom(this.httpService.get(queryUrl))

        const endTime = new Date().getTime() // Record end time
        const responseTime = endTime - startTime // Calculate response time in milliseconds
        const responseData = data
        const items = responseData.items || []
        // Calculate the most common author
        const authors = items.reduce((authorMap, item) => {
            const volumeInfo = item.volumeInfo;
            if (volumeInfo && volumeInfo.authors) {
                for (const author of volumeInfo.authors) {
                    authorMap[author] = (authorMap[author] || 0) + 1;
                }
            }
            return authorMap;
        }, {})
        let mostCommonAuthor = "N/A"
        if (Object.keys(authors).length > 0) {
            mostCommonAuthor = Object.keys(authors).reduce(
                (a, b) =>authors[a] > authors[b] ? a : b
            )
        }
        const publicationDates = items.map(item => item.volumeInfo.publishedDate).filter(Boolean)
        const [earliestDate, mostRecentDate] = publicationDates
        .map(dateString => new Date(dateString))
        .sort((a, b) => a - b)
        const earliestPublicationDate = earliestDate.toISOString().split('T')[0]
        const mostRecentPublicationDate = mostRecentDate ? mostRecentDate.toISOString().split('T')[0] : earliestPublicationDate
        
        return {
            totalResults: responseData.totalItems || 0,
            mostCommonAuthor,
            earliestPublicationDate,
            mostRecentPublicationDate,
            responseTime,
            items
          }
    }
}
