import { useState } from 'react';
import { Anime, useStore } from '@/lib/data';
import { format, parseISO, getYear } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Calendar, Building2, Layers, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
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

  if (!anime) return null;

  const galleryImages = [
    anime.coverImage, 
    ...anime.gallery, 
    ...anime.gallery, // Duplicating for testing scroll if needed
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
      {/* Left Column: Image & Basic Info (Vertical on mobile, Left on Desktop) */}
      <div className="relative w-full md:w-[40%] h-64 md:h-full shrink-0 overflow-hidden">
        <img 
          src={anime.coverImage} 
          alt={anime.title} 
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent to-background/95 md:to-background/90" />
        
        <div className="absolute bottom-6 left-6 right-6">
          <Badge 
            variant="outline" 
            className="mb-3 border-secondary/50 text-secondary bg-secondary/10 px-3 py-1 text-sm rounded-lg cursor-pointer hover:bg-secondary/20"
            onClick={() => onQuickFilter('year', getYear(parseISO(anime.releaseDate)).toString())}
          >
            {format(parseISO(anime.releaseDate), 'MMMM yyyy', { locale: language === 'it' ? it : enUS })}
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-display font-bold text-white leading-tight">
            {anime.title}
          </h2>
        </div>
      </div>

      {/* Right Column: Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/40">
        <div className="flex justify-end p-4">
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 text-white"
            onClick={onClose}
          >
            <X className="size-6" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 lg:p-10 space-y-8">
            <div className="flex flex-wrap gap-2">
              {anime.genre.map(g => (
                <Badge 
                  key={g} 
                  variant="secondary" 
                  className="rounded-xl px-4 py-1.5 bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer border-transparent text-sm"
                  onClick={() => onQuickFilter('genre', g)}
                >
                  {g}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div 
                className="flex flex-col gap-1 cursor-pointer group"
                onClick={() => onQuickFilter('studio', anime.studio)}
              >
                <span className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Building2 className="size-3.5" />
                  Studio
                </span>
                <span className="font-semibold text-lg group-hover:text-primary transition-colors">{anime.studio}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  {language === 'it' ? 'Data' : 'Date'}
                </span>
                <span className="font-semibold text-lg">
                  {format(parseISO(anime.releaseDate), 'dd MMM yyyy')}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                 <Layers className="size-5" />
                 {language === 'it' ? 'Sinossi' : 'Synopsis'}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {anime.description}
              </p>
            </div>

            {/* Gallery Section with Horizontal Scroll */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xl font-bold">Gallery</h3>
              <ScrollArea className="w-full whitespace-nowrap rounded-3xl">
                <div className="flex gap-4 pb-4">
                  {galleryImages.map((img, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ scale: 1.05 }}
                      className="relative w-64 aspect-video rounded-2xl overflow-hidden cursor-pointer group bg-black/50 border border-white/10 shrink-0"
                      onClick={() => setLightboxIndex(idx)}
                    >
                      <img 
                        src={img} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Maximize2 className="size-6 text-white" />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
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
