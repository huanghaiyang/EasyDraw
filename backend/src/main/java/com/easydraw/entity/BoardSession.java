package com.easydraw.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "board_sessions")
public class BoardSession {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false, columnDefinition = "UUID")
    private UUID id;

    @Column(name = "board_id", nullable = false, columnDefinition = "UUID")
    private UUID boardId;

    @Column(name = "user_id", nullable = false, columnDefinition = "UUID")
    private UUID userId;

    @Column(name = "connected_at", nullable = false, updatable = false)
    private LocalDateTime connectedAt;

    @Column(name = "last_activity_at", nullable = false)
    private LocalDateTime lastActivityAt;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @PrePersist
    protected void onCreate() {
        connectedAt = LocalDateTime.now();
        lastActivityAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastActivityAt = LocalDateTime.now();
    }

}
