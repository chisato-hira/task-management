package com.taskmanagement.repository;

import com.taskmanagement.entity.Task;
import com.taskmanagement.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByStatusOrderByPositionAsc(TaskStatus status);

    @Query("SELECT COALESCE(MAX(t.position), -1) FROM Task t WHERE t.status = :status")
    int findMaxPositionByStatus(@Param("status") TaskStatus status);
}
