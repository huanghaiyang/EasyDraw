package com.easydraw.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "element_history")
public class ElementHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false, columnDefinition = "UUID")
    private UUID id;

    @Column(name = "board_id", nullable = false, columnDefinition = "UUID")
    private UUID boardId;

    @Column(name = "element_id", columnDefinition = "UUID")
    private UUID elementId;

    @Column(name = "operation_type", nullable = false)
    private String operationType;

    @Column(name = "before_data", columnDefinition = "JSONB")
    private String beforeData;

    @Column(name = "after_data", columnDefinition = "JSONB")
    private String afterData;

    @Column(name = "operation_at", nullable = false, updatable = false)
    private LocalDateTime operationAt;

    @Column(name = "session_id", nullable = false, columnDefinition = "UUID")
    private UUID sessionId;

    @PrePersist
    protected void onCreate() {
        operationAt = LocalDateTime.now();
    }

}
