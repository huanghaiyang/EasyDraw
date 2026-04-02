package com.easydraw.controller;

import com.easydraw.dto.BoardDto;
import com.easydraw.service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID creatorId = UUID.fromString(authentication.getName());
        return creatorId;
    }

    @PostMapping
    public BoardDto createBoard(@RequestBody BoardRequest request) {
        UUID creatorId = this.getSecurityUUID();
        return boardService.createBoard(request.getName(), creatorId);
    }

    @GetMapping
    public List<BoardDto> getBoards() {
        UUID creatorId = this.getSecurityUUID();
        return boardService.getBoards(creatorId);
    }

    @GetMapping("/{id}")
    public BoardDto getBoard(@PathVariable String id) {
        return boardService.getBoard(id);
    }

    @PutMapping("/{id}")
    public BoardDto updateBoard(@PathVariable String id, @RequestBody BoardRequest request) {
        return boardService.updateBoard(id, request.getName());
    }

    @DeleteMapping("/{id}")
    public void deleteBoard(@PathVariable String id) {
        boardService.deleteBoard(id);
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
