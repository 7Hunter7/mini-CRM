import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  STATUS_LABELS,
  type Task,
  type ProjectObject,
  type TaskStatus,
  type Profile,
} from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusColors: Record<TaskStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  review: "bg-purple-100 text-purple-800",
  rework: "bg-orange-100 text-orange-800",
  done: "bg-green-100 text-green-800",
};

export const ObjectPage = () => {
  const { id } = useParams();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const { data: object, isLoading: objectLoading } = useQuery({
    queryKey: ["object", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("objects")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as ProjectObject;
    },
    enabled: !!id,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("object_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!id,
  });

  const { data: executors } = useQuery({
    queryKey: ["executors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "executor");
      if (error) throw error;
      return data as Profile[];
    },
    enabled: profile?.role === "manager",
  });

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tasks").insert([
        {
          title,
          description,
          object_id: id,
          assignee_id: assigneeId,
          author_id: profile?.id,
          status: "new",
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      setIsDialogOpen(false);
      setTitle("");
      setDescription("");
      setAssigneeId("");
    },
    onError: (err) => alert(`Ошибка: ${err.message}`),
  });

  if (objectLoading || tasksLoading)
    return <div className="p-8 text-center">Загрузка...</div>;
  if (!object) return <div className="p-8 text-center">Объект не найден</div>;

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:underline mb-4 inline-block"
        >
          ← Назад к объектам
        </Link>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{object.name}</CardTitle>
            <p className="text-muted-foreground">{object.address}</p>
          </CardHeader>
        </Card>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Задачи ({tasks?.length || 0})
          </h2>
          {profile?.role === "manager" && (
            <Button size="sm" onClick={() => setIsDialogOpen(true)}>
              Добавить задачу
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {tasks?.map((task) => (
            <Link key={task.id} to={`/tasks/${task.id}`}>
              <Card className="hover:shadow-md transition cursor-pointer">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {task.description || "Без описания"}
                    </p>
                  </div>
                  <Badge className={statusColors[task.status]}>
                    {STATUS_LABELS[task.status]}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
          {tasks?.length === 0 && (
            <p className="text-muted-foreground">Задач пока нет.</p>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая задача</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Залить фундамент"
              />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Детали задачи..."
              />
            </div>
            <div className="space-y-2">
              <Label>Исполнитель</Label>
              <Select value={assigneeId} onValueChange={(val) => setAssigneeId(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите исполнителя" />
                </SelectTrigger>
                <SelectContent>
                  {executors?.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={() => createTaskMutation.mutate()}
              disabled={!title || !assigneeId || createTaskMutation.isPending}
            >
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
