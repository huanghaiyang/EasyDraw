package com.easydraw.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "boards")
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false, columnDefinition = "UUID")
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "creator_id", nullable = false, columnDefinition = "UUID")
    private UUID creatorId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
