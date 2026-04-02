package com.easydraw.controller;

import com.easydraw.dto.ElementDto;
import com.easydraw.service.HistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards/{boardId}/history")
public class HistoryController {

    private final HistoryService historyService;

    @Autowired
    public HistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    @PostMapping("/undo")
    public List<ElementDto> undo(@PathVariable String boardId) {
        return historyService.undo(boardId);
    }

    @PostMapping("/redo")
    public List<ElementDto> redo(@PathVariable String boardId) {
        return historyService.redo(boardId);
    }

}
