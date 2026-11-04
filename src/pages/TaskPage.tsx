import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  STATUS_LABELS,
  type Task,
  type TaskHistory,
  type TaskStatus,
} from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const statusColors: Record<TaskStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  review: "bg-purple-100 text-purple-800",
  rework: "bg-orange-100 text-orange-800",
  done: "bg-green-100 text-green-800",
};

export const TaskPage = () => {
  const { id } = useParams();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [reworkComment, setReworkComment] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Загрузка задачи
  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Task;
    },
    enabled: !!id,
  });

  // Загрузка истории
  const { data: history } = useQuery({
    queryKey: ["task_history", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_history")
        .select("*")
        .eq("task_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as TaskHistory[];
    },
    enabled: !!id,
  });

  // Мутация для обновления статуса
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      newStatus,
      comment,
    }: {
      newStatus: TaskStatus;
      comment?: string;
    }) => {
      const updates: Partial<Task> = { status: newStatus };
      if (newStatus === "rework") updates.rework_comment = comment || null;

      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      queryClient.invalidateQueries({ queryKey: ["task_history", id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setIsDialogOpen(false);
      setReworkComment("");
    },
    onError: (error) => {
      alert(`Ошибка: ${error.message}`);
    },
  });

  const handleTransition = (newStatus: TaskStatus, comment?: string) => {
    updateStatusMutation.mutate({ newStatus, comment });
  };

  const openReworkDialog = () => {
    setIsDialogOpen(true);
  };

  const submitRework = () => {
    if (!reworkComment.trim()) {
      alert("Комментарий обязателен для возврата на доработку");
      return;
    }
    handleTransition("rework", reworkComment);
  };

  if (taskLoading) return <div className="p-8 text-center">Загрузка...</div>;
  if (!task) return <div className="p-8 text-center">Задача не найдена</div>;

  const isAssignee = task.assignee_id === profile?.id;
  const isManager = profile?.role === "manager";
  const isExecutor = profile?.role === "executor";

  // Логика доступных действий
  const canStart = isExecutor && isAssignee && task.status === "new";
  const canSubmitForReview =
    isExecutor && isAssignee && task.status === "in_progress";
  const canAccept = isManager && task.status === "review";
  const canReject = isManager && task.status === "review";
  const canRework = isExecutor && isAssignee && task.status === "rework";

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to={`/objects/${task.object_id}`}
          className="text-sm text-muted-foreground hover:underline mb-4 inline-block"
        >
          ← Назад к объекту
        </Link>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{task.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Автор: {task.author_id === profile?.id ? "Вы" : "Менеджер"}
                </p>
              </div>
              <Badge className={statusColors[task.status]}>
                {STATUS_LABELS[task.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Описание
              </h3>
              <p className="text-sm">{task.description || "Без описания"}</p>
            </div>
            {task.status === "rework" && task.rework_comment && (
              <div className="bg-orange-50 border border-orange-200 p-3 rounded-md">
                <h3 className="text-sm font-medium text-orange-800 mb-1">
                  Причина возврата на доработку
                </h3>
                <p className="text-sm text-orange-900">{task.rework_comment}</p>
              </div>
            )}

            <Separator />

            {/* Кнопки действий */}
            <div className="flex flex-wrap gap-2">
              {canStart && (
                <Button
                  onClick={() => handleTransition("in_progress")}
                  disabled={updateStatusMutation.isPending}
                >
                  Взять в работу
                </Button>
              )}
              {canSubmitForReview && (
                <Button
                  onClick={() => handleTransition("review")}
                  disabled={updateStatusMutation.isPending}
                >
                  Отправить на проверку
                </Button>
              )}
              {canAccept && (
                <Button
                  onClick={() => handleTransition("done")}
                  disabled={updateStatusMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Принять
                </Button>
              )}
              {canReject && (
                <Button
                  onClick={openReworkDialog}
                  variant="destructive"
                  disabled={updateStatusMutation.isPending}
                >
                  На доработку
                </Button>
              )}
              {canRework && (
                <Button
                  onClick={() => handleTransition("in_progress")}
                  disabled={updateStatusMutation.isPending}
                >
                  Вернуть в работу
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* История */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">История изменений</CardTitle>
          </CardHeader>
          <CardContent>
            {history && history.length > 0 ? (
              <div className="space-y-4">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="text-sm border-l-2 border-muted pl-4 py-1"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">
                        {h.from_status
                          ? STATUS_LABELS[h.from_status as TaskStatus]
                          : "Создана"}{" "}
                        → {STATUS_LABELS[h.to_status as TaskStatus]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(h.created_at).toLocaleString()}
                      </span>
                    </div>
                    {h.comment && (
                      <p className="text-muted-foreground mt-1">
                        Комментарий: {h.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">История пуста.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Модалка возврата на доработку */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Возврат на доработку</DialogTitle>
            <DialogDescription>
              Укажите причину возврата. Этот комментарий увидит исполнитель.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reworkComment}
            onChange={(e) => setReworkComment(e.target.value)}
            placeholder="Что нужно исправить?"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={submitRework}
              disabled={updateStatusMutation.isPending}
            >
              Отправить на доработку
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
