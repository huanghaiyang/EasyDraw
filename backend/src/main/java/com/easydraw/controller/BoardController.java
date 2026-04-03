package com.easydraw.controller;

import com.easydraw.dto.BoardDto;
import com.easydraw.service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/boards")
public class BoardController {

    private final BoardService boardService;

    @Autowired
    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    private UUID getSecurityUUID() {
        // 暂时使用固定UUID，实际应该从认证信息获取
        // Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // UUID creatorId = UUID.fromString(authentication.getName());
        return UUID.fromString("550e8400-e29b-41d4-a716-446655440001");
    }

    @PostMapping
    public Map<String, Object> createBoard(@RequestBody BoardRequest request) {
        UUID creatorId = this.getSecurityUUID();
        BoardDto boardDto = boardService.createBoard(request.getName(), creatorId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", boardDto);
        response.put("status", "success");
        return response;
    }

    @GetMapping
    public Map<String, Object> getBoards() {
        UUID creatorId = this.getSecurityUUID();
        List<BoardDto> boards = boardService.getBoards(creatorId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", boards);
        response.put("status", "success");
        return response;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getBoard(@PathVariable String id) {
        BoardDto boardDto = boardService.getBoard(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", boardDto);
        response.put("status", "success");
        return response;
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateBoard(@PathVariable String id, @RequestBody BoardRequest request) {
        BoardDto boardDto = boardService.updateBoard(id, request.getName());
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", boardDto);
        response.put("status", "success");
        return response;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteBoard(@PathVariable String id) {
        boardService.deleteBoard(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", null);
        response.put("status", "success");
        return response;
    }

    // 内部类，用于接收请求参数
    public static class BoardRequest {
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

}
