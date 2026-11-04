import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS, type ProjectObject } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DashboardPage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

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
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Выйти
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Объекты</h2>

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
    </div>
  );
};
