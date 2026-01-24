export interface Pin {
  id: string
  title: string
  description?: string
  imageUrl: string
  width: number
  height: number
  userId?: string
  boardId?: string
  createdAt?: Date
  source?: string
  sourceUrl?: string
  attribution?: {
    photographer: string
    photographerUrl: string
    unsplashUrl: string
  }
}

// Mock pin data with varied dimensions for natural masonry layout
export const MOCK_PINS: Pin[] = [
  {
    id: '1',
    title: 'Cozy Reading Nook with Natural Light',
    description: 'Transform your corner into a peaceful reading space',
    imageUrl: 'https://picsum.photos/seed/pin1/400/600',
    width: 400,
    height: 600,
  },
  {
    id: '2',
    title: 'Minimalist Kitchen Design',
    description: 'Clean lines and functional spaces',
    imageUrl: 'https://picsum.photos/seed/pin2/400/500',
    width: 400,
    height: 500,
  },
  {
    id: '3',
    title: 'Sunset Mountain Landscape',
    description: 'Nature photography inspiration',
    imageUrl: 'https://picsum.photos/seed/pin3/400/300',
    width: 400,
    height: 300,
  },
  {
    id: '4',
    title: 'Modern Living Room Ideas',
    description: 'Contemporary furniture and color schemes',
    imageUrl: 'https://picsum.photos/seed/pin4/400/550',
    width: 400,
    height: 550,
  },
  {
    id: '5',
    title: 'Homemade Chocolate Cake Recipe',
    description: 'Delicious and easy to make dessert',
    imageUrl: 'https://picsum.photos/seed/pin5/400/450',
    width: 400,
    height: 450,
  },
  {
    id: '6',
    title: 'Garden Design Inspiration',
    description: 'Create your dream outdoor space',
    imageUrl: 'https://picsum.photos/seed/pin6/400/350',
    width: 400,
    height: 350,
  },
  {
    id: '7',
    title: 'Scandinavian Bedroom Decor',
    description: 'Minimalist and cozy bedroom ideas',
    imageUrl: 'https://picsum.photos/seed/pin7/400/520',
    width: 400,
    height: 520,
  },
  {
    id: '8',
    title: 'Ocean Waves Photography',
    description: 'Coastal landscape inspiration',
    imageUrl: 'https://picsum.photos/seed/pin8/400/280',
    width: 400,
    height: 280,
  },
  {
    id: '9',
    title: 'Healthy Breakfast Bowl Ideas',
    description: 'Nutritious and colorful morning meals',
    imageUrl: 'https://picsum.photos/seed/pin9/400/400',
    width: 400,
    height: 400,
  },
  {
    id: '10',
    title: 'Urban Architecture Photography',
    description: 'Modern city building designs',
    imageUrl: 'https://picsum.photos/seed/pin10/400/580',
    width: 400,
    height: 580,
  },
  {
    id: '11',
    title: 'Boho Living Room Style',
    description: 'Eclectic and colorful home decor',
    imageUrl: 'https://picsum.photos/seed/pin11/400/480',
    width: 400,
    height: 480,
  },
  {
    id: '12',
    title: 'Forest Trail Adventure',
    description: 'Hiking and nature exploration',
    imageUrl: 'https://picsum.photos/seed/pin12/400/320',
    width: 400,
    height: 320,
  },
  {
    id: '13',
    title: 'DIY Home Office Setup',
    description: 'Productive workspace organization',
    imageUrl: 'https://picsum.photos/seed/pin13/400/550',
    width: 400,
    height: 550,
  },
  {
    id: '14',
    title: 'Vintage Fashion Inspiration',
    description: 'Retro clothing and style ideas',
    imageUrl: 'https://picsum.photos/seed/pin14/400/600',
    width: 400,
    height: 600,
  },
  {
    id: '15',
    title: 'Succulent Garden Arrangement',
    description: 'Low-maintenance indoor plants',
    imageUrl: 'https://picsum.photos/seed/pin15/400/380',
    width: 400,
    height: 380,
  },
  {
    id: '16',
    title: 'Pasta Recipe Collection',
    description: 'Italian cuisine cooking guide',
    imageUrl: 'https://picsum.photos/seed/pin16/400/420',
    width: 400,
    height: 420,
  },
  {
    id: '17',
    title: 'Coastal Living Room Design',
    description: 'Beach-inspired home decor',
    imageUrl: 'https://picsum.photos/seed/pin17/400/500',
    width: 400,
    height: 500,
  },
  {
    id: '18',
    title: 'Abstract Art Inspiration',
    description: 'Modern art and color theory',
    imageUrl: 'https://picsum.photos/seed/pin18/400/400',
    width: 400,
    height: 400,
  },
  {
    id: '19',
    title: 'Winter Landscape Photography',
    description: 'Snow-covered mountain scenes',
    imageUrl: 'https://picsum.photos/seed/pin19/400/350',
    width: 400,
    height: 350,
  },
  {
    id: '20',
    title: 'Modern Bathroom Renovation',
    description: 'Spa-like bathroom design ideas',
    imageUrl: 'https://picsum.photos/seed/pin20/400/530',
    width: 400,
    height: 530,
  },
]
