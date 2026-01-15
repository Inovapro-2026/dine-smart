import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ADMIN_CODE = '1285041';

export default function AdminLogin() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (code === ADMIN_CODE) {
        localStorage.setItem('inovafood-admin', 'true');
        navigate('/admin/dashboard');
        toast.success('Bem-vindo ao INOVAPRO RESTAURANTES!');
      } else {
        toast.error('Código inválido');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-20 hero-gradient rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Store className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Painel Administrativo</CardTitle>
          <p className="text-muted-foreground">Digite o código de acesso</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Código de acesso"
                className="pl-10 text-center text-2xl tracking-widest"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={7}
              />
            </div>
            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
