package com.taskmanagement.service;

import com.taskmanagement.entity.Task;
import com.taskmanagement.entity.TaskStatus;
import com.taskmanagement.repository.TaskRepository;
import org.springframework.stereotype.Service;
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

    public Task save(Task task) {
        return taskRepository.save(task);
    }
}
