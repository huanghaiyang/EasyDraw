package com.easydraw.repository;

import com.easydraw.entity.Element;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ElementRepository extends JpaRepository<Element, UUID> {

    List<Element> findByBoardIdAndIsDeletedFalse(UUID boardId);

    Element findByIdAndBoardIdAndIsDeletedFalse(UUID id, UUID boardId);

}
