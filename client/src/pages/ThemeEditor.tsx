import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from '@/components/ui/RichTextEditor';
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Box,
  MousePointer2,
  Copy,
  Search,
  Loader2,
  Sparkles,
  ArrowLeft,
  Undo2,
  Redo2,
  ChevronRight,
  Eye,
  Settings,
  Layers
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { SECTION_SCHEMAS } from "@/storefront/SectionRenderer";
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
    header: [{ id: 'header', type: 'header', settings: {} }],
    footer: [{ id: 'footer', type: 'footer', settings: {} }],
  });
  const [globalSettings, setGlobalSettings] = useState({
    primaryColor: "#008060",
    backgroundColor: "#ffffff",
    textColor: "#1a1a1a",
    fontFamily: "Inter"
  });
  const [history, setHistory] = useState<Array<{ templates: Record<string, Section[]>, globalSettings: any }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Helper to get current template key
  const getPageKey = (page: string) => {
    if (page === "Home Page") return "index";
    if (page === "Product Page") return "product";
    if (page === "Cart Page") return "cart";
    return page.replace(" Page", "").toLowerCase();
  };
  const pageKey = getPageKey(selectedPage);
  const localSections = templates[pageKey] || [];
  
  // Special handling for persistent sections
  const headerSection = templates.header?.[0];
  const footerSection = templates.footer?.[0];
  
  const currentSection = selectedSectionId === 'header' ? headerSection : 
                       selectedSectionId === 'footer' ? footerSection :
                       localSections.find(s => s.id === selectedSectionId);

  // Queries
  const storeQuery = trpc.stores.getMyStore.useQuery();
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const themeId = params.get("themeId") || "";

  const themeQuery = trpc.themes.getById.useQuery(
    { themeId },
    { enabled: !!themeId }
  );

  // Fallback for old /editor route if no themeId
  const activeThemeQuery = trpc.themes.getTheme.useQuery(
    { storeId: storeQuery.data?.id || 0 },
    { enabled: !themeId && !!storeQuery.data?.id }
  );

  const theme = themeId ? themeQuery.data : activeThemeQuery.data;

  // Initial Load
  useEffect(() => {
    if (theme) {
      const config = theme.draftConfig as any;
      let finalTemplates = templates;

      if (config?.templates) {
        const loadedTemplates: Record<string, Section[]> = {
          header: config.header ? [config.header] : [{ id: 'header', type: 'header', settings: {} }],
          footer: config.footer ? [config.footer] : [{ id: 'footer', type: 'footer', settings: {} }],
          index: [],
          product: [],
          cart: [],
          about: [],
          contact: []
        };

        // Map templates (index, product, cart, etc.)
        Object.keys(config.templates).forEach(key => {
          const template = config.templates[key];
          if (template && template.order && template.sections) {
            // Ensure each section object has its ID injected from the key
            const sectionsArray = template.order
              .map((id: string) => {
                const section = template.sections[id];
                if (!section) return null;
                return { ...section, id };
              })
              .filter(Boolean) as Section[];

            // Normalize 'home' to 'index' for consistent routing
            const normalizedKey = key === 'home' ? 'index' : key;
            loadedTemplates[normalizedKey] = sectionsArray;
          }
        });

        finalTemplates = loadedTemplates;
        setTemplates(loadedTemplates);
      }
      
      const newGlobal = {
        primaryColor: config?.colors?.primary || "#008060",
        backgroundColor: config?.colors?.background || "#ffffff",
        textColor: config?.colors?.text || "#1a1a1a",
        fontFamily: config?.typography?.family || "Inter"
      };
      
      setGlobalSettings(newGlobal);
      setHistory([{ 
        templates: finalTemplates, 
        globalSettings: newGlobal 
      }]);
      setHistoryIndex(0);
    }
  }, [themeQuery.data, activeThemeQuery.data]);

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
        header: headerSection,
        footer: footerSection,
        selectedSectionId: selectedSectionId,
        globalSettings: globalSettings,
        themeId: theme?.id,
        themeName: theme?.name
      }, "*");
    }
  }, [localSections, headerSection, footerSection, selectedSectionId, globalSettings, theme]);

  // Listen for Selection from Preview
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SECTION_SELECT") {
        setSelectedSectionId(event.data.sectionId);
        setActiveActivity("sections");
        toast.info("Section selected", { duration: 1000 });
      } else if (event.data?.type === "PAGE_NAVIGATE") {
        const path = event.data.pathname;
        let newPage = "Home Page";
        if (path === "/") newPage = "Home Page";
        else if (path.startsWith("/product/")) newPage = "Product Page";
        else if (path === "/cart") newPage = "Cart Page";
        else {
          const name = path.replace("/", "").replace("-", " ");
          newPage = name.charAt(0).toUpperCase() + name.slice(1) + " Page";
        }
        
        if (newPage !== selectedPage) {
          setSelectedPage(newPage);
          setSelectedSectionId(null);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [selectedPage]); // Added selectedPage to dependency to ensure we compare with latest

  const saveMutation = trpc.themes.saveTheme.useMutation({
    onSuccess: () => {
      toast.success("Changes saved!");
      if (themeId) utils.themes.getById.invalidate({ themeId });
      utils.themes.getTheme.invalidate({ storeId: storeQuery.data?.id || 0 });
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

  const publishMutation = trpc.themes.publish.useMutation({
    onSuccess: () => {
      toast.success("Theme published successfully! Your changes are now live.");
      if (themeId) utils.themes.getById.invalidate({ themeId });
      utils.themes.getTheme.invalidate({ storeId: storeQuery.data?.id || 0 });
    },
    onError: () => toast.error("Failed to publish theme")
  });

  const handleSave = () => {
    if (!theme) return;
    
    // Build the full theme configuration
    const themeJson: any = {
      schemaVersion: 1,
      colors: {
        primary: globalSettings.primaryColor,
        background: globalSettings.backgroundColor,
        text: globalSettings.textColor
      },
      typography: {
        family: globalSettings.fontFamily
      },
      templates: {}
    };

    // FIX 1: Ensure current page changes are included before building JSON
    const currentTemplates = { ...templates, [pageKey]: localSections };
    setTemplates(currentTemplates);

    // Add all pages/templates
    Object.keys(currentTemplates).forEach(key => {
      if (key === 'header' || key === 'footer') {
        themeJson[key] = currentTemplates[key][0];
        return;
      }
      
      const sections = currentTemplates[key];
      themeJson.templates[key] = {
        sections: sections.reduce((acc: any, s: any, i: number) => {
          const id = s.id || `sec-${i}`;
          acc[id] = { ...s, id };
          return acc;
        }, {}),
        order: sections.map((s: any) => s.id)
      };
    });

    saveMutation.mutate({
      storeId: theme.storeId,
      themeJson
    });
  };

  const handlePublish = () => {
    if (!theme) return;
    handleSave(); // Save first
    publishMutation.mutate({ themeId: theme.id });
  };

  const handleUpdateSection = (id: string, settings: any) => {
    if (id === 'header' || id === 'footer') {
      const newTemplates = { 
        ...templates, 
        [id]: [{ ...templates[id][0], settings }] 
      };
      setTemplates(newTemplates);
      pushToHistory(newTemplates, globalSettings);
      return;
    }
    const newSections = localSections.map(s => s.id === id ? { ...s, settings } : s);
    const newTemplates = { ...templates, [pageKey]: newSections };
    setTemplates(newTemplates);
    pushToHistory(newTemplates, globalSettings);
  };

  const addSection = (type: string) => {
    // FIX 3: Update addSection to try prefixed key first
    const newId = `${type}-${Math.random().toString(36).substr(2, 5)}`;
    const prefix = theme?.name?.toLowerCase().includes('bold') ? 'bold' : 'minimal';
    const schemaKey = SECTION_SCHEMAS[`${prefix}:${type}`] ? `${prefix}:${type}` : type;
    const schema = SECTION_SCHEMAS[schemaKey];

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
              {[
                "Home Page", 
                "Product Page", 
                "Cart Page", 
                "About Page", 
                "Contact Page",
                ...Object.keys(templates).filter(k => !['index', 'product', 'cart', 'about', 'contact', 'header', 'footer'].includes(k)).map(k => k.charAt(0).toUpperCase() + k.slice(1).replace("-", " ") + " Page")
              ].map(page => (
                <DropdownMenuItem 
                  key={page} 
                  onClick={() => {
                    // FIX 2: Save current page sections to templates before switching
                    const currentUpdated = {
                      ...templates,
                      [pageKey]: localSections
                    };
                    setTemplates(currentUpdated);
                    setSelectedPage(page);
                    setSelectedSectionId(null);
                  }}
                >
                  {page}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-[#008060] font-bold"
                onClick={() => {
                  const name = prompt("Enter page name (e.g. FAQ):");
                  if (name) {
                    const key = name.toLowerCase().replace(" ", "-");
                    setTemplates({ ...templates, [key]: [] });
                    setSelectedPage(name + " Page");
                  }
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Page
              </DropdownMenuItem>
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
            disabled={saveMutation.isPending}
            variant="outline"
            className="hover:bg-[#f1f1f1] text-[#303030] font-bold h-9 px-4 rounded-md flex items-center gap-2"
          >
            {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Draft
          </Button>
          <Button 
            onClick={handlePublish} 
            disabled={publishMutation.isPending}
            className="bg-[#008060] hover:bg-[#006e52] text-white font-bold h-9 px-6 rounded-md shadow-sm flex items-center gap-2"
          >
            {publishMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Publish
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
                      <SelectItem value="Outfit">Outfit (Premium)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : !selectedSectionId ? (
              <div className="space-y-1">
                {/* Header & Footer always pinned */}
                <div 
                  onClick={() => setSelectedSectionId('header')}
                  className={`p-3 rounded-md hover:bg-[#f1f1f1] flex items-center justify-between cursor-pointer group border transition-all ${selectedSectionId === 'header' ? "bg-[#008060]/5 border-[#008060]" : "border-transparent"}`}
                >
                  <div className="flex items-center gap-3">
                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedSectionId === 'header' ? "rotate-90" : ""}`} />
                    <span className="text-sm font-medium text-[#1a1a1a]">Header</span>
                  </div>
                  <Settings className="w-4 h-4 text-[#616161] opacity-0 group-hover:opacity-100" />
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
                        <SelectItem value="Outfit">Outfit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div 
                  onClick={() => setSelectedSectionId('footer')}
                  className={`p-3 rounded-md hover:bg-[#f1f1f1] flex items-center justify-between cursor-pointer group border transition-all mt-4 ${selectedSectionId === 'footer' ? "bg-[#008060]/5 border-[#008060]" : "border-transparent"}`}
                >
                  <div className="flex items-center gap-3">
                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedSectionId === 'footer' ? "rotate-90" : ""}`} />
                    <span className="text-sm font-medium text-[#1a1a1a]">Footer</span>
                  </div>
                  <Settings className="w-4 h-4 text-[#616161] opacity-0 group-hover:opacity-100" />
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
                            storeNiche: (storeQuery.data as any)?.niche || "general" 
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
                                {field.options?.map((opt: any) => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : null}

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
                      pushToHistory(newTemplates, globalSettings);
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
              src={`https://${storeQuery.data?.slug}.raaenai.com${
                selectedPage === "Home Page" ? "" : 
                selectedPage === "Product Page" ? "/product/sample-1" : 
                selectedPage === "Cart Page" ? "/cart" :
                `/${getPageKey(selectedPage)}`
              }?preview=true&themeId=${themeId}`} 
              className="w-full h-full border-none"
              title="Theme Preview"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
