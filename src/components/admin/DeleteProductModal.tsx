import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

export function DeleteProductModal({ isOpen, onClose, productId, productName }: DeleteProductModalProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('inovafood_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['inovafood-products'] });
      toast.success('Produto excluído com sucesso!');
      onClose();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao excluir produto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Excluir Produto
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20">
          <p className="font-medium text-center">{productName}</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
