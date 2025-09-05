import axios from 'axios';

const YOUTUBE_API_KEY = 'AIzaSyClaO2CyUBMIp7EX-TN-gsb3EjMO2ss8FE';
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

export interface YouTubeSearchResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export const searchYouTubeVideos = async (
  query: string,
  maxResults: number = 12,
  pageToken?: string
): Promise<YouTubeSearchResponse> => {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        key: YOUTUBE_API_KEY,
        q: query,
        part: 'snippet',
        type: 'video',
        maxResults,
        pageToken,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    throw new Error('Failed to search YouTube videos');
  }
};

export const getTrendingVideos = async (
  maxResults: number = 12,
  regionCode: string = 'US'
): Promise<YouTubeSearchResponse> => {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        key: YOUTUBE_API_KEY,
        part: 'snippet',
        chart: 'mostPopular',
        regionCode,
        maxResults,
      },
    });
    
    // Transform the response to match our interface
    const transformedItems = response.data.items.map((item: any) => ({
      id: { videoId: item.id },
      snippet: item.snippet,
    }));
    
    return {
      items: transformedItems,
      pageInfo: response.data.pageInfo,
    };
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    throw new Error('Failed to fetch trending videos');
  }
};

