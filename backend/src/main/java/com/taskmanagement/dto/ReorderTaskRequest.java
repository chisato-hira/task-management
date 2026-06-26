package com.taskmanagement.dto;

import com.taskmanagement.entity.TaskStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class ReorderTaskRequest {

    @NotNull(message = "idは必須です")
    private Long id;

    @NotNull(message = "ステータスは必須です")
    private TaskStatus status;

    @NotNull(message = "positionは必須です")
    @PositiveOrZero(message = "positionは0以上の値を指定してください")
    private Integer position;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
}
