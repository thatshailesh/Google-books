import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { lastValueFrom, of, throwError, Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import fetch from 'node-fetch';
import { BadRequestException } from '@nestjs/common';

describe('BooksService', () => {
  let booksService: BooksService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule.forRoot()],
      providers: [
        BooksService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === "GOOGLE_API_URL") return 'https://www.googleapis.com'
              if (key === "GOOGLE_API_KEY") return 'test-api-key'
              return null
            })
          }
        },
      ],
    }).compile();
    booksService = module.get<BooksService>(BooksService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(booksService).toBeDefined();
  });

  describe('searchBooks', () => {
    it('should be able to search books successfully', async () => {
      const query = 'atomic';
      const skip = 0;
      const limit = 1;
      const googleAPIUrl = 'https://www.googleapis.com';
      const googleAPIKey = 'test-api-key';

      jest
        .spyOn(configService, 'get')
        .mockReturnValueOnce(googleAPIUrl)
        .mockReturnValueOnce(googleAPIKey);
      const mockData = {
        "totalItems": 2162,
        "items": [{
          "kind": "books#volume",
          "id": "rruOEAAAQBAJ",
          "etag": "Z7frc3g0z7w",
          "selfLink": "https://www.googleapis.com/books/v1/volumes/rruOEAAAQBAJ",
          "volumeInfo": {
            "title": "Atomic Habits",
            "subtitle": "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
            "authors": [
                "James Clear"
            ],
            "publisher": "National Geographic Books",
            "publishedDate": "2018-10-16",
            "description": "The #1 New York Times bestseller. Over 4 million copies sold! Tiny Changes, Remarkable Results No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results. If you're having trouble changing your habits, the problem isn't you. The problem is your system. Bad habits repeat themselves again and again not because you don't want to change, but because you have the wrong system for change. You do not rise to the level of your goals. You fall to the level of your systems. Here, you'll get a proven system that can take you to new heights. Clear is known for his ability to distill complex topics into simple behaviors that can be easily applied to daily life and work. Here, he draws on the most proven ideas from biology, psychology, and neuroscience to create an easy-to-understand guide for making good habits inevitable and bad habits impossible. Along the way, readers will be inspired and entertained with true stories from Olympic gold medalists, award-winning artists, business leaders, life-saving physicians, and star comedians who have used the science of small habits to master their craft and vault to the top of their field. Learn how to: make time for new habits (even when life gets crazy); overcome a lack of motivation and willpower; design your environment to make success easier; get back on track when you fall off course; ...and much more. Atomic Habits will reshape the way you think about progress and success, and give you the tools and strategies you need to transform your habits--whether you are a team looking to win a championship, an organization hoping to redefine an industry, or simply an individual who wishes to quit smoking, lose weight, reduce stress, or achieve any other goal.",
            "industryIdentifiers": [
                {
                    "type": "ISBN_13",
                    "identifier": "9780735211292"
                },
                {
                    "type": "ISBN_10",
                    "identifier": "0735211299"
                }
            ],
            "readingModes": {
                "text": true,
                "image": false
            },
            "pageCount": 0,
            "printType": "BOOK",
            "categories": [
                "Business & Economics"
            ],
            "maturityRating": "NOT_MATURE",
            "allowAnonLogging": false,
            "contentVersion": "preview-1.0.0",
            "panelizationSummary": {
                "containsEpubBubbles": false,
                "containsImageBubbles": false
            },
          }
        }]
      }
      const mockResponse = {
        mostCommonAuthor: "James Clear",
        earliestPublicationDate: "2018-10-16",
        mostRecentPublicationDate: "2018-10-16",
        items: mockData.items,
        totalResults: 2162,
      }

      const axiosResponse = {
        data: mockData,
        status: 200, // Set the appropriate status code
        statusText: 'OK',
        headers: {}, // Mock headers if needed
        config: {},
      };

      jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(axiosResponse as AxiosResponse))

      const result = await booksService.searchBooks(query, skip, limit)

      expect(result).toEqual(expect.objectContaining(mockResponse));
      expect(httpService.get).toHaveBeenCalledWith(
        `${googleAPIUrl}/books/v1/volumes?key=${googleAPIKey}&q=${query}&startIndex=${skip}&maxResults=${limit}`,
      );
    })
  })
  
  it('should throw error if query is not provided', async () => {
    const query = '';

    await expect(booksService.searchBooks(query)).rejects.toThrowError(
      BadRequestException,
    );
  })

  it('should handle API request errors', async () => {
    const query = 'example';
    const skip = 0;
    const limit = 10;
    const googleAPIUrl = 'https://www.googleapis.com';
    const googleAPIKey = 'test-api-key';

    jest
      .spyOn(configService, 'get')
      .mockReturnValueOnce(googleAPIUrl)
      .mockReturnValueOnce(googleAPIKey);

    const errorResponse = {
      response: {
        status: 500,
        data: 'Internal Server Error',
      },
    };

    jest
      .spyOn(httpService, 'get')
      .mockReturnValue(throwError(errorResponse));

    await expect(
      booksService.searchBooks(query, skip, limit),
    ).rejects.toMatchObject(errorResponse);
  });

});
