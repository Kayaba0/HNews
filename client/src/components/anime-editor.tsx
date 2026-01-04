import { useState, useRef, useEffect } from 'react';
import { useStore, Anime } from '@/lib/data';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Save, Trash2, Plus, Image as ImageIcon, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

const animeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  studio: z.string().min(1, "Studio is required"),
  releaseDate: z.string().min(1, "Date is required"),
  description: z.string().optional(),
  genreString: z.string().optional(),
  episodes: z.number().optional().or(z.string().transform(v => v === '' ? undefined : Number(v))),
});

const defaultGenres = [
  'Action', 'Azione',
  'Adventure', 'Avventura',
  'Comedy', 'Commedia',
  'Drama', 'Drammatico',
  'Fantasy', 'Fantasia',
  'Sci-Fi', 'Fantascienza',
  'Horror', 'Orrore',
  'Mystery', 'Mistero',
  'Psychological', 'Psicologico',
  'Romance', 'Romantico',
  'Slice of Life', 'Fetta di vita',
  'Sports', 'Sport',
  'Supernatural', 'Soprannaturale',
  'Thriller', 'Brivido',
  'Mecha', 'Mecha',
  'Military', 'Militare',
  'Music', 'Musica',
  'School', 'Scolastico',
  'Shonen', 'Shonen',
  'Seinen', 'Seinen',
  'Shojo', 'Shojo',
  'Josei', 'Josei',
  'Isekai', 'Isekai',
  'Cyberpunk', 'Cyberpunk'
];

interface AnimeEditorProps {
  anime?: Anime | null;
  onClose: () => void;
}

export function AnimeEditor({ anime, onClose }: AnimeEditorProps) {
  const { animes, addAnime, updateAnime, deleteAnime, language } = useStore();
  const { toast } = useToast();
  
  const [coverPreview, setCoverPreview] = useState<string | null>(anime?.coverImage || null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(anime?.gallery || []);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(anime?.genre || []);
  const [genreInput, setGenreInput] = useState('');
  
  // Combine default genres with existing ones from other animes
  const allExistingGenres = Array.from(new Set([...defaultGenres, ...animes.flatMap(a => a.genre)]));

  const form = useForm<z.infer<typeof animeSchema>>({
    resolver: zodResolver(animeSchema),
    defaultValues: {
      title: anime?.title || '',
      studio: anime?.studio || '',
      releaseDate: anime?.releaseDate || '',
      description: anime?.description || '',
      genreString: '', // No longer used for input but kept for schema compatibility
      episodes: anime?.episodes || undefined,
    }
  });

  const onSubmit = (data: z.infer<typeof animeSchema>) => {
    if (!coverPreview) {
      toast({ title: language === 'it' ? "L'immagine di copertina è obbligatoria" : "Cover image is required", variant: "destructive" });
      return;
    }

    if (selectedGenres.length === 0) {
      toast({ title: language === 'it' ? "Aggiungi almeno un genere" : "Add at least one genre", variant: "destructive" });
      return;
    }

    const animeData: Anime = {
      id: anime?.id || crypto.randomUUID(),
      title: data.title,
      studio: data.studio,
      releaseDate: data.releaseDate,
      description: data.description || '',
      genre: selectedGenres,
      coverImage: coverPreview,
      gallery: galleryPreviews,
      episodes: typeof data.episodes === 'number' ? data.episodes : undefined,
    };

    if (anime) {
      updateAnime(anime.id, animeData);
      toast({ title: language === 'it' ? "Anime aggiornato con successo" : "Anime updated successfully" });
    } else {
      addAnime(animeData);
      toast({ title: language === 'it' ? "Anime aggiunto con successo" : "Anime added successfully" });
    }
    
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'gallery') => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (target === 'cover') {
          setCoverPreview(result);
        } else {
          setGalleryPreviews(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addGenre = (genre: string) => {
    const trimmed = genre.trim();
    if (trimmed && !selectedGenres.includes(trimmed)) {
      setSelectedGenres(prev => [...prev, trimmed]);
    }
    setGenreInput('');
  };

  const removeGenre = (genre: string) => {
    setSelectedGenres(prev => prev.filter(g => g !== genre));
  };

  return (
    <ScrollArea className="max-h-[80vh] px-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cover Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{language === 'it' ? 'Copertina' : 'Cover Image'}</label>
              <div className="relative aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-white/10 bg-black/20 overflow-hidden group hover:border-primary/50 transition-all">
                {coverPreview ? (
                  <>
                    <img src={coverPreview} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                       <Button type="button" variant="destructive" size="sm" onClick={() => setCoverPreview(null)}>
                         <X className="size-4 mr-2" /> {language === 'it' ? 'Rimuovi' : 'Remove'}
                       </Button>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <Upload className="size-8 mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{language === 'it' ? 'Clicca per caricare' : 'Click to upload'}</p>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={(e) => handleImageUpload(e, 'cover')}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Gallery</label>
              <div className="grid grid-cols-2 gap-2">
                {galleryPreviews.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group border border-white/5">
                    <img src={img} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-3 text-white" />
                    </button>
                  </div>
                ))}
                <div className="relative aspect-video rounded-xl border-2 border-dashed border-white/10 bg-black/10 hover:border-primary/50 transition-all flex flex-col items-center justify-center cursor-pointer">
                  <Plus className="size-5 text-muted-foreground" />
                  <span className="text-[10px] mt-1 text-muted-foreground">Add</span>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => handleImageUpload(e, 'gallery')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'it' ? 'Titolo' : 'Title'}</FormLabel>
                  <FormControl>
                    <Input {...field} className="glass-card border-white/5" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="studio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Studio</FormLabel>
                  <FormControl>
                    <Input {...field} className="glass-card border-white/5" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="releaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'it' ? 'Data di uscita' : 'Release Date'}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="glass-card border-white/5 block" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="episodes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'it' ? 'Episodi' : 'Episodes'}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="glass-card border-white/5" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Genre Management */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{language === 'it' ? 'Generi' : 'Genres'}</label>
            <div className="flex flex-wrap gap-2 p-2 min-h-[46px] rounded-xl border border-white/5 bg-black/20">
              {selectedGenres.map(genre => (
                <Badge key={genre} variant="secondary" className="gap-1 px-3 py-1 rounded-lg bg-primary/20 text-primary border-primary/20">
                  {genre}
                  <X className="size-3 cursor-pointer hover:text-white" onClick={() => removeGenre(genre)} />
                </Badge>
              ))}
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2 rounded-lg text-xs border border-dashed border-white/20 hover:border-primary/50">
                    <Plus className="size-3 mr-1" /> {language === 'it' ? 'Aggiungi genere' : 'Add genre'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 glass-panel" align="start">
                  <Command>
                    <CommandInput 
                      placeholder={language === 'it' ? 'Cerca o scrivi...' : 'Search or type...'} 
                      value={genreInput}
                      onValueChange={setGenreInput}
                    />
                    <CommandList>
                      <CommandEmpty className="p-2">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-xs h-8"
                          onClick={() => addGenre(genreInput)}
                        >
                          <Plus className="size-3 mr-2" />
                          {language === 'it' ? `Aggiungi "${genreInput}"` : `Add "${genreInput}"`}
                        </Button>
                      </CommandEmpty>
                      <CommandGroup>
                        {allExistingGenres.filter(g => !selectedGenres.includes(g)).map(genre => (
                          <CommandItem
                            key={genre}
                            value={genre}
                            onSelect={() => addGenre(genre)}
                            className="text-sm"
                          >
                            <Check className={`mr-2 size-4 opacity-0`} />
                            {genre}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{language === 'it' ? 'Descrizione' : 'Description'}</FormLabel>
                <FormControl>
                  <Textarea {...field} className="glass-card border-white/5 min-h-[100px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-4 border-t border-white/5">
             <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-bold h-12 rounded-xl">
               <Save className="mr-2 size-5" /> {anime ? (language === 'it' ? 'Aggiorna' : 'Update') : (language === 'it' ? 'Crea' : 'Create')}
             </Button>
             {anime && (
               <Button 
                type="button" 
                variant="destructive" 
                className="h-12 w-12 rounded-xl p-0"
                onClick={() => {
                  if (confirm(language === 'it' ? 'Sei sicuro?' : 'Are you sure?')) {
                    deleteAnime(anime.id);
                    onClose();
                  }
                }}
              >
                 <Trash2 className="size-5" />
               </Button>
             )}
          </div>
        </form>
      </Form>
    </ScrollArea>
  );
}
