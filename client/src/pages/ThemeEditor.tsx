import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  Settings2, 
  Layout, 
  Palette, 
  Type, 
  Eye, 
  Monitor, 
  Smartphone,
  Trash2,
  GripVertical
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function ThemeEditor() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"sections" | "theme">("sections");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);

  // Fetch primary store
  const storeQuery = trpc.stores.getMyStore.useQuery();
  const store = storeQuery.data;

  // Fetch theme
  const themeQuery = trpc.themes.getMyTheme.useQuery(
    { storeId: store?.id || 0 },
    { enabled: !!store?.id }
  );

  const [localSections, setLocalSections] = useState<any[]>([]);
  const theme = themeQuery.data;

  useEffect(() => {
    if (theme?.sections) {
      setLocalSections(theme.sections as any[]);
    }
  }, [theme]);

  // Real-time Preview Sync
  useEffect(() => {
    const iframe = document.getElementById("theme-preview-iframe") as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ 
        type: "THEME_UPDATE", 
        sections: localSections 
      }, "*");
    }
  }, [localSections]);

  const updateThemeMutation = trpc.themes.update.useMutation({
    onSuccess: () => {
      toast.success("Theme saved successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save theme");
    }
  });

  const handleSave = () => {
    if (!theme) return;
    updateThemeMutation.mutate({
      themeId: theme.id,
      sections: localSections,
    });
  };

  const handleUpdateSectionSetting = (index: number, key: string, value: any) => {
    const updated = [...localSections];
    updated[index].settings[key] = value;
    setLocalSections(updated);
  };

  const addSection = (type: string) => {
    const defaultSettings: Record<string, any> = {
      hero: { heading: "New Hero Section", subheading: "Click to edit this text", alignment: "center" },
      featured_collection: { title: "New Collection", columns: 4, productLimit: 8 },
    };

    setLocalSections([...localSections, { type, settings: defaultSettings[type] || {} }]);
    setSelectedSectionIndex(localSections.length);
  };

  const removeSection = (index: number) => {
    const updated = [...localSections];
    updated.splice(index, 1);
    setLocalSections(updated);
    setSelectedSectionIndex(null);
  };

  if (storeQuery.isLoading || themeQuery.isLoading) {
    return <div className="flex items-center justify-center h-screen bg-background">Loading Editor...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Editor Header */}
      <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
          <div className="h-6 w-px bg-border/50" />
          <h1 className="font-bold text-foreground">Theme Editor — {store?.name}</h1>
        </div>

        <div className="flex items-center gap-2 bg-accent/5 p-1 rounded-lg border border-border/30">
          <Button 
            variant={device === "desktop" ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setDevice("desktop")}
            className="h-8 w-10 p-0"
          >
            <Monitor className="w-4 h-4" />
          </Button>
          <Button 
            variant={device === "mobile" ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setDevice("mobile")}
            className="h-8 w-10 p-0"
          >
            <Smartphone className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button size="sm" className="gap-2 bg-primary font-bold px-6" onClick={handleSave}>
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-80 border-r border-border/50 flex flex-col bg-card/30">
          <div className="flex border-b border-border/50">
            <button 
              onClick={() => { setActiveTab("sections"); setSelectedSectionIndex(null); }}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "sections" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-foreground/40 hover:text-foreground"}`}
            >
              Sections
            </button>
            <button 
              onClick={() => setActiveTab("theme")}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "theme" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-foreground/40 hover:text-foreground"}`}
            >
              Theme Settings
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === "sections" ? (
              <>
                {selectedSectionIndex === null ? (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-foreground/40 uppercase mb-4 block">Storefront Sections</Label>
                    {localSections.map((section, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedSectionIndex(idx)}
                        className="group flex items-center justify-between p-4 rounded-xl border border-border/30 bg-card/50 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Layout className="w-4 h-4 text-foreground/40 group-hover:text-primary" />
                          <span className="text-sm font-semibold capitalize">{section.type.replace("_", " ")}</span>
                        </div>
                        <GripVertical className="w-4 h-4 text-foreground/20" />
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full h-12 border-dashed border-primary/30 text-primary hover:bg-primary/5 gap-2 mt-4"
                      onClick={() => addSection("hero")}
                    >
                      <Plus className="w-4 h-4" />
                      Add Hero Section
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 border-dashed border-primary/30 text-primary hover:bg-primary/5 gap-2"
                      onClick={() => addSection("featured_collection")}
                    >
                      <Plus className="w-4 h-4" />
                      Add Products Grid
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedSectionIndex(null)}
                      className="mb-2 -ml-2"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back to Sections
                    </Button>
                    
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-lg capitalize">{localSections[selectedSectionIndex].type.replace("_", " ")}</h2>
                      <Button variant="ghost" size="sm" onClick={() => removeSection(selectedSectionIndex)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Dynamic Inputs based on section type */}
                    {localSections[selectedSectionIndex].type === "hero" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Main Heading</Label>
                          <Input 
                            value={localSections[selectedSectionIndex].settings.heading} 
                            onChange={(e) => handleUpdateSectionSetting(selectedSectionIndex, "heading", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Subheading</Label>
                          <Input 
                            value={localSections[selectedSectionIndex].settings.subheading} 
                            onChange={(e) => handleUpdateSectionSetting(selectedSectionIndex, "subheading", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Alignment</Label>
                          <select 
                            className="w-full p-2 rounded-lg border border-border/50 bg-background"
                            value={localSections[selectedSectionIndex].settings.alignment}
                            onChange={(e) => handleUpdateSectionSetting(selectedSectionIndex, "alignment", e.target.value)}
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {localSections[selectedSectionIndex].type === "featured_collection" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Collection Title</Label>
                          <Input 
                            value={localSections[selectedSectionIndex].settings.title} 
                            onChange={(e) => handleUpdateSectionSetting(selectedSectionIndex, "title", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Columns</Label>
                          <select 
                             className="w-full p-2 rounded-lg border border-border/50 bg-background"
                             value={localSections[selectedSectionIndex].settings.columns}
                             onChange={(e) => handleUpdateSectionSetting(selectedSectionIndex, "columns", parseInt(e.target.value))}
                          >
                            <option value="2">2 Columns</option>
                            <option value="3">3 Columns</option>
                            <option value="4">4 Columns</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-border/30 bg-card/50 flex items-center gap-3">
                  <Palette className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-bold">Colors</p>
                    <p className="text-xs text-foreground/50">Modify your brand colors</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-border/30 bg-card/50 flex items-center gap-3">
                  <Type className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-bold">Typography</p>
                    <p className="text-xs text-foreground/50">Change fonts and text styles</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Preview Area */}
        <main className="flex-1 bg-accent/5 p-8 flex items-center justify-center relative overflow-hidden">
          <div 
            className={`bg-white shadow-2xl transition-all duration-500 overflow-hidden border border-border/50 ${device === "desktop" ? "w-full h-full rounded-none" : "w-[375px] h-[667px] rounded-[40px] border-[12px] border-foreground"}`}
          >
            {/* The Storefront Preview Iframe */}
            <iframe 
              src={`/store/${store?.slug}?preview=true`} 
              className="w-full h-full pointer-events-none"
              title="Storefront Preview"
              id="theme-preview-iframe"
            />
          </div>
          
          {/* Editor Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </main>
      </div>
    </div>
  );
}
