import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import coverAction from '@assets/generated_images/anime_cover_art_action_shonen_style.png';
import coverScifi from '@assets/generated_images/anime_cover_art_sci-fi_cyberpunk_style.png';
import coverSlice from '@assets/generated_images/anime_cover_art_slice_of_life_school_style.png';

export interface Anime {
  id: string;
  title: string;
  releaseDate: string; // ISO date string
  studio: string;
  genre: string[];
  description: string;
  coverImage: string;
  gallery: string[];
  episodes?: number;
}

interface AppState {
  animes: Anime[];
  isAdmin: boolean;
  language: 'it' | 'en';
  theme: 'dark' | 'light';
  login: () => void;
  logout: () => void;
  setLanguage: (lang: 'it' | 'en') => void;
  addAnime: (anime: Anime) => void;
  updateAnime: (id: string, anime: Partial<Anime>) => void;
  deleteAnime: (id: string) => void;
}

const genresList = ['Action', 'Sci-Fi', 'Fantasy', 'Shonen', 'Seinen', 'Slice of Life', 'Romance', 'Mystery', 'Supernatural', 'Mecha', 'Adventure'];
const studiosList = ['Future Works', 'Kyoto Hearts', 'Mappa Arts', 'Ufotable', 'Bones', 'Madhouse', 'Wit Studio', 'A-1 Pictures', 'CloverWorks', 'Production I.G'];

const generateMockAnimes = (): Anime[] => {
  const animes: Anime[] = [
    {
      id: '1',
      title: 'Cyber Chronicles: Neon Dawn',
      releaseDate: '2026-03-15',
      studio: 'Future Works',
      genre: ['Sci-Fi', 'Cyberpunk', 'Action'],
      description: 'In a world where humanity has merged with machines, one detective seeks the truth behind the phantom code.',
      coverImage: coverScifi,
      gallery: [coverScifi, coverAction],
    },
    {
      id: '2',
      title: 'Sakura High: Eternal Spring',
      releaseDate: '2026-04-02',
      studio: 'Kyoto Hearts',
      genre: ['Slice of Life', 'Romance', 'School'],
      description: 'A heartwarming story of friendship and first love beneath the falling cherry blossoms.',
      coverImage: coverSlice,
      gallery: [coverSlice, coverScifi],
    },
    {
      id: '3',
      title: 'Blade of the Void',
      releaseDate: '2026-03-20',
      studio: 'Mappa Arts',
      genre: ['Action', 'Fantasy', 'Shonen'],
      description: 'The void is expanding. Only the wielder of the Starlight Blade can seal the rift before it consumes the world.',
      coverImage: coverAction,
      gallery: [coverAction, coverSlice],
    },
  ];

  // Add more examples
  for (let i = 4; i <= 15; i++) {
    const randomMonth = Math.floor(Math.random() * 6) + 1; // Jan to June
    const randomDay = Math.floor(Math.random() * 28) + 1;
    const randomStudio = studiosList[Math.floor(Math.random() * studiosList.length)];
    const randomGenres = [
      genresList[Math.floor(Math.random() * genresList.length)],
      genresList[Math.floor(Math.random() * genresList.length)]
    ].filter((v, i, a) => a.indexOf(v) === i);
    
    const randomCover = [coverAction, coverScifi, coverSlice][Math.floor(Math.random() * 3)];
    const randomEpisodes = Math.floor(Math.random() * 12) + 12;

    animes.push({
      id: i.toString(),
      title: `Anime Legend ${i}: The Quest`,
      releaseDate: `2026-0${randomMonth}-${randomDay.toString().padStart(2, '0')}`,
      studio: randomStudio,
      genre: randomGenres,
      description: 'An epic journey across unknown lands where heroes are forged and legends are born in the heat of battle.',
      coverImage: randomCover,
      gallery: [randomCover, coverAction, coverScifi],
      episodes: randomEpisodes,
    });
  }

  return animes;
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      animes: generateMockAnimes(),
      isAdmin: false,
      language: 'it',
      theme: 'dark',
      login: () => set({ isAdmin: true }),
      logout: () => set({ isAdmin: false }),
      setLanguage: (lang) => set({ language: lang }),
      addAnime: (anime) => set((state) => ({ animes: [...state.animes, anime] })),
      updateAnime: (id, updated) =>
        set((state) => ({
          animes: state.animes.map((a) => (a.id === id ? { ...a, ...updated } : a)),
        })),
      deleteAnime: (id) =>
        set((state) => ({ animes: state.animes.filter((a) => a.id !== id) })),
    }),
    {
      name: 'anime-release-store-v2',
    }
  )
);
