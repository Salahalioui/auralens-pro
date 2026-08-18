export interface SamplePhoto {
  id: string;
  title: string;
  category: string;
  amateurIssue: string;
  url: string;
  thumbnail: string;
}

export const SAMPLE_PHOTOS: SamplePhoto[] = [
  {
    id: 'sample-portrait',
    title: 'Casual Outdoor Portrait',
    category: 'Portrait',
    amateurIssue: 'Harsh midday shadows, flat skin tones & distracting background foliage',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'sample-landscape',
    title: 'Tilted Mountain Horizon',
    category: 'Landscape',
    amateurIssue: 'Tilted horizon, blown sky highlights & crushed shadow dynamic range',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'sample-street',
    title: 'Urban Street Motion',
    category: 'Street Photography',
    amateurIssue: 'Off-center composition, flat overcast grey tones & lack of focal depth',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'sample-architecture',
    title: 'Historic European Alley',
    category: 'Architecture',
    amateurIssue: 'Narrow focal angle, washed out warm tones & uninspiring shadow contrast',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80',
  }
];
