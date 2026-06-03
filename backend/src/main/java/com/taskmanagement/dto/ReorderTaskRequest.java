package com.taskmanagement.dto;

import com.taskmanagement.entity.TaskStatus;

public class ReorderTaskRequest {

    private Long id;
    private TaskStatus status;
    private Integer position;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
}
