import { useState, useEffect, useRef } from "react";
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
  Layout, 
  Palette, 
  Monitor, 
  Smartphone,
  Trash2,
  GripVertical,
  ChevronDown,
  Layers,
  Settings,
  Eye,
  Undo2,
  Redo2,
  ArrowLeft,
  ChevronRight,
  MoreHorizontal,
  Box,
  MousePointer2,
  Copy,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type Section = {
  id: string;
  type: string;
  settings: Record<string, any>;
  blocks?: Array<{ id: string; type: string; settings: Record<string, any> }>;
};

export default function ThemeEditor() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  
  // Navigation State
  const [activeActivity, setActiveActivity] = useState<"sections" | "settings" | "apps">("sections");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState("Home Page");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  
  // Data State
  const [localSections, setLocalSections] = useState<Section[]>([]);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Queries
  const storeQuery = trpc.stores.getMyStore.useQuery();
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const themeId = parseInt(params.get("themeId") || "0");

  const themeQuery = trpc.themes.getById.useQuery(
    { themeId },
    { enabled: !!themeId }
  );

  // Fallback for old /editor route if no themeId
  const activeThemeQuery = trpc.themes.getByStoreId.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !themeId && !!storeQuery.data?.id }
  );

  const theme = themeId ? themeQuery.data : activeThemeQuery.data;

  useEffect(() => {
    if (theme?.sections) {
      setLocalSections(theme.sections as Section[]);
    }
  }, [theme]);

  // Sync to Preview
  useEffect(() => {
    if (previewRef.current?.contentWindow) {
      previewRef.current.contentWindow.postMessage({ 
        type: "THEME_UPDATE", 
        sections: localSections 
      }, "*");
    }
  }, [localSections]);

  const updateMutation = trpc.themes.update.useMutation({
    onSuccess: () => toast.success("Changes saved!"),
  });

  const handleSave = () => {
    if (!theme) return;
    updateMutation.mutate({
      themeId: theme.id,
      sections: localSections,
    });
  };

  const handleUpdateSection = (id: string, settings: any) => {
    setLocalSections(prev => prev.map(s => s.id === id ? { ...s, settings } : s));
  };

  const addSection = (type: string) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const defaults: any = {
      hero: { heading: "New Banner", subheading: "Best collection ever", alignment: "center" },
      featured_collection: { title: "Featured Products", columns: 4, productLimit: 8 },
    };
    setLocalSections([...localSections, { id: newId, type, settings: defaults[type] || {} }]);
    setSelectedSectionId(newId);
  };

  if (themeQuery.isLoading || activeThemeQuery.isLoading) return <div className="h-screen flex items-center justify-center bg-[#f6f6f7]">Loading Shopify-style Editor...</div>;

  const currentSection = localSections.find(s => s.id === selectedSectionId);

  return (
    <div className="flex flex-col h-screen bg-[#f6f6f7] text-[#303030] font-sans overflow-hidden">
      {/* 1. TOP HEADER (Shopify Style) */}
      <header className="h-14 border-b border-[#d1d1d1] bg-white flex items-center justify-between px-4 z-[100] shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="hover:bg-[#f1f1f1] h-9 w-9 p-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col border-l border-[#d1d1d1] pl-4 ml-2">
            <span className="text-[10px] font-bold text-[#616161] uppercase tracking-wider leading-none mb-1">
              Editing
            </span>
            <span className="text-sm font-bold truncate max-w-[150px]">
              {theme?.name || "Untitled Theme"}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#f1f1f1] px-3 py-1.5 rounded-md cursor-pointer hover:bg-[#e1e1e1] transition-colors border border-[#d1d1d1] ml-4">
            <span className="text-sm font-medium">{selectedPage}</span>
            <ChevronDown className="w-4 h-4 text-[#616161]" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#f1f1f1] p-1 rounded-lg border border-[#d1d1d1] mr-4">
            <button onClick={() => setDevice("desktop")} className={`p-1.5 rounded-md ${device === "desktop" ? "bg-white shadow-sm" : "text-[#616161]"}`}>
              <Monitor className="w-4 h-4" />
            </button>
            <button onClick={() => setDevice("mobile")} className={`p-1.5 rounded-md ${device === "mobile" ? "bg-white shadow-sm" : "text-[#616161]"}`}>
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1 border-r border-[#d1d1d1] pr-3 mr-3">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#616161]"><Undo2 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#616161]"><Redo2 className="w-4 h-4" /></Button>
          </div>
          <Button 
            onClick={handleSave} 
            className="bg-[#008060] hover:bg-[#006e52] text-white font-bold h-9 px-6 rounded-md shadow-sm"
          >
            Save
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 2. ACTIVITY BAR (Narrow Left) */}
        <aside className="w-12 border-r border-[#d1d1d1] bg-white flex flex-col items-center py-4 gap-6">
          <button 
            onClick={() => setActiveActivity("sections")}
            className={`p-2 rounded-md transition-colors ${activeActivity === "sections" ? "bg-[#f1f1f1] text-[#008060]" : "text-[#616161] hover:bg-[#f1f1f1]"}`}
          >
            <Layers className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveActivity("settings")}
            className={`p-2 rounded-md transition-colors ${activeActivity === "settings" ? "bg-[#f1f1f1] text-[#008060]" : "text-[#616161] hover:bg-[#f1f1f1]"}`}
          >
            <Settings className="w-6 h-6" />
          </button>
          <button className="p-2 rounded-md text-[#616161] hover:bg-[#f1f1f1] mt-auto">
            <Box className="w-6 h-6" />
          </button>
        </aside>

        {/* 3. CONFIGURATION PANE (Middle) */}
        <aside className="w-[300px] border-r border-[#d1d1d1] bg-white flex flex-col shadow-sm">
          <div className="h-12 border-b border-[#f1f1f1] flex items-center px-4 font-bold text-sm bg-white sticky top-0 z-10">
            {selectedSectionId ? (
              <button onClick={() => setSelectedSectionId(null)} className="flex items-center gap-2 hover:text-[#008060] transition-colors">
                <ChevronLeft className="w-4 h-4" />
                {currentSection?.type.replace("_", " ").toUpperCase()}
              </button>
            ) : (
              "TEMPLATE"
            )}
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-2">
            {activeActivity === "settings" ? (
              <div className="p-4 space-y-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold text-[#616161] uppercase tracking-widest">Brand Colors</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-[#f1f1f1]">
                      <span className="text-sm">Primary Accent</span>
                      <div className="w-8 h-8 rounded border shadow-sm bg-[#008060]" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-[#f1f1f1]">
                      <span className="text-sm">Background</span>
                      <div className="w-8 h-8 rounded border shadow-sm bg-white" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-[#f1f1f1]">
                      <span className="text-sm">Text Color</span>
                      <div className="w-8 h-8 rounded border shadow-sm bg-[#303030]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t">
                  <Label className="text-[10px] font-bold text-[#616161] uppercase tracking-widest">Typography</Label>
                  <select className="w-full h-10 px-3 rounded-md border border-[#d1d1d1] text-sm bg-white">
                    <option>Inter (Default)</option>
                    <option>Roboto</option>
                    <option>Playfair Display</option>
                    <option>Montserrat</option>
                  </select>
                </div>

                <div className="space-y-4 pt-6 border-t">
                  <Label className="text-[10px] font-bold text-[#616161] uppercase tracking-widest">Buttons</Label>
                  <div className="space-y-2">
                    <Label className="text-xs">Corner Radius</Label>
                    <Input type="range" min="0" max="20" className="accent-[#008060]" />
                  </div>
                </div>
              </div>
            ) : !selectedSectionId ? (
              <div className="space-y-1">
                {/* Header & Footer always pinned */}
                <div className="p-3 rounded-md hover:bg-[#f1f1f1] flex items-center justify-between cursor-pointer group border border-transparent hover:border-[#d1d1d1]">
                  <div className="flex items-center gap-3">
                    <ChevronRight className="w-4 h-4 text-[#616161]" />
                    <span className="text-sm font-medium">Header</span>
                  </div>
                  <Eye className="w-4 h-4 text-[#616161] opacity-0 group-hover:opacity-100" />
                </div>

                <div className="py-4 px-2">
                  <div className="h-px bg-[#f1f1f1] mb-4" />
                  <span className="text-[10px] font-bold text-[#616161] uppercase tracking-wider mb-2 block">Sections</span>
                  
                  {localSections.map((section, idx) => (
                    <div 
                      key={section.id}
                      onClick={() => setSelectedSectionId(section.id)}
                      className="p-3 rounded-md hover:bg-[#f1f1f1] flex items-center justify-between cursor-pointer group border border-transparent hover:border-[#d1d1d1] transition-all mb-1"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-[#c1c1c1]" />
                        <span className="text-sm font-medium capitalize">{section.type.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                        <Eye className="w-4 h-4 text-[#616161]" />
                      </div>
                    </div>
                  ))}

                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-[#008060] hover:bg-[#f1f1f1] text-sm font-semibold h-10 mt-4 border border-dashed border-[#008060]/30"
                    onClick={() => addSection("hero")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>
                </div>

                <div className="p-3 rounded-md hover:bg-[#f1f1f1] flex items-center justify-between cursor-pointer group border border-transparent hover:border-[#d1d1d1] mt-4">
                  <div className="flex items-center gap-3">
                    <ChevronRight className="w-4 h-4 text-[#616161]" />
                    <span className="text-sm font-medium">Footer</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Section Settings View */
              <div className="p-4 space-y-6 animate-in slide-in-from-right-4 duration-200">
                {currentSection?.type === "hero" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-[#616161]">HEADING</Label>
                      <Input 
                        className="h-10 border-[#d1d1d1] focus-visible:ring-[#008060]"
                        value={currentSection.settings.heading} 
                        onChange={(e) => handleUpdateSection(currentSection.id, { ...currentSection.settings, heading: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-[#616161]">SUBHEADING</Label>
                      <Input 
                        className="h-10 border-[#d1d1d1] focus-visible:ring-[#008060]"
                        value={currentSection.settings.subheading} 
                        onChange={(e) => handleUpdateSection(currentSection.id, { ...currentSection.settings, subheading: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-[#616161]">DESKTOP CONTENT ALIGNMENT</Label>
                      <div className="flex gap-1 bg-[#f1f1f1] p-1 rounded-md">
                        {['left', 'center', 'right'].map(align => (
                          <button 
                            key={align}
                            onClick={() => handleUpdateSection(currentSection.id, { ...currentSection.settings, alignment: align })}
                            className={`flex-1 py-1.5 text-xs font-bold capitalize rounded ${currentSection.settings.alignment === align ? 'bg-white shadow-sm' : 'text-[#616161]'}`}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentSection?.type === "featured_collection" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-[#616161]">TITLE</Label>
                      <Input 
                        className="h-10 border-[#d1d1d1]"
                        value={currentSection.settings.title} 
                        onChange={(e) => handleUpdateSection(currentSection.id, { ...currentSection.settings, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-[#616161]">COLUMNS ON DESKTOP</Label>
                      <Input 
                        type="range" min="2" max="4" 
                        value={currentSection.settings.columns}
                        onChange={(e) => handleUpdateSection(currentSection.id, { ...currentSection.settings, columns: parseInt(e.target.value) })}
                        className="accent-[#008060]"
                      />
                      <div className="flex justify-between text-[10px] font-bold text-[#616161]">
                        <span>2</span><span>3</span><span>4</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-[#f1f1f1]">
                  <Button 
                    variant="ghost" 
                    className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 h-10 gap-2"
                    onClick={() => {
                      setLocalSections(prev => prev.filter(s => s.id !== selectedSectionId));
                      setSelectedSectionId(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Section
                  </Button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* 4. CANVAS (Preview) */}
        <main className="flex-1 bg-[#ebebeb] p-6 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4 text-[10px] font-bold text-[#616161] uppercase tracking-widest px-2">
            <span>{selectedPage} Preview</span>
            <span className="flex items-center gap-2"><MousePointer2 className="w-3 h-3" /> Click to select</span>
          </div>
          
          <div 
            className={`bg-white shadow-2xl transition-all duration-500 overflow-hidden relative ${device === "desktop" ? "w-full flex-1" : "w-[375px] h-[667px] my-auto rounded-[32px] border-[8px] border-white shadow-black/10"}`}
          >
            <iframe 
              ref={previewRef}
              src={`/store/${storeQuery.data?.slug}?preview=true`} 
              className="w-full h-full pointer-events-none"
              title="Theme Preview"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
