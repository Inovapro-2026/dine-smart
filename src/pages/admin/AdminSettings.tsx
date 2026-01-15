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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">Configure sua loja</p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Informações da Loja */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Store className="h-4 w-4 sm:h-5 sm:w-5" />
              Informações da Loja
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Dados exibidos para os clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName" className="text-xs sm:text-sm">Nome da Loja</Label>
              <Input
                id="storeName"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeLink" className="text-xs sm:text-sm">Link da Loja</Label>
              <div className="flex">
                <span className="inline-flex items-center px-2 sm:px-3 bg-secondary text-muted-foreground text-xs sm:text-sm border border-r-0 rounded-l-lg">
                  inovafood.app/
                </span>
                <Input
                  id="storeLink"
                  className="rounded-l-none text-sm"
                  value={settings.storeLink}
                  onChange={(e) => setSettings({ ...settings, storeLink: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs sm:text-sm">Endereço</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs sm:text-sm">Telefone</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Imagens */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Image className="h-4 w-4 sm:h-5 sm:w-5" />
              Imagens
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Logo e banner da loja
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Logo</Label>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-secondary rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                  <Store className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Upload Logo
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Banner</Label>
              <div className="aspect-[3/1] bg-secondary rounded-lg sm:rounded-xl flex items-center justify-center">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Upload Banner
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horário de Funcionamento */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              Horário de Funcionamento
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Define quando a loja está aberta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="openingTime" className="text-xs sm:text-sm">Abre às</Label>
                <Input
                  id="openingTime"
                  type="time"
                  value={settings.openingTime}
                  onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closingTime" className="text-xs sm:text-sm">Fecha às</Label>
                <Input
                  id="closingTime"
                  type="time"
                  value={settings.closingTime}
                  onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">
              Horário aplicado para todos os dias da semana
            </p>
          </CardContent>
        </Card>

        {/* Taxas */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              Valores
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Configure taxas e valores mínimos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryFee" className="text-xs sm:text-sm">Taxa de Entrega (R$)</Label>
              <Input
                id="deliveryFee"
                type="number"
                step="0.01"
                value={settings.deliveryFee}
                onChange={(e) => setSettings({ ...settings, deliveryFee: e.target.value })}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrderValue" className="text-xs sm:text-sm">Pedido Mínimo (R$)</Label>
              <Input
                id="minOrderValue"
                type="number"
                step="0.01"
                value={settings.minOrderValue}
                onChange={(e) => setSettings({ ...settings, minOrderValue: e.target.value })}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button className="w-full sm:w-auto text-sm sm:text-base" onClick={handleSave}>
        <Save className="h-4 w-4 mr-2" />
        Salvar Configurações
      </Button>
    </div>
  );
}
