package com.easydraw.repository;

import com.easydraw.entity.ElementHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ElementHistoryRepository extends JpaRepository<ElementHistory, UUID> {

    List<ElementHistory> findByBoardIdOrderByOperationAtDesc(UUID boardId);

    ElementHistory findTopByBoardIdOrderByOperationAtDesc(UUID boardId);

    List<ElementHistory> findByBoardIdAndSessionIdOrderByOperationAtDesc(UUID boardId, UUID sessionId);

}
