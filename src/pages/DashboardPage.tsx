import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS, type ProjectObject } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const DashboardPage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const {
    data: objects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["objects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("objects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProjectObject[];
    },
  });

  const createObjectMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("objects")
        .insert([{ name, address }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objects"] });
      setIsDialogOpen(false);
      setName("");
      setAddress("");
    },
    onError: (err) => alert(`Ошибка: ${err.message}`),
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-background border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Mini CRM</h1>
            <p className="text-xs text-muted-foreground">
              {profile?.email} — {profile ? ROLE_LABELS[profile.role] : ""}
            </p>
          </div>
          <div className="flex gap-4 items-center">
            {profile?.role === "executor" && (
              <Link
                to="/my-tasks"
                className="text-sm font-medium hover:underline"
              >
                Мои задачи
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Объекты</h2>
          {profile?.role === "manager" && (
            <Button onClick={() => setIsDialogOpen(true)}>
              Создать объект
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="text-muted-foreground">Загрузка объектов...</div>
        )}
        {error && (
          <div className="text-destructive">Ошибка: {error.message}</div>
        )}
        {objects && objects.length === 0 && (
          <div className="text-muted-foreground">Объектов пока нет.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {objects?.map((obj) => (
            <Link key={obj.id} to={`/objects/${obj.id}`}>
              <Card className="hover:shadow-md transition cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{obj.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{obj.address}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый объект</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ЖК Северный"
              />
            </div>
            <div className="space-y-2">
              <Label>Адрес</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ул. Строителей, 10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={() => createObjectMutation.mutate()}
              disabled={!name || !address || createObjectMutation.isPending}
            >
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
