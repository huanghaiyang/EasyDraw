package com.easydraw.service;

import com.easydraw.dto.ElementDto;
import com.easydraw.entity.ElementHistory;
import com.easydraw.repository.ElementHistoryRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class HistoryService {

    private static final Logger logger = LoggerFactory.getLogger(HistoryService.class);

    private final ElementHistoryRepository historyRepository;
    private final ElementService elementService;
    private final ObjectMapper objectMapper;

    @Autowired
    public HistoryService(ElementHistoryRepository historyRepository, ElementService elementService) {
        this.historyRepository = historyRepository;
        this.elementService = elementService;
        this.objectMapper = new ObjectMapper();
    }

    @SuppressWarnings("unchecked")
    public void recordHistory(String boardId, String operationType, Map<String, Object> data) {
        try {
            ElementHistory history = new ElementHistory();
            history.setBoardId(UUID.fromString(boardId));
            history.setElementId(UUID.fromString((String) data.get("id")));
            history.setOperationType(operationType);
            
            // 将Map转换为JSON字符串
            if (data.get("beforeData") != null) {
                String beforeDataJson = objectMapper.writeValueAsString(data.get("beforeData"));
                history.setBeforeData(beforeDataJson);
            }
            if (data.get("afterData") != null) {
                String afterDataJson = objectMapper.writeValueAsString(data.get("afterData"));
                history.setAfterData(afterDataJson);
            }
            
            history.setSessionId(UUID.randomUUID());
            historyRepository.save(history);
        } catch (Exception e) {
            logger.error("Error recording history: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to record history", e);
        }
    }

    public List<ElementDto> undo(String boardId) {
        try {
            // 获取最近的操作记录
            ElementHistory history = historyRepository.findTopByBoardIdOrderByOperationAtDesc(UUID.fromString(boardId));
            if (history == null) {
                return List.of();
            }

            // 根据操作类型执行撤销
            List<ElementDto> updatedElements = new ArrayList<>();
            switch (history.getOperationType()) {
                case "create":
                    // 删除创建的组件
                    elementService.deleteElement(boardId, history.getElementId().toString());
                    break;
                case "update":
                    // 恢复到之前的状态
                    if (history.getBeforeData() != null) {
                        Map<String, Object> beforeData = objectMapper.readValue(history.getBeforeData(), Map.class);
                        ElementDto element = elementService.updateElement(boardId, beforeData);
                        updatedElements.add(element);
                    }
                    break;
                case "delete":
                    // 恢复删除的组件
                    if (history.getBeforeData() != null) {
                        Map<String, Object> beforeData = objectMapper.readValue(history.getBeforeData(), Map.class);
                        ElementDto restoredElement = elementService.createElement(boardId, beforeData);
                        updatedElements.add(restoredElement);
                    }
                    break;
            }

            return updatedElements;
        } catch (Exception e) {
            logger.error("Error undoing operation: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to undo operation", e);
        }
    }

    public List<ElementDto> redo(String boardId) {
        // 获取最近的撤销操作记录
        // 执行重做操作
        // 省略实现...
        return List.of();
    }

}
