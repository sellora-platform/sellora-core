import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  ThumbsUp, 
  Trash2, 
  Check, 
  X, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload as UploadIcon,
  MessageSquare,
  User,
  Calendar,
  AlertCircle,
  Edit2,
  Package,
  Loader2
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ImageUploader } from "@/components/ImageUploader";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Reviews() {
  const { user, isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [activeTab, setActiveTab] = useState("pending");
  
  const storeQuery = trpc.stores.getMyStore.useQuery();
  const storeId = storeQuery.data?.id || 0;

  // --- QUERIES ---
  const pendingQuery = trpc.reviews.list.useQuery(
    { storeId, published: false },
    { enabled: !!storeId && activeTab === "pending" }
  );

  const publishedQuery = trpc.reviews.list.useQuery(
    { storeId, published: true },
    { enabled: !!storeId && activeTab === "published" }
  );

  const productsQuery = trpc.products.listByStore.useQuery(
    { storeId },
    { enabled: !!storeId && activeTab === "add" }
  );

  // --- MUTATIONS ---
  const updateStatusMutation = trpc.reviews.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Review status updated");
      pendingQuery.refetch();
      publishedQuery.refetch();
    }
  });

  const deleteMutation = trpc.reviews.delete.useMutation({
    onSuccess: () => {
      toast.success("Review deleted");
      pendingQuery.refetch();
      publishedQuery.refetch();
    }
  });

  const createMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Review added successfully");
      setActiveTab("published");
      publishedQuery.refetch();
    }
  });

  const updateMutation = trpc.reviews.update.useMutation({
    onSuccess: () => {
      toast.success("Review updated");
      setEditingReview(null);
      publishedQuery.refetch();
    }
  });

  // --- STATE FOR FILTERS & MODALS ---
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [editingReview, setEditingReview] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState("");

  // --- CSV LOGIC ---
  const exportCSV = (reviews: any[]) => {
    const headers = ['id', 'productId', 'authorName', 'authorEmail', 'rating', 'title', 'body', 'verified', 'source', 'createdAt'];
    const rows = reviews.map(r => 
      headers.map(h => {
        const val = r[h] ?? '';
        return JSON.stringify(val);
      }).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviews-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !storeId) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        return headers.reduce((acc: any, h, i) => {
          acc[h] = values[i] || '';
          return acc;
        }, {});
      });

      let successCount = 0;
      for (let i = 0; i < data.length; i++) {
        setImportProgress(`Importing ${i + 1}/${data.length}...`);
        const row = data[i];
        try {
          await createMutation.mutateAsync({
            storeId,
            productId: parseInt(row.productId) || productsQuery.data?.[0]?.id || 0,
            authorName: row.authorName || 'Anonymous',
            authorEmail: row.authorEmail,
            rating: parseInt(row.rating) || 5,
            title: row.title,
            body: row.body,
            verified: row.verified === 'true' || row.verified === '1',
            images: []
          });
          successCount++;
        } catch (err) {
          console.error("Failed to import row", i, err);
        }
      }
      toast.success(`${successCount} reviews imported successfully`);
      setImporting(false);
      setImportProgress("");
      publishedQuery.refetch();
    };
    reader.readAsText(file);
  };

  // --- FILTERED REVIEWS ---
  const filteredPublished = useMemo(() => {
    const items = publishedQuery.data || [];
    return items.filter(r => {
      const matchesSearch = r.authorName.toLowerCase().includes(search.toLowerCase()) || 
                           (r.title || "").toLowerCase().includes(search.toLowerCase());
      const matchesRating = ratingFilter === "all" || r.rating === parseInt(ratingFilter);
      const matchesSource = sourceFilter === "all" || r.source === sourceFilter;
      return matchesSearch && matchesRating && matchesSource;
    });
  }, [publishedQuery.data, search, ratingFilter, sourceFilter]);

  // --- SUMMARY DATA ---
  const summary = useMemo(() => {
    const items = publishedQuery.data || [];
    if (items.length === 0) return null;
    const avg = items.reduce((s, r) => s + r.rating, 0) / items.length;
    const counts = [0, 0, 0, 0, 0, 0];
    items.forEach(r => counts[r.rating]++);
    return { avg, total: items.length, counts };
  }, [publishedQuery.data]);

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Reviews</h1>
            <p className="text-foreground/60 mt-1">Manage customer feedback and build social proof</p>
          </div>
          {activeTab === "published" && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => exportCSV(publishedQuery.data || [])}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <div className="relative">
                <Button variant="outline" className="gap-2" asChild>
                  <label className="cursor-pointer">
                    <UploadIcon className="w-4 h-4" />
                    Import CSV
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".csv" 
                      onChange={handleImportCSV}
                      disabled={importing}
                    />
                  </label>
                </Button>
              </div>
            </div>
          )}
        </div>

        {importing && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3 animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <p className="text-sm font-bold text-primary">{importProgress}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-xl inline-flex h-12">
            <TabsTrigger value="pending" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Pending
              {pendingQuery.data && pendingQuery.data.length > 0 && (
                <Badge className="ml-2 bg-orange-500 hover:bg-orange-600">
                  {pendingQuery.data.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="published" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Published
            </TabsTrigger>
            <TabsTrigger value="add" className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Add Review
            </TabsTrigger>
          </TabsList>

          {/* --- PENDING TAB --- */}
          <TabsContent value="pending" className="space-y-4">
            {pendingQuery.isLoading ? (
              <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/30" /></div>
            ) : pendingQuery.data?.length === 0 ? (
              <Card className="p-20 text-center flex flex-col items-center gap-4 border-dashed">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground/30">
                  <Check className="w-8 h-8" />
                </div>
                <p className="text-lg font-bold text-foreground/60">No pending reviews</p>
                <p className="text-sm text-muted-foreground max-w-xs">All customer reviews have been processed.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingQuery.data?.map((review: any) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    onApprove={() => updateStatusMutation.mutate({ id: review.id, published: true })}
                    onReject={() => confirm("Delete this review?") && deleteMutation.mutate({ id: review.id })}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* --- PUBLISHED TAB --- */}
          <TabsContent value="published" className="space-y-6">
            {/* Rating Summary */}
            {summary && (
              <Card className="p-8 border-border/50 bg-background/50 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="text-center">
                    <p className="text-6xl font-black text-foreground mb-2">{summary.avg.toFixed(1)}</p>
                    <div className="flex justify-center gap-1 mb-2">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-5 h-5 ${s <= Math.round(summary.avg) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                      ))}
                    </div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{summary.total} Reviews</p>
                  </div>
                  
                  <div className="flex-1 w-full space-y-2">
                    {[5,4,3,2,1].map(star => {
                      const count = summary.counts[star];
                      const pct = (count / summary.total) * 100;
                      return (
                        <div key={star} className="flex items-center gap-4">
                          <span className="text-sm font-bold text-muted-foreground w-4">{star}</span>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-sm font-bold text-muted-foreground w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by author or content..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-11"
                />
              </div>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <SelectValue placeholder="Rating" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <SelectValue placeholder="Source" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="merchant">Merchant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* List */}
            {publishedQuery.isLoading ? (
              <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary/30" /></div>
            ) : filteredPublished.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">No reviews found matching filters.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredPublished.map((review: any) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    onUnpublish={() => updateStatusMutation.mutate({ id: review.id, published: false })}
                    onDelete={() => confirm("Delete this review?") && deleteMutation.mutate({ id: review.id })}
                    onEdit={() => setEditingReview(review)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* --- ADD REVIEW TAB --- */}
          <TabsContent value="add">
            <Card className="max-w-3xl mx-auto border-border/50">
              <AddReviewForm 
                products={productsQuery.data || []} 
                onSubmit={(data) => createMutation.mutate({ ...data, storeId })}
                submitting={createMutation.isPending}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Modal */}
      {editingReview && (
        <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Author Name</Label>
                  <Input 
                    value={editingReview.authorName} 
                    onChange={e => setEditingReview({...editingReview, authorName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <Select 
                    value={editingReview.rating.toString()} 
                    onValueChange={v => setEditingReview({...editingReview, rating: parseInt(v)})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[5,4,3,2,1].map(s => <SelectItem key={s} value={s.toString()}>{s} Stars</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  value={editingReview.title} 
                  onChange={e => setEditingReview({...editingReview, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea 
                  rows={4}
                  value={editingReview.body} 
                  onChange={e => setEditingReview({...editingReview, body: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  id="edit-verified" 
                  checked={editingReview.verified} 
                  onCheckedChange={v => setEditingReview({...editingReview, verified: v})}
                />
                <Label htmlFor="edit-verified">Verified Purchase</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingReview(null)}>Cancel</Button>
              <Button 
                onClick={() => updateMutation.mutate({ ...editingReview })}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}

function ReviewCard({ review, onApprove, onReject, onUnpublish, onDelete, onEdit }: any) {
  return (
    <Card className="p-6 border-border/50 hover:border-primary/30 transition-all group">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-foreground leading-none">{review.authorName}</p>
                <p className="text-xs text-muted-foreground mt-1">{review.authorEmail || "No email provided"}</p>
              </div>
            </div>
            <Badge variant="outline" className={review.source === 'customer' ? 'text-blue-500 border-blue-200 bg-blue-50' : 'text-emerald-500 border-emerald-200 bg-emerald-50'}>
              {review.source.charAt(0).toUpperCase() + review.source.slice(1)}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
              ))}
            </div>
            {review.verified && (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none h-5 text-[10px] font-black uppercase">
                Verified
              </Badge>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {new Date(review.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div>
            {review.title && <h4 className="font-bold text-foreground mb-1">{review.title}</h4>}
            <p className="text-sm text-muted-foreground leading-relaxed italic">"{review.body}"</p>
          </div>

          {review.images?.length > 0 && (
            <div className="flex gap-2">
              {review.images.map((img: any, i: number) => (
                <div key={i} className="w-16 h-16 rounded-lg border bg-muted overflow-hidden">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
          {onApprove && (
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={onApprove}>
              <Check className="w-4 h-4" />
              Approve
            </Button>
          )}
          {onReject && (
            <Button variant="outline" className="w-full text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50 gap-2" onClick={onReject}>
              <X className="w-4 h-4" />
              Reject
            </Button>
          )}
          {onUnpublish && (
            <Button variant="outline" className="w-full gap-2" onClick={onUnpublish}>
              <AlertCircle className="w-4 h-4" />
              Unpublish
            </Button>
          )}
          {onEdit && (
            <Button variant="ghost" className="w-full gap-2" onClick={onEdit}>
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" className="w-full text-muted-foreground hover:text-red-500 gap-2" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function AddReviewForm({ products, onSubmit, submitting }: any) {
  const [formData, setFormData] = useState({
    productId: 0,
    authorName: "",
    authorEmail: "",
    rating: 5,
    verified: true,
    title: "",
    body: ""
  });
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.authorName || !formData.rating) {
      toast.error("Please fill required fields");
      return;
    }
    onSubmit({ ...formData, images: images.map(url => ({ url })) });
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Plus className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold">Add Manual Review</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-1">Product <span className="text-red-500">*</span></Label>
            <Select onValueChange={v => setFormData({ ...formData, productId: parseInt(v) })}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <SelectValue placeholder="Select a product" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {products.map((p: any) => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1">Author Name <span className="text-red-500">*</span></Label>
            <Input 
              placeholder="e.g. Sarah J." 
              value={formData.authorName}
              onChange={e => setFormData({ ...formData, authorName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Author Email (Optional)</Label>
            <Input 
              type="email" 
              placeholder="sarah@example.com" 
              value={formData.authorEmail}
              onChange={e => setFormData({ ...formData, authorEmail: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-2 p-2 bg-muted/30 rounded-lg w-fit">
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: s })}
                  className="transition-transform active:scale-90"
                >
                  <Star className={`w-6 h-6 ${s <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 py-2">
          <Switch 
            id="verified" 
            checked={formData.verified} 
            onCheckedChange={v => setFormData({ ...formData, verified: v })}
          />
          <Label htmlFor="verified">Mark as Verified Purchase</Label>
        </div>

        <div className="space-y-2">
          <Label>Review Title</Label>
          <Input 
            placeholder="e.g. Excellent product, highly recommended!" 
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Review Body</Label>
          <Textarea 
            placeholder="Write the detailed review here..." 
            rows={5}
            value={formData.body}
            onChange={e => setFormData({ ...formData, body: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Images (Max 3)</Label>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map(i => (
              <ImageUploader 
                key={i}
                onUpload={(url) => {
                  const newImgs = [...images];
                  if (url) newImgs[i] = url;
                  else newImgs.splice(i, 1);
                  setImages(newImgs.filter(Boolean));
                }}
                label={`Image ${i+1}`}
                className="aspect-square"
              />
            ))}
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
          disabled={submitting}
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Review"}
        </Button>
      </div>
    </form>
  );
}
