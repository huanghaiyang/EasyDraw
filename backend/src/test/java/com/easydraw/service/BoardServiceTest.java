package com.easydraw.service;

import com.easydraw.dto.BoardDto;
import com.easydraw.entity.Board;
import com.easydraw.repository.BoardRepository;
import com.easydraw.repository.ElementRepository;
import com.easydraw.repository.ElementHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BoardServiceTest {

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private ElementRepository elementRepository;

    @Mock
    private ElementHistoryRepository elementHistoryRepository;

    @InjectMocks
    private BoardService boardService;

    private Board board;
    private UUID boardId;
    private UUID creatorId;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        boardId = UUID.randomUUID();
        creatorId = UUID.randomUUID();
        board = new Board();
        board.setId(boardId);
        board.setName("Test Board");
        board.setCategory("Test Category");
        board.setCreatorId(creatorId);
        board.setDeleted(false);
        board.setCreatedAt(LocalDateTime.now());
        board.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void createBoard() {
        when(boardRepository.save(any(Board.class))).thenReturn(board);

        BoardDto result = boardService.createBoard("Test Board", "Test Category", creatorId);

        assertNotNull(result);
        assertEquals("Test Board", result.getName());
        assertEquals("Test Category", result.getCategory());
        verify(boardRepository, times(1)).save(any(Board.class));
    }

    @Test
    void getBoard() {
        when(boardRepository.findByIdAndIsDeletedFalse(boardId)).thenReturn(board);
        when(elementRepository.findByBoardIdAndIsDeletedFalse(boardId)).thenReturn(new ArrayList<>());

        BoardDto result = boardService.getBoard(boardId.toString());

        assertNotNull(result);
        assertEquals(boardId.toString(), result.getId());
        verify(boardRepository, times(1)).findByIdAndIsDeletedFalse(boardId);
        verify(elementRepository, times(1)).findByBoardIdAndIsDeletedFalse(boardId);
    }

    @Test
    void getBoardNotFound() {
        when(boardRepository.findByIdAndIsDeletedFalse(boardId)).thenReturn(null);

        assertThrows(RuntimeException.class, () -> 
            boardService.getBoard(boardId.toString())
        );
        verify(boardRepository, times(1)).findByIdAndIsDeletedFalse(boardId);
    }

    @Test
    void getBoards() {
        List<Board> boards = new ArrayList<>();
        boards.add(board);
        when(boardRepository.findByCreatorIdAndIsDeletedFalse(creatorId)).thenReturn(boards);

        List<BoardDto> result = boardService.getBoards(creatorId);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(boardRepository, times(1)).findByCreatorIdAndIsDeletedFalse(creatorId);
    }

    @Test
    void updateBoard() {
        when(boardRepository.findByIdAndIsDeletedFalse(boardId)).thenReturn(board);
        when(boardRepository.save(any(Board.class))).thenReturn(board);

        BoardDto result = boardService.updateBoard(boardId.toString(), "Updated Board");

        assertNotNull(result);
        assertEquals("Updated Board", result.getName());
        verify(boardRepository, times(1)).findByIdAndIsDeletedFalse(boardId);
        verify(boardRepository, times(1)).save(any(Board.class));
    }

    @Test
    void updateBoardNotFound() {
        when(boardRepository.findByIdAndIsDeletedFalse(boardId)).thenReturn(null);

        assertThrows(RuntimeException.class, () -> 
            boardService.updateBoard(boardId.toString(), "Updated Board")
        );
        verify(boardRepository, times(1)).findByIdAndIsDeletedFalse(boardId);
    }

    @Test
    void deleteBoard() {
        when(boardRepository.findByIdAndIsDeletedFalse(boardId)).thenReturn(board);
        when(boardRepository.save(any(Board.class))).thenReturn(board);
        when(elementRepository.findByBoardIdAndIsDeletedFalse(boardId)).thenReturn(new ArrayList<>());
        when(elementHistoryRepository.findByBoardIdOrderByOperationAtDesc(boardId)).thenReturn(new ArrayList<>());

        boardService.deleteBoard(boardId.toString());

        verify(boardRepository, times(1)).findByIdAndIsDeletedFalse(boardId);
        verify(boardRepository, times(1)).save(any(Board.class));
        verify(elementRepository, times(1)).findByBoardIdAndIsDeletedFalse(boardId);
        verify(elementHistoryRepository, times(1)).findByBoardIdOrderByOperationAtDesc(boardId);
        verify(elementHistoryRepository, times(1)).deleteAll(anyList());
    }

    @Test
    void deleteBoardNotFound() {
        when(boardRepository.findByIdAndIsDeletedFalse(boardId)).thenReturn(null);

        assertThrows(RuntimeException.class, () -> 
            boardService.deleteBoard(boardId.toString())
        );
        verify(boardRepository, times(1)).findByIdAndIsDeletedFalse(boardId);
    }

}
