import { ServiceCategory } from '@/types/domain';

const IMAGE_OPTIONS: Record<ServiceCategory, string[]> = {
  nutrition: [
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1400&q=82',
    'https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&w=1400&q=82',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1400&q=82',
  ],
  physical_activity: [
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=82',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=82',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1400&q=82',
  ],
  ergonomics: [
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=82',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=82',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=82',
  ],
  mental_health: [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=82',
    'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=1400&q=82',
    'https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&w=1400&q=82',
  ],
  wellbeing: [
    'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=1400&q=82',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=82',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1400&q=82',
  ],
};

export function getServiceImageOptions(category: ServiceCategory) {
  return IMAGE_OPTIONS[category];
}

export function getDefaultServiceImage(category: ServiceCategory, title = '') {
  const images = IMAGE_OPTIONS[category];
  const hash = [...title].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return images[hash % images.length];
}
