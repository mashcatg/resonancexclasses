import { useEffect, useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FileUpload from "@/components/FileUpload";
import { Plus, Save, Trash2, Edit } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  image_url: string | null;
  is_published: boolean;
}

const TestimonialsManager = () => {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Testimonial | null>(null);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchTestimonials();
    }
  }, [isSuperAdmin]);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems((data as unknown as Testimonial[]) || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const startNew = () => {
    setEditing({ id: '', name: '', role: '', content: '', image_url: '', is_published: true });
  };

  const saveItem = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        const { error } = await supabase
          .from('testimonials' as any)
          .update({
            name: editing.name,
            role: editing.role,
            content: editing.content,
            image_url: editing.image_url,
            is_published: editing.is_published,
          })
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('testimonials' as any)
          .insert({
            name: editing.name,
            role: editing.role,
            content: editing.content,
            image_url: editing.image_url,
            is_published: editing.is_published,
          });
        if (error) throw error;
      }
      toast({ title: 'Saved', description: 'Testimonial saved successfully.' });
      setEditing(null);
      fetchTestimonials();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Testimonial removed.' });
      fetchTestimonials();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleImageUpload = (url: string) => {
    if (editing) setEditing({ ...editing, image_url: url });
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground">Access Denied. Only superadmins can manage testimonials.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Testimonials</h1>
          <Button onClick={startNew}><Plus className="h-4 w-4 mr-2" /> New</Button>
        </div>

        {editing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editing.id ? 'Edit Testimonial' : 'New Testimonial'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={editing.role || ''} onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Opinion</Label>
                <Textarea id="content" value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                <FileUpload bucket="uploads" onUpload={handleImageUpload} />
                <Input placeholder="or paste image URL" value={editing.image_url || ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveItem} disabled={saving}><Save className="h-4 w-4 mr-2" /> Save</Button>
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Opinion</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.role}</TableCell>
                    <TableCell className="max-w-xl truncate">{t.content}</TableCell>
                    <TableCell>{t.image_url ? <img src={t.image_url} className="w-12 h-12 rounded-full object-cover" /> : '—'}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditing(t)}><Edit className="h-4 w-4 mr-1" />Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteItem(t.id)}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestimonialsManager;
