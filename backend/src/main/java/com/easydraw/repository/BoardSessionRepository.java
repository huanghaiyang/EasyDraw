package com.easydraw.repository;

import com.easydraw.entity.BoardSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BoardSessionRepository extends JpaRepository<BoardSession, UUID> {

    List<BoardSession> findByBoardIdAndIsActiveTrue(UUID boardId);

    BoardSession findByBoardIdAndUserIdAndIsActiveTrue(UUID boardId, UUID userId);

}
