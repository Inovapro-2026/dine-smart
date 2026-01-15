import { useState } from 'react';
import { InovaProduct, InovaCategory } from '@/types/inovafood';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, ImagePlus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: InovaProduct | null;
  categories: InovaCategory[];
}

export function ProductModal({ isOpen, onClose, product, categories }: ProductModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    category_id: product?.category_id || '',
    image_url: product?.image_url || '',
    is_active: product?.is_active ?? true,
    stock: product?.stock?.toString() || '999',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast.error('Preencha nome e preço');
      return;
    }

    setIsLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category_id: formData.category_id || null,
        image_url: formData.image_url || null,
        is_active: formData.is_active,
        stock: parseInt(formData.stock) || 999,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('inovafood_products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success('Produto atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('inovafood_products')
          .insert([productData]);

        if (error) throw error;
        toast.success('Produto criado com sucesso!');
      }

      queryClient.invalidateQueries({ queryKey: ['inovafood-products'] });
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseInt(numbers) / 100;
    return amount.toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize as informações do produto' : 'Adicione um novo produto ao cardápio'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Imagem Preview */}
          <div className="space-y-2">
            <Label>Imagem do Produto</Label>
            <div className="relative">
              {formData.image_url ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => setFormData({ ...formData, image_url: '' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="aspect-video rounded-xl border-2 border-dashed border-border bg-secondary/50 flex flex-col items-center justify-center gap-2">
                  <ImagePlus className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Cole a URL da imagem abaixo</p>
                </div>
              )}
            </div>
            <Input
              placeholder="https://exemplo.com/imagem.jpg"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              placeholder="Ex: X-Burguer Especial"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva os ingredientes e detalhes do produto..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Preço e Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estoque */}
          <div className="space-y-2">
            <Label htmlFor="stock">Quantidade em Estoque</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              placeholder="999"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
            <div>
              <p className="font-medium">Produto Ativo</p>
              <p className="text-sm text-muted-foreground">
                Produtos inativos não aparecem no cardápio
              </p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                'Salvar Alterações'
              ) : (
                'Criar Produto'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
