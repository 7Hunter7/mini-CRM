import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  STATUS_LABELS,
  type Task,
  type TaskStatus,
  type ProjectObject,
} from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<TaskStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  review: "bg-purple-100 text-purple-800",
  rework: "bg-orange-100 text-orange-800",
  done: "bg-green-100 text-green-800",
};

export const MyTasksPage = () => {
  const { profile } = useAuth();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["my-tasks", profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, objects(name)")
        .eq("assignee_id", profile?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (Task & { objects: Pick<ProjectObject, "name"> })[];
    },
    enabled: !!profile?.id,
  });

  if (isLoading) return <div className="p-8 text-center">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:underline mb-4 inline-block"
        >
          ← Назад к объектам
        </Link>
        <h1 className="text-2xl font-bold mb-6">Мои задачи</h1>

        {tasks?.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              У вас пока нет задач.
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {tasks?.map((task) => (
            <Link key={task.id} to={`/tasks/${task.id}`}>
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Объект: {task.objects?.name || "—"}
                    </p>
                  </div>
                  <Badge className={statusColors[task.status]}>
                    {STATUS_LABELS[task.status]}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
