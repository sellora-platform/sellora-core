import { 
  Truck, 
  Plus, 
  Trash2, 
  Edit2, 
  Globe, 
  Shield, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Settings2,
  Lock,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

const COUNTRIES_LIST = [
  { code: "PK", name: "Pakistan" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "all", name: "Rest of World (Global)" }
];

export default function Shipping() {
  const utils = trpc.useUtils();
  
  // 1. Get Store ID
  const { data: myStores, isLoading: isLoadingStore } = trpc.stores.getMyStores.useQuery();
  const activeStoreId = myStores?.[0]?.id || 0;

  // 2. Fetch Zones & Carrier Settings
  const { data: zones, isLoading: isLoadingZones } = trpc.shipping.listZones.useQuery(
    { storeId: activeStoreId },
    { enabled: !!activeStoreId }
  );

  const { data: carrierSettings, isLoading: isLoadingCarriers } = trpc.shipping.getCarrierSettings.useQuery(
    { storeId: activeStoreId },
    { enabled: !!activeStoreId }
  );

  // 3. Mutation hooks
  const createZone = trpc.shipping.createZone.useMutation({
    onSuccess: () => {
      toast.success("Shipping zone created!");
      setShowZoneModal(false);
      utils.shipping.listZones.invalidate();
    },
    onError: (err) => toast.error(err.message)
  });

  const updateZone = trpc.shipping.updateZone.useMutation({
    onSuccess: () => {
      toast.success("Shipping zone updated!");
      setShowZoneModal(false);
      utils.shipping.listZones.invalidate();
    },
    onError: (err) => toast.error(err.message)
  });

  const deleteZone = trpc.shipping.deleteZone.useMutation({
    onSuccess: () => {
      toast.success("Shipping zone deleted!");
      utils.shipping.listZones.invalidate();
    },
    onError: (err) => toast.error(err.message)
  });

  const createRate = trpc.shipping.createRate.useMutation({
    onSuccess: () => {
      toast.success("Shipping rate created!");
      setShowRateModal(false);
      utils.shipping.listZones.invalidate();
    },
    onError: (err) => toast.error(err.message)
  });

  const updateRate = trpc.shipping.updateRate.useMutation({
    onSuccess: () => {
      toast.success("Shipping rate updated!");
      setShowRateModal(false);
      utils.shipping.listZones.invalidate();
    },
    onError: (err) => toast.error(err.message)
  });

  const deleteRate = trpc.shipping.deleteRate.useMutation({
    onSuccess: () => {
      toast.success("Shipping rate deleted!");
      utils.shipping.listZones.invalidate();
    },
    onError: (err) => toast.error(err.message)
  });

  const updateCarrier = trpc.shipping.updateCarrierSettings.useMutation({
    onSuccess: () => {
      toast.success("Carrier settings updated!");
      utils.shipping.getCarrierSettings.invalidate();
    },
    onError: (err) => toast.error(err.message)
  });

  // 4. Component States
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [zoneForm, setZoneForm] = useState({ name: "", countries: [] as string[] });

  const [showRateModal, setShowRateModal] = useState(false);
  const [editingRate, setEditingRate] = useState<any>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [rateForm, setRateForm] = useState({
    name: "",
    type: "flat", // flat | weight_based | price_based
    price: 0,
    minLimit: "" as string | number,
    maxLimit: "" as string | number
  });

  // Carrier Integration Local Settings
  const [carrierForms, setCarrierForms] = useState<Record<string, { apiKey: string; apiSecret: string; isEnabled: boolean }>>({
    easypost: { apiKey: "", apiSecret: "", isEnabled: false },
    shipstation: { apiKey: "", apiSecret: "", isEnabled: false },
    leopard: { apiKey: "", apiSecret: "", isEnabled: false },
    tcs: { apiKey: "", apiSecret: "", isEnabled: false }
  });

  // Sync carrier settings from DB when loaded
  useState(() => {
    if (carrierSettings) {
      const updated = { ...carrierForms };
      carrierSettings.forEach((c) => {
        if (updated[c.carrier]) {
          updated[c.carrier] = {
            apiKey: c.apiKey || "",
            apiSecret: c.apiSecret || "",
            isEnabled: c.isEnabled
          };
        }
      });
      setCarrierForms(updated);
    }
  });

  // Direct effect for mapping incoming carrier data
  const syncCarriers = () => {
    if (carrierSettings) {
      const updated = { ...carrierForms };
      carrierSettings.forEach((c) => {
        if (updated[c.carrier]) {
          updated[c.carrier] = {
            apiKey: c.apiKey || "",
            apiSecret: c.apiSecret || "",
            isEnabled: c.isEnabled
          };
        }
      });
      setCarrierForms(updated);
    }
  };

  const handleOpenZone = (zone: any = null) => {
    if (zone) {
      setEditingZone(zone);
      setZoneForm({ name: zone.name, countries: zone.countries || [] });
    } else {
      setEditingZone(null);
      setZoneForm({ name: "", countries: [] });
    }
    setShowZoneModal(true);
  };

  const handleZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingZone) {
      updateZone.mutate({
        zoneId: editingZone.id,
        storeId: activeStoreId,
        name: zoneForm.name,
        countries: zoneForm.countries
      });
    } else {
      createZone.mutate({
        storeId: activeStoreId,
        name: zoneForm.name,
        countries: zoneForm.countries
      });
    }
  };

  const handleOpenRate = (zoneId: number, rate: any = null) => {
    setSelectedZoneId(zoneId);
    if (rate) {
      setEditingRate(rate);
      setRateForm({
        name: rate.name,
        type: rate.type,
        price: parseFloat(rate.price) || 0,
        minLimit: rate.minLimit !== null ? rate.minLimit : "",
        maxLimit: rate.maxLimit !== null ? rate.maxLimit : ""
      });
    } else {
      setEditingRate(null);
      setRateForm({
        name: "",
        type: "flat",
        price: 0,
        minLimit: "",
        maxLimit: ""
      });
    }
    setShowRateModal(true);
  };

  const handleRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = rateForm.minLimit === "" ? null : Number(rateForm.minLimit);
    const maxVal = rateForm.maxLimit === "" ? null : Number(rateForm.maxLimit);

    if (editingRate) {
      updateRate.mutate({
        rateId: editingRate.id,
        name: rateForm.name,
        type: rateForm.type,
        price: rateForm.price,
        minLimit: minVal,
        maxLimit: maxVal
      });
    } else {
      if (selectedZoneId === null) return;
      createRate.mutate({
        zoneId: selectedZoneId,
        name: rateForm.name,
        type: rateForm.type,
        price: rateForm.price,
        minLimit: minVal,
        maxLimit: maxVal
      });
    }
  };

  const handleSaveCarrier = (carrier: string) => {
    const creds = carrierForms[carrier];
    if (!creds) return;
    updateCarrier.mutate({
      storeId: activeStoreId,
      carrier,
      apiKey: creds.apiKey,
      apiSecret: creds.apiSecret,
      isEnabled: creds.isEnabled
    });
  };

  const toggleCountry = (code: string) => {
    const list = [...zoneForm.countries];
    if (list.includes(code)) {
      setZoneForm({ ...zoneForm, countries: list.filter((c) => c !== code) });
    } else {
      setZoneForm({ ...zoneForm, countries: [...list, code] });
    }
  };

  const getCountryName = (code: string) => {
    return COUNTRIES_LIST.find(c => c.code === code)?.name || code;
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Truck className="w-8 h-8 text-primary" />
              Shipping Management
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Configure shipping zones, define flat and weight-based rate engines, or integrate third-party courier services.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Rate Engine Active</span>
          </div>
        </div>

        <Tabs defaultValue="zones" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="zones">Shipping Zones & Rates</TabsTrigger>
            <TabsTrigger value="carriers" onClick={syncCarriers}>Carrier Platforms</TabsTrigger>
          </TabsList>

          {/* Zones & Rates Tab */}
          <TabsContent value="zones" className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Configured Shipping Zones</h2>
              <Button onClick={() => handleOpenZone()} className="font-semibold shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Shipping Zone
              </Button>
            </div>

            {isLoadingZones ? (
              <div className="py-20 text-center text-muted-foreground">Loading shipping zones...</div>
            ) : zones?.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2 bg-muted/20">
                <Globe className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-bold">No Shipping Zones Yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
                  Create a zone to start accepting orders from specific countries or globally.
                </p>
                <Button onClick={() => handleOpenZone()} className="mt-6" variant="outline">
                  Create your first zone
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {zones?.map((zone) => (
                  <Card key={zone.id} className="border-border/50 shadow-sm overflow-hidden">
                    <div className="bg-muted/30 border-b border-border/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg">{zone.name}</h3>
                          <Badge variant="secondary" className="bg-background">
                            {zone.countries.length} Country/Regions
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Applies to: {zone.countries.map(c => getCountryName(c)).join(", ")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="font-medium"
                          onClick={() => handleOpenZone(zone)}
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit Zone
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="font-medium text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this zone and all its rates?")) {
                              deleteZone.mutate({ zoneId: zone.id, storeId: activeStoreId });
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                        </Button>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground/80">Shipping Rates</h4>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs font-semibold"
                          onClick={() => handleOpenRate(zone.id)}
                        >
                          <Plus className="w-3 h-3 mr-1.5" /> Add Rate
                        </Button>
                      </div>

                      {zone.rates.length === 0 ? (
                        <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg">
                          No rates defined for this zone. Customers will not be able to checkout in these locations.
                        </div>
                      ) : (
                        <div className="border border-border/40 rounded-xl overflow-hidden divide-y divide-border/40">
                          {zone.rates.map((rate: any) => (
                            <div key={rate.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                              <div className="space-y-1">
                                <div className="font-semibold text-sm flex items-center gap-2">
                                  {rate.name}
                                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 capitalize font-semibold">
                                    {rate.type.replace("_", " ")}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {rate.type === "weight_based" && (
                                    <>Weight range: {rate.minLimit || "0"}kg - {rate.maxLimit ? `${rate.maxLimit}kg` : "Unlimited"}</>
                                  )}
                                  {rate.type === "price_based" && (
                                    <>Order value range: {rate.minLimit || "0"} - {rate.maxLimit ? `${rate.maxLimit}` : "Unlimited"}</>
                                  )}
                                  {rate.type === "flat" && <>Flat shipping cost</>}
                                </div>
                              </div>

                              <div className="flex items-center gap-6">
                                <div className="font-bold text-sm">
                                  PKR {parseFloat(rate.price).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="w-8 h-8"
                                    onClick={() => handleOpenRate(zone.id, rate)}
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="w-8 h-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                      if (confirm("Delete this shipping rate?")) {
                                        deleteRate.mutate({ rateId: rate.id });
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Carrier Platforms Tab */}
          <TabsContent value="carriers" className="space-y-6 pt-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Third-Party Courier & Shipping Platforms</h2>
              <p className="text-sm text-muted-foreground max-w-3xl">
                Enable direct integrations with courier companies to calculate carrier-calculated shipping rates, generate shipping labels automatically, and sync tracking details.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* TCS Courier */}
              <Card className="p-6 border-border/50 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">TCS Express</h3>
                      <Badge variant={carrierForms.tcs.isEnabled ? "default" : "secondary"} className="mt-1">
                        {carrierForms.tcs.isEnabled ? "Active Integration" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <Switch 
                    checked={carrierForms.tcs.isEnabled} 
                    onCheckedChange={(checked) => {
                      setCarrierForms({
                        ...carrierForms,
                        tcs: { ...carrierForms.tcs, isEnabled: checked }
                      });
                    }}
                  />
                </div>
                
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  Calculate real-time delivery costs across Pakistan using official TCS Overnight shipping profiles.
                </p>

                {carrierForms.tcs.isEnabled && (
                  <div className="mt-6 space-y-4 border-t pt-4 border-dashed border-border/60 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">TCS API Key</Label>
                      <Input 
                        placeholder="TCS_API_KEY_xxxxxxxx" 
                        type="password"
                        value={carrierForms.tcs.apiKey}
                        onChange={(e) => {
                          setCarrierForms({
                            ...carrierForms,
                            tcs: { ...carrierForms.tcs, apiKey: e.target.value }
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">API Client ID / Secret</Label>
                      <Input 
                        placeholder="Client ID" 
                        type="password"
                        value={carrierForms.tcs.apiSecret}
                        onChange={(e) => {
                          setCarrierForms({
                            ...carrierForms,
                            tcs: { ...carrierForms.tcs, apiSecret: e.target.value }
                          });
                        }}
                      />
                    </div>
                    <Button 
                      className="w-full mt-2 font-bold"
                      onClick={() => handleSaveCarrier("tcs")}
                      disabled={updateCarrier.isPending}
                    >
                      Save TCS Credentials
                    </Button>
                  </div>
                )}
              </Card>

              {/* Leopards Courier */}
              <Card className="p-6 border-border/50 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Leopards Courier</h3>
                      <Badge variant={carrierForms.leopard.isEnabled ? "default" : "secondary"} className="mt-1">
                        {carrierForms.leopard.isEnabled ? "Active Integration" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <Switch 
                    checked={carrierForms.leopard.isEnabled} 
                    onCheckedChange={(checked) => {
                      setCarrierForms({
                        ...carrierForms,
                        leopard: { ...carrierForms.leopard, isEnabled: checked }
                      });
                    }}
                  />
                </div>
                
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  Integrate Leopards COD Courier APIs to automate delivery tracking and dispatch generation directly.
                </p>

                {carrierForms.leopard.isEnabled && (
                  <div className="mt-6 space-y-4 border-t pt-4 border-dashed border-border/60 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">API Key / Token</Label>
                      <Input 
                        placeholder="Leopards_API_Token_xxxxxxxx" 
                        type="password"
                        value={carrierForms.leopard.apiKey}
                        onChange={(e) => {
                          setCarrierForms({
                            ...carrierForms,
                            leopard: { ...carrierForms.leopard, apiKey: e.target.value }
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Account Password</Label>
                      <Input 
                        placeholder="Leopards COD Password" 
                        type="password"
                        value={carrierForms.leopard.apiSecret}
                        onChange={(e) => {
                          setCarrierForms({
                            ...carrierForms,
                            leopard: { ...carrierForms.leopard, apiSecret: e.target.value }
                          });
                        }}
                      />
                    </div>
                    <Button 
                      className="w-full mt-2 font-bold"
                      onClick={() => handleSaveCarrier("leopard")}
                      disabled={updateCarrier.isPending}
                    >
                      Save Leopards Credentials
                    </Button>
                  </div>
                )}
              </Card>

              {/* EasyPost (Global) */}
              <Card className="p-6 border-border/50 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">EasyPost (Global Carriers)</h3>
                      <Badge variant={carrierForms.easypost.isEnabled ? "default" : "secondary"} className="mt-1">
                        {carrierForms.easypost.isEnabled ? "Active Integration" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <Switch 
                    checked={carrierForms.easypost.isEnabled} 
                    onCheckedChange={(checked) => {
                      setCarrierForms({
                        ...carrierForms,
                        easypost: { ...carrierForms.easypost, isEnabled: checked }
                      });
                    }}
                  />
                </div>
                
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  Support international carrier calculations like DHL, FedEx, UPS, and USPS using a unified EasyPost API.
                </p>

                {carrierForms.easypost.isEnabled && (
                  <div className="mt-6 space-y-4 border-t pt-4 border-dashed border-border/60 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">EasyPost API Key</Label>
                      <Input 
                        placeholder="EZPK_xxxxxxxxxxxxxxxx" 
                        type="password"
                        value={carrierForms.easypost.apiKey}
                        onChange={(e) => {
                          setCarrierForms({
                            ...carrierForms,
                            easypost: { ...carrierForms.easypost, apiKey: e.target.value }
                          });
                        }}
                      />
                    </div>
                    <Button 
                      className="w-full mt-2 font-bold"
                      onClick={() => handleSaveCarrier("easypost")}
                      disabled={updateCarrier.isPending}
                    >
                      Save EasyPost Credentials
                    </Button>
                  </div>
                )}
              </Card>

              {/* ShipStation */}
              <Card className="p-6 border-border/50 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-violet-600 rounded-2xl text-white shadow-lg">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">ShipStation</h3>
                      <Badge variant={carrierForms.shipstation.isEnabled ? "default" : "secondary"} className="mt-1">
                        {carrierForms.shipstation.isEnabled ? "Active Integration" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <Switch 
                    checked={carrierForms.shipstation.isEnabled} 
                    onCheckedChange={(checked) => {
                      setCarrierForms({
                        ...carrierForms,
                        shipstation: { ...carrierForms.shipstation, isEnabled: checked }
                      });
                    }}
                  />
                </div>
                
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  Automate full checkout orders processing, generate domestic shipping labels, and sync tracking details.
                </p>

                {carrierForms.shipstation.isEnabled && (
                  <div className="mt-6 space-y-4 border-t pt-4 border-dashed border-border/60 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">API Key</Label>
                      <Input 
                        placeholder="ShipStation API Key" 
                        type="password"
                        value={carrierForms.shipstation.apiKey}
                        onChange={(e) => {
                          setCarrierForms({
                            ...carrierForms,
                            shipstation: { ...carrierForms.shipstation, apiKey: e.target.value }
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">API Secret</Label>
                      <Input 
                        placeholder="ShipStation API Secret" 
                        type="password"
                        value={carrierForms.shipstation.apiSecret}
                        onChange={(e) => {
                          setCarrierForms({
                            ...carrierForms,
                            shipstation: { ...carrierForms.shipstation, apiSecret: e.target.value }
                          });
                        }}
                      />
                    </div>
                    <Button 
                      className="w-full mt-2 font-bold"
                      onClick={() => handleSaveCarrier("shipstation")}
                      disabled={updateCarrier.isPending}
                    >
                      Save ShipStation Credentials
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Banner */}
        <Card className="bg-muted/30 border-dashed p-6 border-2">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-background border shadow-sm">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold flex items-center gap-2">
                Secure API Token Encryption <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              </h4>
              <p className="text-sm text-muted-foreground">
                All credentials, API Keys, and partner tokens are stored using military-grade AES-256 encryption. Sellora never transmits raw developer credentials directly during runtime calculation request cycles.
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Action */}
        <div className="flex items-center justify-center pt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium group cursor-pointer hover:text-primary transition-colors">
            View Live Calculator API Logs <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Shipping Zone Modal Dialog */}
        <Dialog open={showZoneModal} onOpenChange={setShowZoneModal}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingZone ? "Edit Shipping Zone" : "Create Shipping Zone"}
              </DialogTitle>
              <DialogDescription>
                Group countries together to apply specific shipping rate parameters.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleZoneSubmit} className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="zoneName">Zone Name</Label>
                  <Input 
                    id="zoneName"
                    placeholder="e.g., Domestic, North America" 
                    required 
                    value={zoneForm.name}
                    onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Countries / Regions in this Zone</Label>
                  <div className="border rounded-xl p-4 max-h-[180px] overflow-y-auto divide-y divide-border/40">
                    {COUNTRIES_LIST.map((country) => (
                      <div key={country.code} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                        <span className="text-sm font-medium">{country.name}</span>
                        <Switch 
                          checked={zoneForm.countries.includes(country.code)}
                          onCheckedChange={() => toggleCountry(country.code)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full font-bold">
                  {createZone.isPending || updateZone.isPending ? "Saving..." : "Save Zone"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Shipping Rate Modal Dialog */}
        <Dialog open={showRateModal} onOpenChange={setShowRateModal}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingRate ? "Edit Shipping Rate" : "Add Shipping Rate"}
              </DialogTitle>
              <DialogDescription>
                Define calculation thresholds and flat/dynamic rates for customers in this zone.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRateSubmit} className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rateName">Rate Name</Label>
                  <Input 
                    id="rateName"
                    placeholder="e.g., Standard Delivery, Express Shipping" 
                    required 
                    value={rateForm.name}
                    onChange={(e) => setRateForm({ ...rateForm, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rateType">Calculation Rule Type</Label>
                  <Select 
                    value={rateForm.type} 
                    onValueChange={(val) => setRateForm({ ...rateForm, type: val })}
                  >
                    <SelectTrigger id="rateType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat Shipping Rate</SelectItem>
                      <SelectItem value="weight_based">Weight-based Shipping Rule</SelectItem>
                      <SelectItem value="price_based">Cart Price-based Shipping Rule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ratePrice">Price (PKR / USD)</Label>
                  <Input 
                    id="ratePrice"
                    type="number"
                    min="0"
                    placeholder="e.g. 150" 
                    required 
                    value={rateForm.price}
                    onChange={(e) => setRateForm({ ...rateForm, price: Number(e.target.value) })}
                  />
                </div>

                {rateForm.type !== "flat" && (
                  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                      <Label htmlFor="minLimit">
                        {rateForm.type === "weight_based" ? "Min Weight (kg)" : "Min Price"}
                      </Label>
                      <Input 
                        id="minLimit"
                        type="number"
                        min="0"
                        placeholder="0" 
                        value={rateForm.minLimit}
                        onChange={(e) => setRateForm({ ...rateForm, minLimit: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxLimit">
                        {rateForm.type === "weight_based" ? "Max Weight (kg)" : "Max Price"}
                      </Label>
                      <Input 
                        id="maxLimit"
                        type="number"
                        min="0"
                        placeholder="Unlimited" 
                        value={rateForm.maxLimit}
                        onChange={(e) => setRateForm({ ...rateForm, maxLimit: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="submit" className="w-full font-bold">
                  {createRate.isPending || updateRate.isPending ? "Saving..." : "Save Rate"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
