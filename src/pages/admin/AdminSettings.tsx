import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Store, 
  Image, 
  Clock, 
  DollarSign,
  Link as LinkIcon,
  Save,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    storeName: 'INOVAFOOD',
    storeLink: 'inovafood',
    address: 'Rua Principal, 123 - Centro',
    phone: '(11) 99999-9999',
    deliveryFee: '5.00',
    minOrderValue: '20.00',
    openingTime: '08:00',
    closingTime: '22:00',
  });

  const handleSave = () => {
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Configure sua loja</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informações da Loja */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Informações da Loja
            </CardTitle>
            <CardDescription>
              Dados exibidos para os clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Nome da Loja</Label>
              <Input
                id="storeName"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeLink">Link da Loja</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-secondary text-muted-foreground text-sm border border-r-0 rounded-l-lg">
                  inovafood.app/
                </span>
                <Input
                  id="storeLink"
                  className="rounded-l-none"
                  value={settings.storeLink}
                  onChange={(e) => setSettings({ ...settings, storeLink: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Imagens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Imagens
            </CardTitle>
            <CardDescription>
              Logo e banner da loja
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-secondary rounded-xl flex items-center justify-center">
                  <Store className="h-8 w-8 text-muted-foreground" />
                </div>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Banner</Label>
              <div className="aspect-[3/1] bg-secondary rounded-xl flex items-center justify-center">
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Banner
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horário de Funcionamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horário de Funcionamento
            </CardTitle>
            <CardDescription>
              Define quando a loja está aberta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openingTime">Abre às</Label>
                <Input
                  id="openingTime"
                  type="time"
                  value={settings.openingTime}
                  onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closingTime">Fecha às</Label>
                <Input
                  id="closingTime"
                  type="time"
                  value={settings.closingTime}
                  onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Horário aplicado para todos os dias da semana
            </p>
          </CardContent>
        </Card>

        {/* Taxas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Valores
            </CardTitle>
            <CardDescription>
              Configure taxas e valores mínimos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryFee">Taxa de Entrega (R$)</Label>
              <Input
                id="deliveryFee"
                type="number"
                step="0.01"
                value={settings.deliveryFee}
                onChange={(e) => setSettings({ ...settings, deliveryFee: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrderValue">Pedido Mínimo (R$)</Label>
              <Input
                id="minOrderValue"
                type="number"
                step="0.01"
                value={settings.minOrderValue}
                onChange={(e) => setSettings({ ...settings, minOrderValue: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button className="w-full sm:w-auto" onClick={handleSave}>
        <Save className="h-4 w-4 mr-2" />
        Salvar Configurações
      </Button>
    </div>
  );
}
