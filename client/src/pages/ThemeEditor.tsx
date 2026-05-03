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
  Layers,
  Star
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

const PAGE_SECTIONS: Record<string, string[]> = {
  index: [
    'announcement_bar',
    'hero',
    'icon_features',
    'featured_collection',
    'image_banner',
    'brand_logos',
    'video_section',
    'rich_text',
    'testimonials',
    'newsletter',
    'faq',
  ],
  products: [
    'announcement_bar',
    'hero',
    'featured_collection',
    'rich_text',
  ],
  product: [
    'product-details',
    'rich_text',
    'testimonials',
    'newsletter',
  ],
  cart: [
    'cart-view',
  ],
  about: [
    'announcement_bar',
    'hero',
    'image_banner',
    'rich_text',
    'brand_logos',
    'testimonials',
    'newsletter',
    'icon_features',
  ],
  contact: [
    'announcement_bar',
    'contact',
    'rich_text',
    'faq',
  ],
};

const DEFAULT_SECTIONS = [
  'announcement_bar',
  'hero',
  'featured_collection',
  'rich_text',
  'newsletter',
];

const SECTION_META: Record<string, { name: string, description: string, icon: string }> = {
  announcement_bar: { name: "Announcement Bar", description: "Drive urgency with a top banner", icon: "📢" },
  hero: { name: "Hero Banner", description: "Bold full-width opening section", icon: "🖼️" },
  icon_features: { name: "Trust Builder", description: "Shipping, returns, support icons", icon: "✨" },
  featured_collection: { name: "Product Grid", description: "Showcase your best products", icon: "🛍️" },
  image_banner: { name: "Image Banner", description: "Full-width promotional image", icon: "📸" },
  brand_logos: { name: "Press & Partners", description: "Build instant credibility", icon: "🏆" },
  video_section: { name: "Video Section", description: "Embed YouTube or Vimeo", icon: "🎬" },
  rich_text: { name: "Rich Text", description: "Editorial content and storytelling", icon: "📝" },
  testimonials: { name: "Testimonials", description: "Customer reviews and social proof", icon: "⭐" },
  newsletter: { name: "Newsletter", description: "Grow your email list", icon: "📧" },
  faq: { name: "FAQ", description: "Answer common questions", icon: "❓" },
  'product-details': { name: "Product Details", description: "Images, price, add to cart", icon: "📦" },
  'cart-view': { name: "Cart", description: "Shopping cart and checkout", icon: "🛒" },
  about: { name: "About", description: "Brand story and mission", icon: "💡" },
  contact: { name: "Contact Form", description: "Let customers reach you", icon: "✉️" },
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
    accentColor: "#10b981",
    secondaryTextColor: "#71717a",
    borderColor: "#e4e4e7",
    fontFamily: "Inter",
    headingFont: "Inter",
    baseFontSize: "16px",
    borderRadius: "0.5rem",
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
        accentColor: config?.colors?.accent || "#10b981",
        secondaryTextColor: config?.colors?.secondary || "#71717a",
        borderColor: config?.colors?.border || "#e4e4e7",
        fontFamily: config?.typography?.family || "Inter",
        headingFont: config?.typography?.headingFamily || "Inter",
        baseFontSize: config?.typography?.baseSize || "16px",
        borderRadius: config?.typography?.borderRadius || "0.5rem",
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
        globalSettings: {
          ...globalSettings,
          colors: {
            primary: globalSettings.primaryColor,
            accent: globalSettings.accentColor,
            background: globalSettings.backgroundColor,
            foreground: globalSettings.textColor,
            text: globalSettings.textColor,
            secondary: globalSettings.secondaryTextColor,
            border: globalSettings.borderColor,
          },
          typography: {
            family: globalSettings.fontFamily,
            headingFamily: globalSettings.headingFont,
            baseSize: globalSettings.baseFontSize,
            borderRadius: globalSettings.borderRadius,
          }
        },
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
                
                {/* Colors Section */}
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] mb-4 flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-[#008060]" />
                    Brand Colors
                  </h3>
                  
                  {/* Color Preview Bar */}
                  <div className="flex h-8 rounded-lg overflow-hidden mb-4 border border-[#f1f1f1]">
                    <div className="flex-1" style={{ background: globalSettings.backgroundColor }} />
                    <div className="flex-1" style={{ background: globalSettings.primaryColor }} />
                    <div className="flex-1" style={{ background: globalSettings.accentColor }} />
                    <div className="flex-1" style={{ background: globalSettings.textColor }} />
                    <div className="flex-1" style={{ background: globalSettings.secondaryTextColor }} />
                  </div>

                  <div className="space-y-2">
                    {[
                      { key: 'primaryColor', label: 'Primary', hint: 'Buttons, headings' },
                      { key: 'accentColor', label: 'Accent', hint: 'Highlights, links' },
                      { key: 'backgroundColor', label: 'Background', hint: 'Page background' },
                      { key: 'textColor', label: 'Main Text', hint: 'Body text color' },
                      { key: 'secondaryTextColor', label: 'Secondary Text', hint: 'Subtitles, captions' },
                      { key: 'borderColor', label: 'Border', hint: 'Dividers, outlines' },
                    ].map(({ key, label, hint }) => (
                      <div key={key} className="flex items-center justify-between p-2.5 bg-white border border-[#f1f1f1] rounded-lg hover:border-[#d1d1d1] transition-colors">
                        <div>
                          <p className="text-xs font-semibold text-[#1a1a1a]">{label}</p>
                          <p className="text-[10px] text-muted-foreground">{hint}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {globalSettings[key as keyof typeof globalSettings]}
                          </span>
                          <div className="relative">
                            <div 
                              className="w-8 h-8 rounded-lg border border-[#e1e1e1] cursor-pointer shadow-sm"
                              style={{ background: globalSettings[key as keyof typeof globalSettings] as string }}
                              onClick={() => document.getElementById(`color-${key}`)?.click()}
                            />
                            <input
                              id={`color-${key}`}
                              type="color"
                              value={globalSettings[key as keyof typeof globalSettings] as string}
                              onChange={(e) => setGlobalSettings({ ...globalSettings, [key]: e.target.value })}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[#f1f1f1]" />

                {/* Typography Section */}
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] mb-4 flex items-center gap-2">
                    <Box className="w-3.5 h-3.5 text-[#008060]" />
                    Typography
                  </h3>
                  <div className="space-y-3">
                    
                    {/* Body Font */}
                    <div className="p-2.5 bg-white border border-[#f1f1f1] rounded-lg">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Body Font</p>
                      <Select
                        value={globalSettings.fontFamily}
                        onValueChange={(val) => setGlobalSettings({ ...globalSettings, fontFamily: val })}
                      >
                        <SelectTrigger className="w-full h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            { value: "Inter", label: "Inter", hint: "Clean & Modern" },
                            { value: "Outfit", label: "Outfit", hint: "Bold & Contemporary" },
                            { value: "Playfair Display", label: "Playfair Display", hint: "Elegant Serif" },
                            { value: "Roboto Mono", label: "Roboto Mono", hint: "Technical" },
                            { value: "DM Sans", label: "DM Sans", hint: "Friendly & Readable" },
                            { value: "Cormorant Garamond", label: "Cormorant Garamond", hint: "Luxury Serif" },
                            { value: "Space Grotesk", label: "Space Grotesk", hint: "Modern Geometric" },
                            { value: "Lato", label: "Lato", hint: "Professional & Neutral" },
                          ].map(f => (
                            <SelectItem key={f.value} value={f.value}>
                              <span>{f.label}</span>
                              <span className="text-[10px] text-muted-foreground ml-2">— {f.hint}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {/* Font Preview */}
                      <p className="mt-2 text-sm text-[#1a1a1a] border-t border-[#f1f1f1] pt-2" style={{ fontFamily: globalSettings.fontFamily }}>
                        The quick brown fox jumps.
                      </p>
                    </div>

                    {/* Heading Font */}
                    <div className="p-2.5 bg-white border border-[#f1f1f1] rounded-lg">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Heading Font</p>
                      <Select
                        value={globalSettings.headingFont}
                        onValueChange={(val) => setGlobalSettings({ ...globalSettings, headingFont: val })}
                      >
                        <SelectTrigger className="w-full h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            { value: "Inter", label: "Inter", hint: "Clean & Modern" },
                            { value: "Outfit", label: "Outfit", hint: "Bold & Contemporary" },
                            { value: "Playfair Display", label: "Playfair Display", hint: "Elegant Serif" },
                            { value: "Roboto Mono", label: "Roboto Mono", hint: "Technical" },
                            { value: "DM Sans", label: "DM Sans", hint: "Friendly & Readable" },
                            { value: "Cormorant Garamond", label: "Cormorant Garamond", hint: "Luxury Serif" },
                            { value: "Space Grotesk", label: "Space Grotesk", hint: "Modern Geometric" },
                            { value: "Lato", label: "Lato", hint: "Professional & Neutral" },
                          ].map(f => (
                            <SelectItem key={f.value} value={f.value}>
                              <span>{f.label}</span>
                              <span className="text-[10px] text-muted-foreground ml-2">— {f.hint}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="mt-2 text-lg font-bold text-[#1a1a1a] border-t border-[#f1f1f1] pt-2" style={{ fontFamily: globalSettings.headingFont }}>
                        Heading Preview
                      </p>
                    </div>

                    {/* Border Radius */}
                    <div className="p-2.5 bg-white border border-[#f1f1f1] rounded-lg">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Button Style</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "0rem", label: "Sharp" },
                          { value: "0.5rem", label: "Rounded" },
                          { value: "9999px", label: "Pill" },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setGlobalSettings({ ...globalSettings, borderRadius: opt.value })}
                            className={`py-2 text-xs font-bold border transition-all ${
                              globalSettings.borderRadius === opt.value 
                                ? 'border-[#008060] bg-[#008060]/5 text-[#008060]' 
                                : 'border-[#e1e1e1] text-[#616161] hover:border-[#008060]'
                            }`}
                            style={{ borderRadius: opt.value === '9999px' ? '9999px' : '4px' }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[#f1f1f1]" />

                {/* Quick Presets */}
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] mb-4 flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-[#008060]" />
                    Quick Presets
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Minimal", primary: "#18181b", accent: "#10b981", bg: "#ffffff", text: "#18181b", font: "Inter" },
                      { name: "Bold Dark", primary: "#ffffff", accent: "#3b82f6", bg: "#0a0a0a", text: "#ffffff", font: "Outfit" },
                      { name: "Luxury", primary: "#1a0a00", accent: "#b8860b", bg: "#faf8f5", text: "#1a0a00", font: "Cormorant Garamond" },
                      { name: "Fresh", primary: "#064e3b", accent: "#34d399", bg: "#f0fdf4", text: "#064e3b", font: "DM Sans" },
                      { name: "Electric", primary: "#1e1b4b", accent: "#8b5cf6", bg: "#0f0f23", text: "#e2e8f0", font: "Space Grotesk" },
                      { name: "Classic", primary: "#1c1917", accent: "#dc2626", bg: "#ffffff", text: "#1c1917", font: "Playfair Display" },
                    ].map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => setGlobalSettings({
                          ...globalSettings,
                          primaryColor: preset.primary,
                          accentColor: preset.accent,
                          backgroundColor: preset.bg,
                          textColor: preset.text,
                          fontFamily: preset.font,
                          headingFont: preset.font,
                        })}
                        className="p-2.5 border border-[#f1f1f1] rounded-lg hover:border-[#008060] transition-colors text-left"
                      >
                        <div className="flex gap-1 mb-1.5">
                          <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: preset.bg === '#ffffff' ? '#f1f1f1' : preset.bg }} />
                          <div className="w-4 h-4 rounded-full" style={{ background: preset.primary }} />
                          <div className="w-4 h-4 rounded-full" style={{ background: preset.accent }} />
                        </div>
                        <p className="text-[10px] font-bold text-[#1a1a1a]">{preset.name}</p>
                        <p className="text-[9px] text-muted-foreground" style={{ fontFamily: preset.font }}>{preset.font}</p>
                      </button>
                    ))}
                  </div>
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
                    <DropdownMenuContent align="start" className="w-[300px] max-h-[480px] overflow-y-auto">
                      <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b">
                        Add Section — {selectedPage}
                      </div>
                      {(PAGE_SECTIONS[pageKey] || DEFAULT_SECTIONS).map((type) => {
                        const meta = SECTION_META[type];
                        const schema = SECTION_SCHEMAS[type];
                        if (!meta && !schema) return null;
                        return (
                          <DropdownMenuItem
                            key={type}
                            onClick={() => addSection(type)}
                            className="py-3 cursor-pointer hover:bg-[#f1f1f1]"
                          >
                            <div className="flex items-start gap-3 w-full">
                              <span className="text-xl mt-0.5">{meta?.icon || '📄'}</span>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-sm text-[#1a1a1a]">
                                  {meta?.name || schema?.name || type}
                                </span>
                                <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                                  {meta?.description || ''}
                                </span>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
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
                               value={currentSection?.settings[field.id] || ""}
                               onChange={(url) => handleUpdateSection(currentSection!.id, {
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
