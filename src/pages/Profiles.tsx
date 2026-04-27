import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Loader2, Check, X, Film } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, ViewingProfile } from "@/contexts/AuthContext";
import { AVATAR_OPTIONS, getAvatar } from "@/lib/avatars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const LANGS = [
  { v: "en", l: "English" },
  { v: "es", l: "Español" },
  { v: "fr", l: "Français" },
  { v: "de", l: "Deutsch" },
  { v: "hi", l: "हिन्दी" },
  { v: "ja", l: "日本語" },
  { v: "ko", l: "한국어" },
];

export default function Profiles() {
  const { user, setActiveProfile } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<ViewingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [manage, setManage] = useState(false);
  const [editing, setEditing] = useState<ViewingProfile | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("viewing_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    else setProfiles((data ?? []) as ViewingProfile[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const choose = (p: ViewingProfile) => {
    setActiveProfile(p);
    navigate("/", { replace: true });
  };

  const remove = async (p: ViewingProfile) => {
    if (profiles.length <= 1) {
      toast.error("You must keep at least one profile");
      return;
    }
    if (!confirm(`Delete profile "${p.name}"?`)) return;
    const { error } = await supabase.from("viewing_profiles").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile deleted");
      load();
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Film className="h-10 w-10 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-16">
        <div className="text-center">
          <h1 className="text-display text-4xl md:text-6xl tracking-wide">Who's watching?</h1>
          <p className="mt-3 text-muted-foreground">Pick a profile to start your cinematic experience</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {profiles.map((p, i) => (
            <button
              key={p.id}
              onClick={() => (manage ? setEditing(p) : choose(p))}
              className="group flex flex-col items-center gap-3 outline-none"
            >
              <div className="relative">
                <div className="overflow-hidden rounded-2xl border-2 border-transparent bg-muted transition-all duration-300 group-hover:border-primary group-hover:shadow-gold group-focus-visible:border-primary">
                  <img
                    src={getAvatar(p.avatar_url, i)}
                    alt={p.name}
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                {manage && (
                  <div className="absolute inset-0 grid place-items-center rounded-2xl bg-background/70 opacity-100">
                    <Pencil className="h-7 w-7 text-foreground" />
                  </div>
                )}
                {p.is_kids && (
                  <span className="absolute -top-2 -right-2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
                    KIDS
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-foreground/90 group-hover:text-primary transition-colors">{p.name}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{p.maturity_rating}</p>
              </div>
              {manage && profiles.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(p);
                  }}
                  className="text-xs text-destructive hover:underline flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              )}
            </button>
          ))}

          {profiles.length < 5 && (
            <button
              onClick={() => setCreating(true)}
              className="group flex flex-col items-center gap-3 outline-none"
            >
              <div className="grid aspect-square w-full place-items-center rounded-2xl border-2 border-dashed border-border bg-muted/30 transition-all group-hover:border-primary group-hover:bg-muted/60">
                <Plus className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-base font-medium text-muted-foreground">Add profile</p>
            </button>
          )}
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            variant="outline"
            onClick={() => setManage((m) => !m)}
            className="rounded-full px-6"
          >
            {manage ? <><X className="h-4 w-4" /> Done</> : <><Pencil className="h-4 w-4" /> Manage profiles</>}
          </Button>
        </div>
      </div>

      <ProfileEditor
        profile={editing}
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />

      <ProfileEditor
        profile={null}
        open={creating}
        onOpenChange={setCreating}
        onSaved={() => {
          setCreating(false);
          load();
        }}
      />
    </div>
  );
}

function ProfileEditor({
  profile,
  open,
  onOpenChange,
  onSaved,
}: {
  profile: ViewingProfile | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [language, setLanguage] = useState("en");
  const [maturity, setMaturity] = useState<"kids" | "teen" | "adult">("adult");
  const [isKids, setIsKids] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAvatar(getAvatar(profile.avatar_url, 0));
      setLanguage(profile.language);
      setMaturity(profile.maturity_rating);
      setIsKids(profile.is_kids);
    } else {
      setName("");
      setAvatar(AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)]);
      setLanguage("en");
      setMaturity("adult");
      setIsKids(false);
    }
  }, [profile, open]);

  const save = async () => {
    if (!user) return;
    if (!name.trim()) {
      toast.error("Enter a name");
      return;
    }
    setBusy(true);
    const payload = {
      user_id: user.id,
      name: name.trim().slice(0, 40),
      avatar_url: avatar,
      language,
      maturity_rating: isKids ? "kids" as const : maturity,
      is_kids: isKids,
    };
    const { error } = profile
      ? await supabase.from("viewing_profiles").update(payload).eq("id", profile.id)
      : await supabase.from("viewing_profiles").insert(payload);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success(profile ? "Profile updated" : "Profile created");
      onSaved();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-display text-2xl tracking-wide">
            {profile ? "Edit profile" : "Add profile"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <img src={avatar} alt="Avatar" className="h-20 w-20 rounded-2xl border-2 border-primary/40" />
            <div className="flex-1">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Profile name" />
            </div>
          </div>

          <div>
            <Label>Avatar</Label>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((src) => (
                <button
                  key={src}
                  onClick={() => setAvatar(src)}
                  className={cn(
                    "relative overflow-hidden rounded-xl transition-all",
                    avatar === src ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-80 hover:opacity-100"
                  )}
                >
                  <img src={src} alt="" className="aspect-square w-full" />
                  {avatar === src && (
                    <div className="absolute inset-0 grid place-items-center bg-primary/30">
                      <Check className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGS.map((l) => <SelectItem key={l.v} value={l.v}>{l.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Maturity</Label>
              <Select value={maturity} onValueChange={(v) => setMaturity(v as "kids" | "teen" | "adult")} disabled={isKids}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kids">Kids</SelectItem>
                  <SelectItem value="teen">Teen</SelectItem>
                  <SelectItem value="adult">Adult</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
            <div>
              <p className="font-medium">Kids profile</p>
              <p className="text-xs text-muted-foreground">Only show family-friendly content</p>
            </div>
            <Switch checked={isKids} onCheckedChange={setIsKids} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
