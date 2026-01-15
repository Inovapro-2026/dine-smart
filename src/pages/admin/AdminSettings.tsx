import { useState, useEffect } from 'react';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Store, 
  Image, 
  Clock, 
  DollarSign,
  Save,
  Upload,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface OpeningHours {
  [key: string]: { open: string; close: string };
}

const DAYS = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

const DEFAULT_HOURS: OpeningHours = {
  monday: { open: '08:00', close: '22:00' },
  tuesday: { open: '08:00', close: '22:00' },
  wednesday: { open: '08:00', close: '22:00' },
  thursday: { open: '08:00', close: '22:00' },
  friday: { open: '08:00', close: '22:00' },
  saturday: { open: '08:00', close: '22:00' },
  sunday: { open: '08:00', close: '22:00' },
};

export default function AdminSettings() {
  const { settings: dbSettings, isLoading: isLoadingSettings, updateSettings, isSaving } = useStoreSettings();

  const [storeName, setStoreName] = useState('INOVAFOOD');
  const [storeLink, setStoreLink] = useState('inovafood');
  const [address, setAddress] = useState('Rua Principal, 123 - Centro');
  const [phone, setPhone] = useState('(11) 99999-9999');
  const [deliveryFee, setDeliveryFee] = useState('5.00');
  const [minOrderValue, setMinOrderValue] = useState('20.00');
  const [openingHours, setOpeningHours] = useState<OpeningHours>(DEFAULT_HOURS);
  const [useSimpleHours, setUseSimpleHours] = useState(true);
  const [simpleOpen, setSimpleOpen] = useState('08:00');
  const [simpleClose, setSimpleClose] = useState('22:00');

  // Sync with database settings
  useEffect(() => {
    if (!isLoadingSettings && dbSettings) {
      setDeliveryFee(dbSettings.delivery_fee?.toString() ?? '5.00');
      setMinOrderValue(dbSettings.min_order_value?.toString() ?? '20.00');
      
      // Load opening hours from DB if available
      const storedHours = (dbSettings as any).opening_hours;
      if (storedHours && typeof storedHours === 'object') {
        setOpeningHours(storedHours);
        
        // Check if all days have same hours (simple mode)
        const firstDay = storedHours.monday;
        const allSame = DAYS.every(d => 
          storedHours[d.key]?.open === firstDay?.open && 
          storedHours[d.key]?.close === firstDay?.close
        );
        
        if (allSame && firstDay) {
          setUseSimpleHours(true);
          setSimpleOpen(firstDay.open);
          setSimpleClose(firstDay.close);
        } else {
          setUseSimpleHours(false);
        }
      }
    }
  }, [dbSettings, isLoadingSettings]);

  const handleHoursChange = (day: string, field: 'open' | 'close', value: string) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSimpleHoursChange = (field: 'open' | 'close', value: string) => {
    if (field === 'open') setSimpleOpen(value);
    else setSimpleClose(value);
    
    // Update all days
    const newHours: OpeningHours = {};
    DAYS.forEach(d => {
      newHours[d.key] = {
        open: field === 'open' ? value : simpleOpen,
        close: field === 'close' ? value : simpleClose,
      };
    });
    setOpeningHours(newHours);
  };

  const handleSave = async () => {
    // Build final opening hours
    let finalHours = openingHours;
    if (useSimpleHours) {
      finalHours = {};
      DAYS.forEach(d => {
        finalHours[d.key] = { open: simpleOpen, close: simpleClose };
      });
    }

    await updateSettings({
      delivery_fee: parseFloat(deliveryFee) || 0,
      min_order_value: parseFloat(minOrderValue) || 0,
      opening_hours: finalHours as any,
    });
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
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
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
                  value={storeLink}
                  onChange={(e) => setStoreLink(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs sm:text-sm">Endereço</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs sm:text-sm">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  Horário de Funcionamento
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Define quando a loja está aberta (usado pelo bot do WhatsApp)
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="simpleMode" className="text-xs text-muted-foreground">
                  Mesmo horário todos os dias
                </Label>
                <Switch 
                  id="simpleMode" 
                  checked={useSimpleHours} 
                  onCheckedChange={setUseSimpleHours}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {useSimpleHours ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="simpleOpen" className="text-xs sm:text-sm">Abre às</Label>
                  <Input
                    id="simpleOpen"
                    type="time"
                    value={simpleOpen}
                    onChange={(e) => handleSimpleHoursChange('open', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="simpleClose" className="text-xs sm:text-sm">Fecha às</Label>
                  <Input
                    id="simpleClose"
                    type="time"
                    value={simpleClose}
                    onChange={(e) => handleSimpleHoursChange('close', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {DAYS.map(day => (
                  <div key={day.key} className="flex flex-col gap-2 p-3 bg-secondary/50 rounded-lg">
                    <span className="text-xs font-medium">{day.label}</span>
                    <div className="flex gap-2">
                      <Input
                        type="time"
                        value={openingHours[day.key]?.open ?? '08:00'}
                        onChange={(e) => handleHoursChange(day.key, 'open', e.target.value)}
                        className="text-xs h-8"
                      />
                      <Input
                        type="time"
                        value={openingHours[day.key]?.close ?? '22:00'}
                        onChange={(e) => handleHoursChange(day.key, 'close', e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              ℹ️ Esses horários são enviados automaticamente pelo bot do WhatsApp quando o cliente digita "4".
            </p>
          </CardContent>
        </Card>

        {/* Taxas */}
        <Card className="lg:col-span-2">
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
            <div className="grid gap-4 sm:grid-cols-2 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="deliveryFee" className="text-xs sm:text-sm">Taxa de Entrega (R$)</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  step="0.01"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minOrderValue" className="text-xs sm:text-sm">Pedido Mínimo (R$)</Label>
                <Input
                  id="minOrderValue"
                  type="number"
                  step="0.01"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        className="w-full sm:w-auto text-sm sm:text-base" 
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Salvar Configurações
      </Button>
    </div>
  );
}
