import { useState, useRef } from 'react';
import { useAdminBanners } from '@/hooks/useBanners';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  GripVertical,
  Plus,
  X,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function AdminBanners() {
  const { banners, isLoading, uploadBanner, isUploading, updateBanner, deleteBanner } = useAdminBanners();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [link, setLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) return;

    await uploadBanner({
      file: selectedFile,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      link: link.trim() || undefined,
    });

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setLink('');
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    await updateBanner({ id, updates: { is_active: !currentState } });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este banner?')) {
      await deleteBanner(id);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Banners Promocionais</h1>
          <p className="text-sm text-muted-foreground">Gerencie os banners da sua loja</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Banner
        </Button>
      </div>

      {/* Banner List */}
      <div className="grid gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="w-48 h-28 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : banners.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum banner cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione banners promocionais para exibir na sua loja
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Banner
              </Button>
            </CardContent>
          </Card>
        ) : (
          banners.map((banner) => (
            <Card key={banner.id} className={cn(!banner.is_active && 'opacity-60')}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Drag handle */}
                  <div className="hidden sm:flex items-center text-muted-foreground cursor-move">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  {/* Banner image */}
                  <div className="w-40 sm:w-48 h-24 sm:h-28 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img 
                      src={banner.image_url} 
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Banner info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-sm text-muted-foreground truncate">{banner.subtitle}</p>
                    )}
                    {banner.link && (
                      <p className="text-xs text-primary truncate mt-1">{banner.link}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={banner.is_active}
                          onCheckedChange={() => handleToggleActive(banner.id, banner.is_active)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {banner.is_active ? (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> Visível
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <EyeOff className="h-3 w-3" /> Oculto
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(banner.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Banner</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Image upload area */}
            <div className="space-y-2">
              <Label>Imagem do Banner</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {previewUrl ? (
                <div className="relative aspect-[3/1] rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[3/1] rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">Clique para fazer upload</span>
                  <span className="text-xs">Recomendado: 1200 x 400px</span>
                </button>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="banner-title">Título *</Label>
              <Input
                id="banner-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Frete Grátis"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="banner-subtitle">Subtítulo</Label>
              <Input
                id="banner-subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex: Em pedidos acima de R$ 50"
              />
            </div>

            {/* Link */}
            <div className="space-y-2">
              <Label htmlFor="banner-link">Link (opcional)</Label>
              <Input
                id="banner-link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Ex: /categoria/promocoes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || !title.trim() || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Adicionar Banner
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
