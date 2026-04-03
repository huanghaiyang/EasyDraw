package com.easydraw.service;

import com.easydraw.dto.ElementDto;
import com.easydraw.entity.ElementHistory;
import com.easydraw.repository.ElementHistoryRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class HistoryServiceTest {

    @Mock
    private ElementHistoryRepository historyRepository;

    @Mock
    private ElementService elementService;

    @InjectMocks
    private HistoryService historyService;

    private ElementHistory history;
    private UUID boardId;
    private UUID elementId;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() throws JsonProcessingException {
        MockitoAnnotations.openMocks(this);
        objectMapper = new ObjectMapper();
        boardId = UUID.randomUUID();
        elementId = UUID.randomUUID();
        history = new ElementHistory();
        history.setId(UUID.randomUUID());
        history.setBoardId(boardId);
        history.setElementId(elementId);
        history.setOperationType("create");
        history.setBeforeData(objectMapper.writeValueAsString(new HashMap<>()));
        Map<String, Object> afterData = new HashMap<>();
        afterData.put("id", elementId.toString());
        afterData.put("type", "rectangle");
        afterData.put("name", "Test Element");
        history.setAfterData(objectMapper.writeValueAsString(afterData));
        history.setSessionId(UUID.randomUUID());
    }

    @Test
    void recordHistory() {
        Map<String, Object> data = new HashMap<>();
        data.put("id", elementId.toString());
        data.put("type", "rectangle");
        data.put("name", "Test Element");

        when(historyRepository.save(any(ElementHistory.class))).thenReturn(history);

        historyService.recordHistory(boardId.toString(), "create", data);

        verify(historyRepository, times(1)).save(any(ElementHistory.class));
    }

    @Test
    void undo() {
        // 模拟历史记录
        when(historyRepository.findTopByBoardIdOrderByOperationAtDesc(boardId)).thenReturn(history);

        // 模拟元素服务返回（deleteElement返回void，使用doNothing()）
        doNothing().when(elementService).deleteElement(anyString(), anyString());

        List<ElementDto> result = historyService.undo(boardId.toString());

        assertNotNull(result);
        verify(historyRepository, times(1)).findTopByBoardIdOrderByOperationAtDesc(boardId);
        verify(elementService, times(1)).deleteElement(anyString(), anyString());
    }

    @Test
    void undoWithUpdateOperation() throws JsonProcessingException {
        // 修改操作类型为update
        history.setOperationType("update");
        Map<String, Object> beforeData = new HashMap<>();
        beforeData.put("id", elementId.toString());
        beforeData.put("type", "rectangle");
        beforeData.put("name", "Original Element");
        history.setBeforeData(objectMapper.writeValueAsString(beforeData));

        // 模拟历史记录
        when(historyRepository.findTopByBoardIdOrderByOperationAtDesc(boardId)).thenReturn(history);

        // 模拟元素服务返回
        ElementDto elementDto = new ElementDto();
        elementDto.setId(elementId.toString());
        elementDto.setType("rectangle");
        elementDto.setName("Original Element");
        when(elementService.updateElement(anyString(), anyMap())).thenReturn(elementDto);

        List<ElementDto> result = historyService.undo(boardId.toString());

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(historyRepository, times(1)).findTopByBoardIdOrderByOperationAtDesc(boardId);
        verify(elementService, times(1)).updateElement(anyString(), anyMap());
    }

    @Test
    void undoWithDeleteOperation() throws JsonProcessingException {
        // 修改操作类型为delete
        history.setOperationType("delete");
        Map<String, Object> beforeData = new HashMap<>();
        beforeData.put("id", elementId.toString());
        beforeData.put("type", "rectangle");
        beforeData.put("name", "Deleted Element");
        history.setBeforeData(objectMapper.writeValueAsString(beforeData));

        // 模拟历史记录
        when(historyRepository.findTopByBoardIdOrderByOperationAtDesc(boardId)).thenReturn(history);

        // 模拟元素服务返回
        ElementDto elementDto = new ElementDto();
        elementDto.setId(elementId.toString());
        elementDto.setType("rectangle");
        elementDto.setName("Deleted Element");
        when(elementService.createElement(anyString(), anyMap())).thenReturn(elementDto);

        List<ElementDto> result = historyService.undo(boardId.toString());

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(historyRepository, times(1)).findTopByBoardIdOrderByOperationAtDesc(boardId);
        verify(elementService, times(1)).createElement(anyString(), anyMap());
    }

    @Test
    void undoWithNoHistory() {
        // 模拟没有历史记录
        when(historyRepository.findTopByBoardIdOrderByOperationAtDesc(boardId)).thenReturn(null);

        List<ElementDto> result = historyService.undo(boardId.toString());

        assertNotNull(result);
        assertEquals(0, result.size());
        verify(historyRepository, times(1)).findTopByBoardIdOrderByOperationAtDesc(boardId);
    }

    @Test
    void redo() {
        // 由于redo方法目前只是返回空列表，测试其行为
        List<ElementDto> result = historyService.redo(boardId.toString());

        assertNotNull(result);
        assertEquals(0, result.size());
    }

}
