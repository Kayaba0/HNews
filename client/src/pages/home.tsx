import { useState, useMemo } from 'react';
import { useStore, Anime } from '@/lib/data';
import { format, getMonth, getYear, parseISO } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterX } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AnimeCard } from '@/components/anime-card';
import { AnimeDetail } from '@/components/anime-detail';

export default function Home() {
  const { animes, language } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStudio, setSelectedStudio] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);

  const years = useMemo(() => Array.from(new Set(animes.map(a => getYear(parseISO(a.releaseDate)).toString()))).sort(), [animes]);
  const studios = useMemo(() => Array.from(new Set(animes.map(a => a.studio))).sort(), [animes]);
  const genres = useMemo(() => Array.from(new Set(animes.flatMap(a => a.genre))).sort(), [animes]);

  const filteredAnimes = useMemo(() => {
    return animes.filter(anime => {
      const date = parseISO(anime.releaseDate);
      const matchSearch = anime.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMonth = selectedMonth === 'all' || getMonth(date).toString() === selectedMonth;
      const matchYear = selectedYear === 'all' || getYear(date).toString() === selectedYear;
      const matchStudio = selectedStudio === 'all' || anime.studio === selectedStudio;
      const matchGenre = selectedGenre === 'all' || anime.genre.includes(selectedGenre);

      return matchSearch && matchMonth && matchYear && matchStudio && matchGenre;
    });
  }, [animes, searchTerm, selectedMonth, selectedYear, selectedStudio, selectedGenre]);

  const groupedAnimes = useMemo(() => {
    const groups: Record<string, Anime[]> = {};
    filteredAnimes.forEach(anime => {
      const date = parseISO(anime.releaseDate);
      const key = format(date, 'yyyy-MM');
      if (!groups[key]) groups[key] = [];
      groups[key].push(anime);
    });
    return Object.keys(groups).sort().map(key => ({
      key,
      date: parseISO(key + '-01'),
      animes: groups[key]
    }));
  }, [filteredAnimes]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedMonth('all');
    setSelectedYear('all');
    setSelectedStudio('all');
    setSelectedGenre('all');
  };

  const handleQuickFilter = (type: 'studio' | 'genre' | 'year', value: string) => {
    if (type === 'studio') setSelectedStudio(value);
    if (type === 'genre') setSelectedGenre(value);
    if (type === 'year') setSelectedYear(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const months = [
    { val: '0', label: language === 'it' ? 'Gennaio' : 'January' },
    { val: '1', label: language === 'it' ? 'Febbraio' : 'February' },
    { val: '2', label: language === 'it' ? 'Marzo' : 'March' },
    { val: '3', label: language === 'it' ? 'Aprile' : 'April' },
    { val: '4', label: language === 'it' ? 'Maggio' : 'May' },
    { val: '5', label: language === 'it' ? 'Giugno' : 'June' },
    { val: '6', label: language === 'it' ? 'Luglio' : 'July' },
    { val: '7', label: language === 'it' ? 'Agosto' : 'August' },
    { val: '8', label: language === 'it' ? 'Settembre' : 'September' },
    { val: '9', label: language === 'it' ? 'Ottobre' : 'October' },
    { val: '10', label: language === 'it' ? 'Novembre' : 'November' },
    { val: '11', label: language === 'it' ? 'Dicembre' : 'December' },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="flex-1">
        <div className="sticky top-16 z-40 bg-background/0 -mx-4 px-4 pt-4 pb-2">
          <div className="absolute inset-x-0 -top-20 h-40 bg-gradient-to-b from-background via-background/95 to-transparent pointer-events-none" />
          
          <div className="relative flex flex-wrap items-center gap-3 backdrop-blur-xl border border-white/10 bg-background/60 p-4 rounded-3xl shadow-lg">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px] rounded-xl bg-background/50 border-white/5 h-10 glass-card">
                <SelectValue placeholder={language === 'it' ? 'Mese' : 'Month'} />
              </SelectTrigger>
              <SelectContent className="glass-panel">
                <SelectItem value="all">{language === 'it' ? 'Tutti i mesi' : 'All Months'}</SelectItem>
                {months.map(m => <SelectItem key={m.val} value={m.val}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[110px] rounded-xl bg-background/50 border-white/5 h-10 glass-card">
                <SelectValue placeholder={language === 'it' ? 'Anno' : 'Year'} />
              </SelectTrigger>
              <SelectContent className="glass-panel">
                <SelectItem value="all">{language === 'it' ? 'Tutti' : 'All Years'}</SelectItem>
                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedStudio} onValueChange={setSelectedStudio}>
              <SelectTrigger className="w-[150px] rounded-xl bg-background/50 border-white/5 h-10 glass-card">
                <SelectValue placeholder="Studio" />
              </SelectTrigger>
              <SelectContent className="glass-panel">
                <SelectItem value="all">All Studios</SelectItem>
                {studios.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

             <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-[130px] rounded-xl bg-background/50 border-white/5 h-10 glass-card">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent className="glass-panel">
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button 
              variant="ghost" 
              onClick={resetFilters}
              className="rounded-xl px-3 hover:bg-white/5 text-muted-foreground hover:text-foreground h-10"
            >
              <FilterX className="size-4 mr-2" />
              {language === 'it' ? 'Resetta' : 'Reset'}
            </Button>
          </div>
        </div>

        <div className="space-y-12 pb-20 mt-4">
          {groupedAnimes.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              {language === 'it' ? 'Nessun risultato trovato.' : 'No results found.'}
            </div>
          ) : (
            groupedAnimes.map((group) => (
              <section key={group.key}>
                <div className="flex items-baseline gap-4 mb-6 border-b border-white/5 pb-4">
                  <h2 className="text-3xl font-display font-bold text-gradient">
                    {format(group.date, 'MMMM', { locale: language === 'it' ? it : enUS })}
                  </h2>
                  <span className="text-xl text-muted-foreground font-light">
                    {format(group.date, 'yyyy')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {group.animes.map((anime) => (
                    <AnimeCard 
                      key={anime.id} 
                      anime={anime} 
                      onClick={() => setSelectedAnime(anime)} 
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedAnime && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnime(null)}
              className="fixed inset-0 bg-background/60 backdrop-blur-md z-40"
            />
            
            <motion.aside
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-4 inset-y-20 lg:inset-x-[10%] lg:inset-y-[15%] z-50 glass-panel rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10"
            >
              <AnimeDetail 
                anime={selectedAnime} 
                onClose={() => setSelectedAnime(null)} 
                onQuickFilter={handleQuickFilter}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
