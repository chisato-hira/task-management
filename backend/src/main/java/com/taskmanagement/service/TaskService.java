package com.taskmanagement.service;

import com.taskmanagement.dto.CreateTaskRequest;
import com.taskmanagement.dto.ReorderTaskRequest;
import com.taskmanagement.dto.UpdateTaskRequest;
import com.taskmanagement.entity.Task;
import com.taskmanagement.entity.TaskStatus;
import com.taskmanagement.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> findAll() {
        return taskRepository.findAll();
    }

    public Optional<Task> findById(Long id) {
        return taskRepository.findById(id);
    }

    public List<Task> findByStatus(TaskStatus status) {
        return taskRepository.findByStatusOrderByPositionAsc(status);
    }

    public Task create(CreateTaskRequest request) {
        TaskStatus status = request.getStatus() != null ? request.getStatus() : TaskStatus.TODO;

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setStatus(status);
        task.setPosition(taskRepository.findMaxPositionByStatus(status) + 1);

        return taskRepository.save(task);
    }

    @Transactional
    public void reorder(List<ReorderTaskRequest> requests) {
        for (ReorderTaskRequest req : requests) {
            taskRepository.findById(req.getId()).ifPresent(task -> {
                task.setStatus(req.getStatus());
                task.setPosition(req.getPosition());
                taskRepository.save(task);
            });
        }
    }

    public Optional<Task> update(Long id, UpdateTaskRequest request) {
        return taskRepository.findById(id).map(task -> {
            task.setTitle(request.getTitle());
            task.setDescription(request.getDescription());
            task.setStatus(request.getStatus());
            task.setPriority(request.getPriority());
            task.setDueDate(request.getDueDate());
            return taskRepository.save(task);
        });
    }

    public boolean deleteById(Long id) {
        if (!taskRepository.existsById(id)) return false;
        taskRepository.deleteById(id);
        return true;
    }

    @Transactional
    public void deleteByStatus(TaskStatus status) {
        taskRepository.deleteAll(taskRepository.findByStatusOrderByPositionAsc(status));
    }

}
