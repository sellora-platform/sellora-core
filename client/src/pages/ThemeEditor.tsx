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
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Box,
  MousePointer2,
  Copy,
  Search,
  Loader2,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { SECTION_SCHEMAS } from "@/storefront/SectionRenderer";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ImagePicker from "@/storefront/sections/ImagePicker";

type Section = {
  id: string;
  type: string;
  settings: Record<string, any>;
  blocks?: Array<{ id: string; type: string; settings: Record<string, any> }>;
};

export default function ThemeEditor() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  
  // Navigation State
  const [activeActivity, setActiveActivity] = useState<"sections" | "settings" | "apps">("sections");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState("Home Page");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data State
  const [templates, setTemplates] = useState<Record<string, Section[]>>({
    index: [],
    product: [],
    cart: [],
    checkout: [],
  });
  const [globalSettings, setGlobalSettings] = useState({
    primaryColor: "#008060",
    backgroundColor: "#ffffff",
    textColor: "#1a1a1a",
    fontFamily: "Inter"
  });
  const [history, setHistory] = useState<Record<string, Section[]>[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Helper to get current template key
  const getPageKey = (page: string) => {
    if (page === "Home Page") return "index";
    return page.toLowerCase();
  };
  const pageKey = getPageKey(selectedPage);
  const localSections = templates[pageKey] || [];

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

  // Initial Load
  useEffect(() => {
    if (theme) {
      if (theme.sections) {
        setTemplates(theme.sections as any);
      }
      
      const colors = theme.colors as any;
      const typography = theme.typography as any;
      
      const newGlobal = {
        primaryColor: colors?.primary || "#008060",
        backgroundColor: colors?.background || "#ffffff",
        textColor: colors?.text || "#1a1a1a",
        fontFamily: typography?.family || "Inter"
      };
      
      setGlobalSettings(newGlobal);
      setHistory([{ 
        templates: theme.sections || templates, 
        globalSettings: newGlobal 
      }]);
      setHistoryIndex(0);
    }
  }, [themeQuery.data]);

  const pushToHistory = (newTemplates: Record<string, Section[]>, newGlobalSettings: typeof globalSettings) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ templates: JSON.parse(JSON.stringify(newTemplates)), globalSettings: JSON.parse(JSON.stringify(newGlobalSettings)) });
    if (newHistory.length > 50) newHistory.shift(); 
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setTemplates(history[newIndex].templates);
      setGlobalSettings(history[newIndex].globalSettings);
      setHistoryIndex(newIndex);
      toast.info("Undo performed", { duration: 1000, icon: <Undo2 className="w-4 h-4" /> });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setTemplates(history[newIndex].templates);
      setGlobalSettings(history[newIndex].globalSettings);
      setHistoryIndex(newIndex);
      toast.info("Redo performed", { duration: 1000, icon: <Redo2 className="w-4 h-4" /> });
    }
  };

  // Sync to Preview
  useEffect(() => {
    if (previewRef.current?.contentWindow) {
      previewRef.current.contentWindow.postMessage({ 
        type: "THEME_UPDATE", 
        sections: localSections,
        selectedSectionId: selectedSectionId,
        globalSettings: globalSettings
      }, "*");
    }
  }, [localSections, selectedSectionId, globalSettings]);

  // Listen for Selection from Preview
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SECTION_SELECT") {
        setSelectedSectionId(event.data.sectionId);
        setActiveActivity("sections");
        toast.info("Section selected", { duration: 1000 });
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const updateMutation = trpc.themes.update.useMutation({
    onSuccess: () => {
      toast.success("Changes saved!");
      utils.themes.getById.invalidate({ themeId });
      utils.themes.getByStoreId.invalidate({ storeId: storeQuery.data?.id || 0 });
    },
  });

  const generateMutation = trpc.ai.generateSectionContent.useMutation({
    onSuccess: (res) => {
      if (res.success && currentSection) {
        handleUpdateSection(currentSection.id, { ...currentSection.settings, ...res.data });
        toast.success("AI Content Applied!", { icon: <Sparkles className="w-4 h-4" /> });
      }
    },
    onError: () => toast.error("Failed to generate content")
  });

  const handleSave = () => {
    if (!theme) return;
    updateMutation.mutate({
      themeId: theme.id,
      sections: templates as any,
      colors: {
        primary: globalSettings.primaryColor,
        background: globalSettings.backgroundColor,
        text: globalSettings.textColor
      },
      typography: {
        family: globalSettings.fontFamily
      }
    });
  };

  const handleUpdateSection = (id: string, settings: any) => {
    const newSections = localSections.map(s => s.id === id ? { ...s, settings } : s);
    const newTemplates = { ...templates, [pageKey]: newSections };
    setTemplates(newTemplates);
    pushToHistory(newTemplates, globalSettings);
  };

  const addSection = (type: string) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const schema = SECTION_SCHEMAS[type];
    const defaultSettings: any = {};
    schema?.settings?.forEach((s: any) => {
      defaultSettings[s.id] = s.default;
    });

    const newSections = [...localSections, { id: newId, type, settings: defaultSettings }];
    const newTemplates = { ...templates, [pageKey]: newSections };
    setTemplates(newTemplates);
    pushToHistory(newTemplates, globalSettings);
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 bg-[#f1f1f1] px-3 py-1.5 rounded-md cursor-pointer hover:bg-[#e1e1e1] transition-all border border-[#d1d1d1] ml-4">
                <span className="text-sm font-medium">{selectedPage}</span>
                <ChevronDown className="w-4 h-4 text-[#616161]" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {["Home Page", "Products", "Cart", "Checkout"].map(page => (
                <DropdownMenuItem key={page} onClick={() => setSelectedPage(page)}>
                  {page}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
            <Button 
              variant="ghost" size="sm" 
              className={`h-8 w-8 p-0 ${historyIndex <= 0 ? 'text-[#c1c1c1] cursor-not-allowed' : 'text-[#616161]'}`}
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" size="sm" 
              className={`h-8 w-8 p-0 ${historyIndex >= history.length - 1 ? 'text-[#c1c1c1] cursor-not-allowed' : 'text-[#616161]'}`}
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending}
            className="bg-[#008060] hover:bg-[#006e52] text-white font-bold h-9 px-6 rounded-md shadow-sm flex items-center gap-2"
          >
            {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* CONFIGURATION PANE (Sidebar) */}
        <aside className="w-80 bg-white border-r border-[#d1d1d1] flex flex-col shadow-sm">
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
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-[#f1f1f1] bg-[#f9f9f9]">
                      <span className="text-sm font-bold">Accent Color</span>
                      <Input 
                        type="color" 
                        value={globalSettings.primaryColor} 
                        onChange={(e) => {
                          const newSettings = {...globalSettings, primaryColor: e.target.value};
                          setGlobalSettings(newSettings);
                          pushToHistory(templates, newSettings);
                        }}
                        className="w-10 h-10 p-1 rounded-lg border-none bg-transparent cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-[#f1f1f1] bg-[#f9f9f9]">
                      <span className="text-sm font-bold">Background</span>
                      <Input 
                        type="color" 
                        value={globalSettings.backgroundColor} 
                        onChange={(e) => {
                          const newSettings = {...globalSettings, backgroundColor: e.target.value};
                          setGlobalSettings(newSettings);
                          pushToHistory(templates, newSettings);
                        }}
                        className="w-10 h-10 p-1 rounded-lg border-none bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t">
                  <Label className="text-[10px] font-bold text-[#616161] uppercase tracking-widest">Typography</Label>
                  <Select 
                    value={globalSettings.fontFamily} 
                    onValueChange={(val) => {
                      const newSettings = {...globalSettings, fontFamily: val};
                      setGlobalSettings(newSettings);
                      pushToHistory(templates, newSettings);
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-[#d1d1d1]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter (Modern)</SelectItem>
                      <SelectItem value="Playfair Display">Playfair (Elegant)</SelectItem>
                      <SelectItem value="Montserrat">Montserrat (Bold)</SelectItem>
                      <SelectItem value="Roboto">Roboto (Clean)</SelectItem>
                    </SelectContent>
                  </Select>
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
                      className={`p-3 rounded-xl flex items-center justify-between cursor-pointer group border transition-all mb-2 ${selectedSectionId === section.id ? "bg-[#008060]/5 border-[#008060] shadow-sm" : "bg-white border-[#f1f1f1] hover:border-[#d1d1d1]"}`}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-[#c1c1c1] cursor-grab" />
                        <span className="text-sm font-bold capitalize text-[#1a1a1a]">{section.type.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" size="icon" className="h-7 w-7 text-[#616161] hover:text-[#008060]"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (idx > 0) {
                              const newSections = [...localSections];
                              [newSections[idx-1], newSections[idx]] = [newSections[idx], newSections[idx-1]];
                              const newTemplates = { ...templates, [pageKey]: newSections };
                              setTemplates(newTemplates);
                              pushToHistory(newTemplates, globalSettings);
                            }
                          }}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" className="h-7 w-7 text-[#616161] hover:text-[#008060]"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (idx < localSections.length - 1) {
                              const newSections = [...localSections];
                              [newSections[idx], newSections[idx+1]] = [newSections[idx+1], newSections[idx]];
                              const newTemplates = { ...templates, [pageKey]: newSections };
                              setTemplates(newTemplates);
                              pushToHistory(newTemplates, globalSettings);
                            }
                          }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" className="h-7 w-7 text-[#616161] hover:text-[#008060]"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newSection = { ...section, id: Math.random().toString(36).substr(2, 9) };
                            const newSections = [...localSections];
                            newSections.splice(idx + 1, 0, newSection);
                            const newTemplates = { ...templates, [pageKey]: newSections };
                            setTemplates(newTemplates);
                            pushToHistory(newTemplates, globalSettings);
                          }}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-[#008060] hover:bg-[#f1f1f1] text-sm font-semibold h-10 mt-4 border border-dashed border-[#008060]/30"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Section
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[280px]">
                      {Object.entries(SECTION_SCHEMAS).map(([type, schema]: [string, any]) => (
                        <DropdownMenuItem 
                          key={type}
                          onClick={() => addSection(type)}
                          className="py-3 cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{schema.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Type: {type}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Theme Settings at Bottom */}
                <div className="p-4 border-t mt-4 bg-[#f9f9f9]/50">
                  <span className="text-[10px] font-bold text-[#616161] uppercase tracking-wider mb-4 block">Theme Settings</span>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Accent Color</span>
                      <Input 
                        type="color" 
                        value={globalSettings.primaryColor} 
                        onChange={(e) => {
                          const newSettings = {...globalSettings, primaryColor: e.target.value};
                          setGlobalSettings(newSettings);
                          pushToHistory(templates, newSettings);
                        }}
                        className="w-8 h-8 p-0 rounded-md border-none bg-transparent cursor-pointer"
                      />
                    </div>
                    <Select 
                      value={globalSettings.fontFamily} 
                      onValueChange={(val) => {
                        const newSettings = {...globalSettings, fontFamily: val};
                        setGlobalSettings(newSettings);
                        pushToHistory(templates, newSettings);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Font Family" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Playfair Display">Playfair</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                {(() => {
                  const schema = SECTION_SCHEMAS[currentSection?.type || ""];
                  if (!schema) return <div className="text-sm text-foreground/50 italic">No settings available for this section.</div>;

                  return (
                    <div className="space-y-6">
                      {/* AI Magic Button for supported types */}
                      {["faq", "testimonials", "newsletter"].includes(currentSection?.type || "") && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={generateMutation.isPending}
                          onClick={() => generateMutation.mutate({ 
                            sectionType: currentSection!.type,
                            storeNiche: storeQuery.data?.niche || "general" 
                          })}
                          className="w-full bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20 text-primary font-bold gap-2 h-10 hover:from-primary/20 hover:to-purple-500/20"
                        >
                          {generateMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          {generateMutation.isPending ? "Generating..." : "Auto-Generate with AI"}
                        </Button>
                      )}

                      {schema.settings.map((field: any) => (
                        <div key={field.id} className="space-y-2">
                          <Label className="text-[10px] font-bold text-[#616161] uppercase tracking-wider">
                            {field.label}
                          </Label>

                          {field.type === "text" || field.type === "url" ? (
                            <Input 
                              value={currentSection?.settings[field.id] || ""} 
                              onChange={(e) => handleUpdateSection(currentSection!.id, {
                                ...currentSection!.settings,
                                [field.id]: e.target.value
                              })}
                              className="h-10 rounded-xl border-[#d1d1d1]"
                            />
                          ) : field.type === "image" ? (
                            <ImagePicker
                              currentValue={currentSection?.settings[field.id] || ""}
                              onSelect={(url) => handleUpdateSection(currentSection!.id, {
                                ...currentSection!.settings,
                                [field.id]: url
                              })}
                            />
                          ) : field.type === "textarea" ? (
                            <Textarea 
                              className="min-h-[100px] border-[#d1d1d1] focus-visible:ring-[#008060] resize-none"
                              value={currentSection?.settings[field.id] || ""} 
                              onChange={(e) => handleUpdateSection(currentSection!.id, { ...currentSection!.settings, [field.id]: e.target.value })}
                            />
                          ) : field.type === "select" ? (
                            <Select 
                              value={currentSection?.settings[field.id]} 
                              onValueChange={(val) => handleUpdateSection(currentSection!.id, { ...currentSection!.settings, [field.id]: val })}
                            >
                              <SelectTrigger className="h-10 border-[#d1d1d1]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options.map((opt: any) => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {field.type === "range" && (
                            <div className="space-y-3 pt-2">
                              <Slider 
                                min={field.min} 
                                max={field.max} 
                                step={1}
                                value={[currentSection?.settings[field.id] || field.default]}
                                onValueChange={([val]) => handleUpdateSection(currentSection!.id, { ...currentSection!.settings, [field.id]: val })}
                                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:border-[#008060] [&_[role=track]]:h-1"
                              />
                              <div className="flex justify-between text-[10px] font-bold text-[#616161]">
                                <span>{field.min}</span>
                                <span className="text-[#008060]">{currentSection?.settings[field.id]}</span>
                                <span>{field.max}</span>
                              </div>
                            </div>
                          )}

                          {field.type === "checkbox" && (
                            <div className="flex items-center justify-between p-3 rounded-lg border border-[#f1f1f1] bg-white">
                              <span className="text-sm">{field.label}</span>
                              <Switch 
                                checked={currentSection?.settings[field.id]}
                                onCheckedChange={(val) => handleUpdateSection(currentSection!.id, { ...currentSection!.settings, [field.id]: val })}
                              />
                            </div>
                          )}
                          {field.type === "image" && (
                            <ImagePicker 
                              currentValue={currentSection?.settings[field.id]}
                              onSelect={(url) => {
                                handleUpdateSection(currentSection!.id, { ...currentSection!.settings, [field.id]: url });
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <div className="pt-6 border-t border-[#f1f1f1]">
                  <Button 
                    variant="ghost" 
                    className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 h-10 gap-2"
                    onClick={() => {
                      const newSections = localSections.filter(s => s.id !== selectedSectionId);
                      const newTemplates = { ...templates, [pageKey]: newSections };
                      setTemplates(newTemplates);
                      pushToHistory(newTemplates);
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
              src={`/store/${storeQuery.data?.slug}${selectedPage !== "Home Page" ? "/" + selectedPage.toLowerCase() : ""}?preview=true&themeId=${themeId}`} 
              className="w-full h-full border-none"
              title="Theme Preview"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
