package com.easydraw.controller;

import com.easydraw.dto.BoardDto;
import com.easydraw.service.BoardService;
import com.easydraw.utils.ResponseUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

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
        // 从认证信息获取用户ID
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            // 抛出认证异常
            throw new InsufficientAuthenticationException("User not authenticated");
        }
        // 从JWT token中获取用户ID
        String principal = authentication.getName();
        return UUID.fromString(principal);
    }

    @PostMapping
    public Map<String, Object> createBoard(@RequestBody BoardRequest request) {
        UUID creatorId = this.getSecurityUUID();
        BoardDto boardDto = boardService.createBoard(request.getName(), request.getCategory(), creatorId);
        return ResponseUtils.buildSuccessResponse(boardDto);
    }

    @GetMapping
    public Map<String, Object> getBoards() {
        UUID creatorId = this.getSecurityUUID();
        List<BoardDto> boards = boardService.getBoards(creatorId);
        return ResponseUtils.buildSuccessResponse(boards);
    }

    @GetMapping("/{id}")
    public Map<String, Object> getBoard(@PathVariable String id) {
        BoardDto boardDto = boardService.getBoard(id);
        return ResponseUtils.buildSuccessResponse(boardDto);
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateBoard(@PathVariable String id, @RequestBody BoardRequest request) {
        BoardDto boardDto = boardService.updateBoard(id, request.getName());
        return ResponseUtils.buildSuccessResponse(boardDto);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteBoard(@PathVariable String id) {
        boardService.deleteBoard(id);
        return ResponseUtils.buildSuccessResponse(null);
    }

    // 内部类，用于接收请求参数
    public static class BoardRequest {
        private String name;
        private String category;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }
    }

}
