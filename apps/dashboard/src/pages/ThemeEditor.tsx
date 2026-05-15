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
  Star,
  LayoutGrid
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

// Resilient schema resolver — tries all key variants so sections from any
// theme (bold/minimal, dash or underscore naming) always find their schema.
const resolveSchema = (type: string): any => {
  if (!type) return null;
  const attempts = [
    type,
    type.replace(/-/g, '_'),
    type.replace(/_/g, '-'),
    `minimal:${type}`,
    `bold:${type}`,
    type.replace(/-/g, '_').replace(/^(minimal|bold):/, ''),
  ];
  for (const key of attempts) {
    if (SECTION_SCHEMAS[key]) return SECTION_SCHEMAS[key];
  }
  return null;
};

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
    buttonTextColor: "#ffffff",
    headerFooterBg: "#ffffff",
    bannerOverlay: "rgba(0, 0, 0, 0.4)",
    selectionColor: "#008060",
    fontFamily: "Inter",
    headingFont: "Inter",
    baseFontSize: "16px",
    borderRadius: "0.5rem",
    pageWidth: "1200px",
    sectionSpacing: "60px",
    cardStyle: "flat", // flat, shadow, border
    socialLinks: {
      instagram: "",
      tiktok: "",
      x: "",
      facebook: "",
      youtube: ""
    }
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
        buttonTextColor: config?.colors?.buttonText || "#ffffff",
        headerFooterBg: config?.colors?.headerFooterBg || "#ffffff",
        bannerOverlay: config?.colors?.bannerOverlay || "rgba(0, 0, 0, 0.4)",
        selectionColor: config?.colors?.selection || "#008060",
        fontFamily: config?.typography?.family || "Inter",
        headingFont: config?.typography?.headingFamily || "Inter",
        baseFontSize: config?.typography?.baseSize || "16px",
        borderRadius: config?.typography?.borderRadius || "0.5rem",
        pageWidth: config?.layout?.pageWidth || "1200px",
        sectionSpacing: config?.layout?.sectionSpacing || "60px",
        cardStyle: config?.layout?.cardStyle || "flat",
        socialLinks: config?.socialLinks || {
          instagram: "",
          tiktok: "",
          x: "",
          facebook: "",
          youtube: ""
        }
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
      // Flatten the settings for the storefront receiver
      const syncSettings = {
        ...globalSettings,
        // Ensure legacy naming is also supported
        primary: globalSettings.primaryColor,
        background: globalSettings.backgroundColor,
        text: globalSettings.textColor,
        accent: globalSettings.accentColor,
        border: globalSettings.borderColor,
        secondary: globalSettings.secondaryTextColor,
        // Font vars
        family: globalSettings.fontFamily,
        headingFamily: globalSettings.headingFont,
        baseSize: globalSettings.baseFontSize,
      };

      previewRef.current.contentWindow.postMessage({ 
        type: "THEME_UPDATE", 
        sections: localSections,
        header: headerSection,
        footer: footerSection,
        selectedSectionId: selectedSectionId,
        globalSettings: syncSettings,
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
    onSuccess: (res: { success: boolean; data?: Record<string, unknown> }) => {
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
        text: globalSettings.textColor,
        accent: globalSettings.accentColor,
        secondary: globalSettings.secondaryTextColor,
        border: globalSettings.borderColor,
        buttonText: globalSettings.buttonTextColor,
        headerFooterBg: globalSettings.headerFooterBg,
        bannerOverlay: globalSettings.bannerOverlay,
        selection: globalSettings.selectionColor,
      },
      typography: {
        family: globalSettings.fontFamily,
        headingFamily: globalSettings.headingFont,
        baseSize: globalSettings.baseFontSize,
        borderRadius: globalSettings.borderRadius,
      },
      layout: {
        pageWidth: globalSettings.pageWidth,
        sectionSpacing: globalSettings.sectionSpacing,
        cardStyle: globalSettings.cardStyle,
      },
      socialLinks: globalSettings.socialLinks,
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
    const newId = `${type}-${Math.random().toString(36).substr(2, 5)}`;
    const schema = resolveSchema(type);

    const defaultSettings: any = {};
    schema?.settings?.forEach((s: any) => {
      if (s.default !== undefined) defaultSettings[s.id] = s.default;
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
        {/* 2. ACTIVITY BAR (Narrow Sidebar) */}
        <div className="w-16 bg-white border-r border-[#d1d1d1] flex flex-col items-center py-4 gap-4 z-20">
          <button 
            onClick={() => {
              setActiveActivity("sections");
              setSelectedSectionId(null);
            }}
            className={`p-3 rounded-xl transition-all ${activeActivity === "sections" ? "bg-[#008060] text-white shadow-lg shadow-[#008060]/20" : "text-[#616161] hover:bg-[#f1f1f1]"}`}
            title="Sections"
          >
            <LayoutGrid className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveActivity("settings")}
            className={`p-3 rounded-xl transition-all ${activeActivity === "settings" ? "bg-[#008060] text-white shadow-lg shadow-[#008060]/20" : "text-[#616161] hover:bg-[#f1f1f1]"}`}
            title="Theme Settings"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

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
              <div className="flex flex-col h-full bg-white">
                {/* Removed Search in Settings as requested */}

                <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-20 custom-scrollbar">
                  {/* Colors Section */}
                  <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1a1a1a] flex items-center gap-2">
                        <Palette className="w-4 h-4 text-[#008060]" />
                        Colors
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-5 h-2.5 rounded-full overflow-hidden mb-6 border border-[#f1f1f1] shadow-inner">
                      <div className="hover:scale-110 transition-transform cursor-help" title="Background" style={{ background: globalSettings.backgroundColor }} />
                      <div className="hover:scale-110 transition-transform cursor-help" title="Primary" style={{ background: globalSettings.primaryColor }} />
                      <div className="hover:scale-110 transition-transform cursor-help" title="Accent" style={{ background: globalSettings.accentColor }} />
                      <div className="hover:scale-110 transition-transform cursor-help" title="Text" style={{ background: globalSettings.textColor }} />
                      <div className="hover:scale-110 transition-transform cursor-help" title="Border" style={{ background: globalSettings.borderColor }} />
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { key: 'primaryColor', label: 'Primary Color', hint: 'Used for buttons, links, and main navigation highlights.' },
                        { key: 'buttonTextColor', label: 'Button Text', hint: 'Color of the text inside primary buttons.' },
                        { key: 'backgroundColor', label: 'Background Color', hint: 'The main background color of your entire store pages.' },
                        { key: 'headerFooterBg', label: 'Header & Footer', hint: 'Specific background for top and bottom bars.' },
                        { key: 'textColor', label: 'Main Text Color', hint: 'Primary font color for all headings and descriptions.' },
                        { key: 'accentColor', label: 'Accent Color', hint: 'Used for small UI highlights, badges, and active indicators.' },
                        { key: 'bannerOverlay', label: 'Banner Overlay', hint: 'The tint color applied over Hero and Banner images.' },
                        { key: 'secondaryTextColor', label: 'Muted Text Color', hint: 'For secondary info like labels, dates, and placeholder text.' },
                        { key: 'selectionColor', label: 'Selection Color', hint: 'The color that appears when text is highlighted.' },
                        { key: 'borderColor', label: 'Border & Line Color', hint: 'Used for separators, card outlines, and section dividers.' },
                      ].map(({ key, label, hint }) => (
                        <div key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f6f6f7] transition-all group">
                          <div className="flex-1">
                            <Label className="text-xs font-bold text-[#1a1a1a] cursor-pointer" htmlFor={`color-${key}`}>{label}</Label>
                            <p className="text-[10px] text-[#616161]">{hint}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-[#616161] opacity-0 group-hover:opacity-100 transition-opacity">
                              {(globalSettings[key as keyof typeof globalSettings] as string).toUpperCase()}
                            </span>
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#d1d1d1] shadow-sm hover:scale-110 transition-transform cursor-pointer">
                              <div 
                                className="w-full h-full"
                                style={{ background: globalSettings[key as keyof typeof globalSettings] as string }}
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
                  </section>

                  <div className="h-px bg-[#f1f1f1]" />

                  {/* Typography Section */}
                  <section className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1a1a1a] mb-5 flex items-center gap-2">
                      <Box className="w-4 h-4 text-[#008060]" />
                      Typography
                    </h3>
                    
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#616161]">Heading Font</Label>
                        <Select
                          value={globalSettings.headingFont}
                          onValueChange={(val: string) => setGlobalSettings({ ...globalSettings, headingFont: val })}
                        >
                          <SelectTrigger className="w-full h-11 bg-white border-[#d1d1d1] hover:border-[#008060] transition-colors rounded-xl text-sm font-medium">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { value: "Inter", label: "Inter", desc: "Modern & versatile" },
                              { value: "Outfit", label: "Outfit", desc: "Soft & geometric" },
                              { value: "Playfair Display", label: "Playfair Display", desc: "Classic & elegant" },
                              { value: "DM Sans", label: "DM Sans", desc: "Clean & friendly" },
                              { value: "Space Grotesk", label: "Space Grotesk", desc: "Tech & industrial" },
                              { value: "Cormorant Garamond", label: "Cormorant", desc: "Traditional serif" },
                            ].map(f => (
                              <SelectItem key={f.value} value={f.value} className="py-2.5">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold" style={{ fontFamily: f.value }}>{f.label}</span>
                                  <span className="text-[10px] text-muted-foreground">{f.desc}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#616161]">Body Font</Label>
                        <Select
                          value={globalSettings.fontFamily}
                          onValueChange={(val: string) => setGlobalSettings({ ...globalSettings, fontFamily: val })}
                        >
                          <SelectTrigger className="w-full h-11 bg-white border-[#d1d1d1] hover:border-[#008060] transition-colors rounded-xl text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { value: "Inter", label: "Inter" },
                              { value: "Outfit", label: "Outfit" },
                              { value: "DM Sans", label: "DM Sans" },
                              { value: "Lato", label: "Lato" },
                            ].map(f => (
                              <SelectItem key={f.value} value={f.value}>
                                <span style={{ fontFamily: f.value }}>{f.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-[#616161]">Base Font Size</Label>
                          <span className="text-xs font-bold text-[#008060]">{globalSettings.baseFontSize}</span>
                        </div>
                        <Slider 
                          value={[parseInt(globalSettings.baseFontSize)]} 
                          min={12} 
                          max={20} 
                          step={1}
                          onValueChange={(val) => setGlobalSettings({ ...globalSettings, baseFontSize: `${val[0]}px` })}
                          className="py-4"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Social Media Section */}
                  <section className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1a1a1a] mb-5 flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#008060]" />
                      Social Media
                    </h3>
                    <div className="space-y-3">
                      {[
                        { id: 'instagram', label: 'Instagram', placeholder: '@username' },
                        { id: 'tiktok', label: 'TikTok', placeholder: '@username' },
                        { id: 'x', label: 'X (Twitter)', placeholder: '@username' },
                        { id: 'facebook', label: 'Facebook', placeholder: 'your.page' },
                      ].map(({ id, label, placeholder }) => (
                        <div key={id} className="space-y-1.5">
                          <Label className="text-[10px] font-black text-[#616161] uppercase tracking-wider">{label}</Label>
                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161] text-[10px] font-bold group-hover:text-[#008060] transition-colors">
                              {id === 'instagram' ? 'ig.me/' : id === 'tiktok' ? 'tt.com/' : id === 'x' ? 'x.com/' : 'fb.com/'}
                            </div>
                            <Input
                              placeholder={placeholder}
                              value={globalSettings.socialLinks[id as keyof typeof globalSettings.socialLinks]}
                              onChange={(e) => setGlobalSettings({
                                ...globalSettings,
                                socialLinks: { ...globalSettings.socialLinks, [id]: e.target.value }
                              })}
                              className="h-10 pl-14 bg-white border-[#d1d1d1] rounded-xl text-sm focus-visible:ring-[#008060]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                </div>
              </div>
            ) : !selectedSectionId ? (
              <div className="flex flex-col h-full bg-white p-2">
                {/* Header & Footer always pinned */}
                <div 
                  onClick={() => setSelectedSectionId('header')}
                  className={`p-3 rounded-xl hover:bg-[#f1f1f1] flex items-center justify-between cursor-pointer group border transition-all mb-2 ${selectedSectionId === 'header' ? "bg-[#008060]/5 border-[#008060] shadow-sm" : "bg-white border-transparent"}`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="w-4 h-4 text-[#008060]" />
                    <span className="text-sm font-bold text-[#1a1a1a]">Header</span>
                  </div>
                  <Settings className="w-4 h-4 text-[#616161] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex-1 overflow-y-auto px-1 py-4 custom-scrollbar">
                  <div className="h-px bg-[#f1f1f1] mb-6" />
                  <span className="text-[10px] font-black text-[#616161] uppercase tracking-[0.2em] mb-4 block px-2">Sections</span>
                  
                  <div className="space-y-2">
                    {localSections.map((section, idx) => (
                      <div 
                        key={section.id}
                        onClick={() => setSelectedSectionId(section.id)}
                        className={`p-3 rounded-xl flex items-center justify-between cursor-pointer group border transition-all ${selectedSectionId === section.id ? "bg-[#008060]/5 border-[#008060] shadow-sm" : "bg-white border-[#f1f1f1] hover:border-[#d1d1d1]"}`}
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-[#c1c1c1] cursor-grab group-hover:text-[#616161] transition-colors" />
                          <span className="text-sm font-bold capitalize text-[#1a1a1a]">{section.type.replace("_", " ")}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" size="icon" className="h-7 w-7 text-[#616161] hover:text-[#008060]"
                            onClick={(e: React.MouseEvent) => {
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
                            onClick={(e: React.MouseEvent) => {
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
                        </div>
                      </div>
                    ))}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-center text-[#008060] hover:bg-[#008060]/5 text-xs font-black uppercase tracking-widest h-12 mt-6 border-2 border-dashed border-[#008060]/20 rounded-2xl transition-all hover:border-[#008060]/40"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Section
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[300px] max-h-[480px] overflow-y-auto rounded-2xl shadow-2xl border-[#f1f1f1]">
                      <div className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#616161] border-b bg-[#f9f9f9]">
                        Sections for {selectedPage}
                      </div>
                      {(PAGE_SECTIONS[pageKey] || DEFAULT_SECTIONS).map((type) => {
                        const meta = SECTION_META[type];
                        const schema = resolveSchema(type);
                        if (!meta && !schema) return null;
                        return (
                          <DropdownMenuItem
                            key={type}
                            onClick={() => addSection(type)}
                            className="py-4 px-4 cursor-pointer hover:bg-[#f6f6f7] transition-colors border-b last:border-0 border-[#f1f1f1]/50"
                          >
                            <div className="flex items-center gap-4 w-full">
                              <div className="w-10 h-10 rounded-xl bg-[#f1f1f1] flex items-center justify-center text-xl shadow-inner">
                                {meta?.icon || '📄'}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-black text-sm text-[#1a1a1a]">
                                  {meta?.name || schema?.name || type}
                                </span>
                                <span className="text-[10px] text-[#616161] leading-tight mt-0.5 font-medium">
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

                <div 
                  onClick={() => setSelectedSectionId('footer')}
                  className={`p-3 rounded-xl hover:bg-[#f1f1f1] flex items-center justify-between cursor-pointer group border transition-all mt-auto ${selectedSectionId === 'footer' ? "bg-[#008060]/5 border-[#008060] shadow-sm" : "bg-white border-transparent"}`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="w-4 h-4 text-[#008060]" />
                    <span className="text-sm font-bold text-[#1a1a1a]">Footer</span>
                  </div>
                  <Settings className="w-4 h-4 text-[#616161] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ) : (
              /* Section Settings View */
              <div className="flex flex-col h-full bg-white">
                <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-20 custom-scrollbar">
                  {(() => {
                    const schema = resolveSchema(currentSection?.type || '');
                    if (!schema) return <div className="text-sm text-foreground/50 italic p-2">No settings found.</div>;

                    return (
                      <div className="space-y-8">
                        {/* AI Magic Button */}
                        {["faq", "testimonials", "newsletter", "hero", "rich_text"].includes(currentSection?.type || "") && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={generateMutation.isPending}
                            onClick={() => generateMutation.mutate({ 
                              sectionType: currentSection!.type,
                              storeNiche: (storeQuery.data as any)?.niche || "general" 
                            })}
                            className="w-full bg-gradient-to-br from-[#008060]/10 via-[#008060]/5 to-purple-500/10 border-[#008060]/20 text-[#008060] font-black tracking-widest uppercase text-[10px] gap-2 h-12 hover:shadow-lg transition-all rounded-2xl"
                          >
                            {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Auto-Generate Content
                          </Button>
                        )}

                        <div className="space-y-6">
                          {schema.settings.map((field: any) => (
                            <div key={field.id} className="space-y-3">
                              <Label className="text-[10px] font-black text-[#616161] uppercase tracking-[0.15em]">
                                {field.label}
                              </Label>

                              {field.type === "text" || field.type === "url" ? (
                                (() => {
                                  const isColorField = field.id.toLowerCase().includes('color') || field.id.toLowerCase().includes('bg');
                                  if (isColorField) {
                                    return (
                                      <div className="flex items-center gap-3">
                                        <Input
                                          value={currentSection?.settings[field.id] || ''}
                                          onChange={(e) => handleUpdateSection(currentSection!.id, { ...currentSection!.settings, [field.id]: e.target.value })}
                                          className="flex-1 h-11 font-mono text-xs rounded-xl bg-[#f9f9f9] border-none"
                                        />
                                        <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-[#f1f1f1] shadow-sm">
                                          <div className="w-full h-full" style={{ background: currentSection?.settings[field.id] || '#ffffff' }} />
                                          <input
                                            type="color"
                                            value={currentSection?.settings[field.id] || '#ffffff'}
                                            onChange={(e) => handleUpdateSection(currentSection!.id, { ...currentSection!.settings, [field.id]: e.target.value })}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                          />
                                        </div>
                                      </div>
                                    );
                                  }
                                  return (
                                    <Input 
                                      value={currentSection?.settings[field.id] || ""} 
                                      onChange={(e) => handleUpdateSection(currentSection!.id, { ...currentSection!.settings, [field.id]: e.target.value })}
                                      className="h-11 rounded-xl bg-[#f9f9f9] border-none"
                                    />
                                  );
                                })()
                              ) : field.type === "image" ? (
                                <ImagePicker
                                  value={currentSection?.settings[field.id] || ""}
                                  onChange={(url: string) => handleUpdateSection(currentSection!.id, { ...currentSection!.settings, [field.id]: url })}
                                />
                              ) : field.type === "textarea" ? (
                                <Textarea 
                                  className="min-h-[120px] rounded-2xl bg-[#f9f9f9] border-none focus-visible:ring-[#008060]"
                                  value={currentSection?.settings[field.id] || ""} 
                                  onChange={(e) => handleUpdateSection(currentSection!.id, { ...currentSection!.settings, [field.id]: e.target.value })}
                                />
                              ) : field.type === "select" ? (
                                <Select 
                                  value={currentSection?.settings[field.id]} 
                                  onValueChange={(val: string) => handleUpdateSection(currentSection!.id, { ...currentSection!.settings, [field.id]: val })}
                                >
                                  <SelectTrigger className="h-11 rounded-xl bg-[#f9f9f9] border-none">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options?.map((opt: any) => (
                                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : field.type === "range" ? (
                                <div className="space-y-4 pt-2">
                                  <Slider 
                                    min={field.min} max={field.max} step={1}
                                    value={[currentSection?.settings[field.id] || field.default]}
                                    onValueChange={([val]) => handleUpdateSection(currentSection!.id, { ...currentSection!.settings, [field.id]: val })}
                                  />
                                  <div className="flex justify-between text-[10px] font-black text-[#008060]">
                                    <span>{field.min}</span>
                                    <span>{currentSection?.settings[field.id]}</span>
                                    <span>{field.max}</span>
                                  </div>
                                </div>
                              ) : field.type === "checkbox" ? (
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f9f9f9]">
                                  <span className="text-xs font-bold text-[#1a1a1a]">{field.label}</span>
                                  <Switch 
                                    checked={currentSection?.settings[field.id]}
                                    onCheckedChange={(val) => handleUpdateSection(currentSection!.id, { ...currentSection!.settings, [field.id]: val })}
                                  />
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="pt-10">
                    <Button 
                      variant="ghost" 
                      className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 border border-red-100"
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
