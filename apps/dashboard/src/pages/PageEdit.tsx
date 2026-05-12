import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useParams } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Globe, 
  FileText,
  AlertCircle,
  Copy
} from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import RichTextEditor from "@/components/RichTextEditor";

const TEMPLATES = {
  about: {
    title: "About Us",
    slug: "about-us",
    content: `<h2>Our Story</h2><p>Welcome to [Store Name]! Founded in [Year], we have been dedicated to providing our customers with the highest quality products and exceptional service.</p><h2>Our Mission</h2><p>Our mission is to [Insert Mission Statement]. We believe in [Insert Values] and strive to make a positive impact in the lives of our customers.</p><h2>Why Choose Us?</h2><ul><li>Quality Guaranteed</li><li>Secure Payments</li><li>Fast Shipping</li><li>24/7 Support</li></ul>`
  },
  privacy: {
    title: "Privacy Policy",
    slug: "privacy-policy",
    content: `<h2>Privacy Policy</h2><p>Your privacy is important to us. It is [Store Name]'s policy to respect your privacy regarding any information we may collect from you across our website.</p><h2>Information We Collect</h2><p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.</p><h2>Data Security</h2><p>We protect your personal data within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>`
  },
  terms: {
    title: "Terms of Service",
    slug: "terms-of-service",
    content: `<h2>Terms of Service</h2><p>By accessing our website, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p><h2>Use License</h2><p>Permission is granted to temporarily download one copy of the materials (information or software) on [Store Name]'s website for personal, non-commercial transitory viewing only.</p><h2>Governing Law</h2><p>These terms and conditions are governed by and construed in accordance with the laws of Pakistan and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>`
  },
  refund: {
    title: "Refund Policy",
    slug: "refund-policy",
    content: `<h2>Refund & Return Policy</h2><p>We want you to be totally satisfied with your purchase. If you are not happy with your order, we are here to help.</p><h2>Returns</h2><p>You have [Number] calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it.</p><h2>Refunds</h2><p>Once we receive your item, we will inspect it and notify you that we have received your returned item. If your return is approved, we will initiate a refund to your original method of payment.</p>`
  }
};

export default function PageEdit() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [location, setLocation] = useLocation();
  const params = useParams();
  const isEditing = !!params.id;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const storeQuery = trpc.stores.getMyStore.useQuery();
  
  const pageQuery = trpc.pages.getById.useQuery(
    { id: parseInt(params.id || "0") },
    { enabled: isEditing }
  );

  useEffect(() => {
    if (pageQuery.data) {
      setTitle(pageQuery.data.title);
      setSlug(pageQuery.data.slug);
      setContent(pageQuery.data.content);
      setIsPublished(pageQuery.data.isPublished ?? true);
    }
  }, [pageQuery.data]);

  const createMutation = trpc.pages.create.useMutation({
    onSuccess: () => {
      toast.success("Page created successfully");
      setLocation("/pages");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.pages.update.useMutation({
    onSuccess: () => {
      toast.success("Page updated successfully");
      setLocation("/pages");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeQuery.data?.id) return;

    const data = {
      title,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      content,
      isPublished,
    };

    if (isEditing) {
      updateMutation.mutate({ id: parseInt(params.id!), ...data });
    } else {
      createMutation.mutate({ storeId: storeQuery.data.id, ...data });
    }
  };

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditing) {
      setSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  };

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/pages")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? "Edit Page" : "New Page"}
            </h1>
          </div>
          <Button onClick={handleSave} disabled={createMutation.isLoading || updateMutation.isLoading} className="shadow-lg">
            {createMutation.isLoading || updateMutation.isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Page
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Page Title</label>
                <Input 
                  placeholder="e.g. About Us" 
                  value={title} 
                  onChange={handleTitleChange}
                  className="text-lg font-medium"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Content</label>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Visual Editor Active</span>
                </div>
                <RichTextEditor 
                  content={content} 
                  onChange={setContent} 
                  placeholder="Write your page content here..."
                />
              </div>
            </Card>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Copy className="w-4 h-4 text-primary" />
                  Quick Templates
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(TEMPLATES).map(([key, t]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    className="text-[11px] justify-start h-9 font-bold bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-all"
                    onClick={() => {
                      if (confirm("This will replace your current content. Continue?")) {
                        setTitle(t.title);
                        setSlug(t.slug);
                        setContent(t.content.replace(/\[Store Name\]/g, storeQuery.data?.name || 'our store'));
                      }
                    }}
                  >
                    {t.title}
                  </Button>
                ))}
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  URL Slug
                </label>
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-2 rounded-l-md border border-r-0">/p/</span>
                  <Input 
                    value={slug} 
                    onChange={(e) => setSlug(e.target.value)}
                    className="rounded-l-none text-sm"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground italic">Visible in browser address bar</p>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Visibility</label>
                  <button
                    onClick={() => setIsPublished(!isPublished)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${isPublished ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPublished ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isPublished ? "This page is visible to customers." : "This page is a draft and hidden from customers."}
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/10">
              <div className="flex gap-3 text-primary">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-bold">Quick Tip</p>
                  <p className="text-xs leading-relaxed opacity-80">
                    Use simple HTML tags like &lt;h2&gt;, &lt;p&gt;, and &lt;ul&gt; to format your content beautifully on the storefront.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
