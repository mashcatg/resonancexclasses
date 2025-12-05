import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Mail, Calendar, Save } from "lucide-react";

const AdminProfile = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [displayProfile, setDisplayProfile] = useState(profile);

  const getInitials = () => {
    return `${displayProfile?.first_name?.[0] || ''}${displayProfile?.last_name?.[0] || ''}`.toUpperCase() || 'U';
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setDisplayProfile(prev => prev ? { ...prev, first_name: firstName, last_name: lastName } : prev);
      setEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-500 hover:bg-red-600';
      case 'admin':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Profile</h1>
        
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={displayProfile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">
              {displayProfile?.first_name} {displayProfile?.last_name}
            </CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              {displayProfile?.email}
            </CardDescription>
            <div className="flex justify-center mt-2">
              <Badge className={`${getRoleBadgeColor(displayProfile?.role || '')} text-white`}>
                {displayProfile?.role?.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{displayProfile?.first_name} {displayProfile?.last_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{displayProfile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {displayProfile?.created_at ? new Date(displayProfile.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <Button onClick={() => setEditing(true)} variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfile;
