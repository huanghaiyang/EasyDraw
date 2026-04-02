package com.easydraw.service;

import com.easydraw.dto.ElementDto;
import com.easydraw.entity.ElementHistory;
import com.easydraw.repository.ElementHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class HistoryService {

    private final ElementHistoryRepository historyRepository;
    private final ElementService elementService;

    @Autowired
    public HistoryService(ElementHistoryRepository historyRepository, ElementService elementService) {
        this.historyRepository = historyRepository;
        this.elementService = elementService;
    }

    @SuppressWarnings("unchecked")
    public void recordHistory(String boardId, String operationType, Map<String, Object> data) {
        ElementHistory history = new ElementHistory();
        history.setBoardId(UUID.fromString(boardId));
        history.setElementId(UUID.fromString((String) data.get("id")));
        history.setOperationType(operationType);
        history.setBeforeData((Map<String, Object>) data.get("beforeData"));
        history.setAfterData((Map<String, Object>) data.get("afterData"));
        history.setSessionId(UUID.randomUUID());
        historyRepository.save(history);
    }

    public List<ElementDto> undo(String boardId) {
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
                ElementDto element = elementService.updateElement(boardId, history.getBeforeData());
                updatedElements.add(element);
                break;
            case "delete":
                // 恢复删除的组件
                ElementDto restoredElement = elementService.createElement(boardId, history.getBeforeData());
                updatedElements.add(restoredElement);
                break;
        }

        return updatedElements;
    }

    public List<ElementDto> redo(String boardId) {
        // 获取最近的撤销操作记录
        // 执行重做操作
        // 省略实现...
        return List.of();
    }

}
