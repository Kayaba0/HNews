import { useState, useEffect } from 'react';
import { Anime, useStore } from '@/lib/data';
import { format, parseISO, getYear } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Calendar, Building2, Layers, ChevronLeft, ChevronRight, Maximize2, Tv } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface AnimeDetailProps {
  anime: Anime | null;
  onClose: () => void;
  onQuickFilter: (type: 'studio' | 'genre' | 'year', value: string) => void;
}

export function AnimeDetail({ anime, onClose, onQuickFilter }: AnimeDetailProps) {
  const { language } = useStore();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (anime) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [anime]);

  if (!anime) return null;

  const galleryImages = [
    anime.coverImage, 
    ...anime.gallery,
    ...anime.gallery
  ];

  const nextImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % galleryImages.length);
  };

  const prevImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Left Column: Big Image */}
      <div className="relative w-full md:w-[45%] h-64 md:h-full shrink-0 overflow-hidden bg-black">
        <img 
          src={anime.coverImage} 
          alt={anime.title} 
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-transparent to-background/90" />
      </div>

      {/* Right Column: Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/60 backdrop-blur-md">
        <div className="flex justify-end p-6 pb-0">
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full bg-white/5 hover:bg-white/10 text-white h-12 w-12"
            onClick={onClose}
          >
            <X className="size-8" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-8 lg:p-12 pt-4 space-y-10">
            {/* Title & Date Section At Top Right */}
            <div className="space-y-4">
              <Badge 
                variant="outline" 
                className="border-secondary/50 text-secondary bg-secondary/10 px-4 py-1.5 text-base rounded-xl cursor-pointer hover:bg-secondary/20 transition-all"
                onClick={() => onQuickFilter('year', getYear(parseISO(anime.releaseDate)).toString())}
              >
                {format(parseISO(anime.releaseDate), 'MMMM yyyy', { locale: language === 'it' ? it : enUS })}
              </Badge>
              <h2 className="text-4xl lg:text-6xl font-display font-bold text-white leading-none">
                {anime.title}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {anime.genre.map(g => (
                <Badge 
                  key={g} 
                  variant="secondary" 
                  className="rounded-full px-5 py-2 bg-white/5 hover:bg-primary/20 hover:text-primary transition-all cursor-pointer border-transparent text-sm font-medium"
                  onClick={() => onQuickFilter('genre', g)}
                >
                  {g}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer group hover:bg-white/10 transition-all"
                onClick={() => onQuickFilter('studio', anime.studio)}
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Studio</span>
                  <span className="font-bold text-base leading-tight">{anime.studio}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <Tv className="size-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{language === 'it' ? 'Episodi' : 'Episodes'}</span>
                  <span className="font-bold text-base leading-tight">
                    {anime.episodes || 'TBA'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-primary/80">
                 <Layers className="size-5" />
                 {language === 'it' ? 'Sinossi' : 'Synopsis'}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg font-light">
                {anime.description}
              </p>
            </div>

            {/* Gallery Section - Vertical Scrollable Grid */}
            <div className="space-y-6 pt-4">
              <h3 className="text-xl font-bold">Gallery</h3>
              <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {galleryImages.map((img, idx) => (
                  <motion.div 
                    key={idx} 
                    whileHover={{ scale: 1.05 }}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-black/50 border border-white/5"
                    onClick={() => setLightboxIndex(idx)}
                  >
                    <img 
                      src={img} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Maximize2 className="size-5 text-white" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={lightboxIndex !== null} onOpenChange={() => setLightboxIndex(null)}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] p-0 border-none bg-black/95 backdrop-blur-2xl flex items-center justify-center overflow-hidden">
          {lightboxIndex !== null && (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <motion.img 
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={galleryImages[lightboxIndex]} 
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              />
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-6 rounded-full bg-white/10 text-white hover:bg-white/20 p-2 h-12 w-12"
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
              >
                <ChevronLeft className="size-10" />
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-6 rounded-full bg-white/10 text-white hover:bg-white/20 p-2 h-12 w-12"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
              >
                <ChevronRight className="size-10" />
              </Button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium border border-white/10">
                {lightboxIndex + 1} / {galleryImages.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
