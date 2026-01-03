import { useState } from 'react';
import { Anime, useStore } from '@/lib/data';
import { format, parseISO, getYear } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Calendar, Building2, Layers, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  const galleryImages = [anime.coverImage, ...anime.gallery];

  const nextImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % galleryImages.length);
  };

  const prevImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <>
      {/* Header Image */}
      <div className="relative h-64 shrink-0">
        <img 
          src={anime.coverImage} 
          alt={anime.title} 
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <Button 
          size="icon" 
          variant="ghost" 
          className="absolute top-4 right-4 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 text-white"
          onClick={onClose}
        >
          <X className="size-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 flex flex-col gap-6">
          
          <div>
            <Badge 
              variant="outline" 
              className="mb-3 border-secondary/50 text-secondary bg-secondary/10 px-3 py-1 text-sm rounded-lg cursor-pointer hover:bg-secondary/20"
              onClick={() => onQuickFilter('year', getYear(parseISO(anime.releaseDate)).toString())}
            >
              {format(parseISO(anime.releaseDate), 'MMMM yyyy', { locale: language === 'it' ? it : enUS })}
            </Badge>
            <h2 className="text-3xl font-display font-bold text-white leading-tight mb-2">
              {anime.title}
            </h2>
            <div className="flex flex-wrap gap-2 mt-4">
              {anime.genre.map(g => (
                <Badge 
                  key={g} 
                  variant="secondary" 
                  className="rounded-md bg-white/5 hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer border-transparent"
                  onClick={() => onQuickFilter('genre', g)}
                >
                  {g}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div 
              className="flex flex-col gap-1 cursor-pointer group"
              onClick={() => onQuickFilter('studio', anime.studio)}
            >
              <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Building2 className="size-3" />
                Studio
              </span>
              <span className="font-semibold group-hover:text-primary transition-colors">{anime.studio}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Calendar className="size-3" />
                {language === 'it' ? 'Data' : 'Date'}
              </span>
              <span className="font-semibold">
                {format(parseISO(anime.releaseDate), 'dd MMM yyyy')}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
               <Layers className="size-4 text-primary" />
               {language === 'it' ? 'Sinossi' : 'Synopsis'}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {anime.description}
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold">Gallery</h3>
            <div className="grid grid-cols-2 gap-3">
              {galleryImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group bg-black/50 border border-white/10"
                  onClick={() => setLightboxIndex(idx)}
                >
                  <img 
                    src={img} 
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Maximize2 className="size-5 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Lightbox Modal */}
      <Dialog open={lightboxIndex !== null} onOpenChange={() => setLightboxIndex(null)}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] p-0 border-none bg-black/90 backdrop-blur-xl flex items-center justify-center overflow-hidden">
          {lightboxIndex !== null && (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <motion.img 
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={galleryImages[lightboxIndex]} 
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-4 rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
              >
                <ChevronLeft className="size-8" />
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
              >
                <ChevronRight className="size-8" />
              </Button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                {lightboxIndex + 1} / {galleryImages.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
