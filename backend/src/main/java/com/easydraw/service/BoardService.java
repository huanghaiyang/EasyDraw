package com.easydraw.service;

import com.easydraw.dto.BoardDto;
import com.easydraw.dto.ElementDto;
import com.easydraw.entity.Board;
import com.easydraw.entity.Element;
import com.easydraw.repository.BoardRepository;
import com.easydraw.repository.ElementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BoardService {

    private final BoardRepository boardRepository;
    private final ElementRepository elementRepository;

    @Autowired
    public BoardService(BoardRepository boardRepository, ElementRepository elementRepository) {
        this.boardRepository = boardRepository;
        this.elementRepository = elementRepository;
    }

    public BoardDto createBoard(String name, UUID creatorId) {
        Board board = new Board();
        board.setName(name);
        board.setCreatorId(creatorId);
        board.setDeleted(false);
        Board savedBoard = boardRepository.save(board);

        return new BoardDto(
                savedBoard.getId().toString(),
                savedBoard.getName(),
                savedBoard.getCreatedAt(),
                savedBoard.getUpdatedAt(),
                List.of()
        );
    }

    public List<BoardDto> getBoards(UUID creatorId) {
        List<Board> boards = boardRepository.findByCreatorIdAndIsDeletedFalse(creatorId);
        return boards.stream()
                .map(board -> new BoardDto(
                        board.getId().toString(),
                        board.getName(),
                        board.getCreatedAt(),
                        board.getUpdatedAt(),
                        List.of()
                ))
                .collect(Collectors.toList());
    }

    public BoardDto getBoard(String boardId) {
        Board board = boardRepository.findByIdAndIsDeletedFalse(UUID.fromString(boardId));
        if (board == null) {
            throw new RuntimeException("Board not found");
        }

        List<Element> elements = elementRepository.findByBoardIdAndIsDeletedFalse(UUID.fromString(boardId));
        List<ElementDto> elementDtos = elements.stream()
                .map(element -> new ElementDto(
                        element.getId().toString(),
                        element.getType(),
                        element.getName(),
                        element.getData()
                ))
                .collect(Collectors.toList());

        return new BoardDto(
                board.getId().toString(),
                board.getName(),
                board.getCreatedAt(),
                board.getUpdatedAt(),
                elementDtos
        );
    }

    public BoardDto updateBoard(String boardId, String name) {
        Board board = boardRepository.findByIdAndIsDeletedFalse(UUID.fromString(boardId));
        if (board == null) {
            throw new RuntimeException("Board not found");
        }

        board.setName(name);
        Board updatedBoard = boardRepository.save(board);

        return new BoardDto(
                updatedBoard.getId().toString(),
                updatedBoard.getName(),
                updatedBoard.getCreatedAt(),
                updatedBoard.getUpdatedAt(),
                List.of()
        );
    }

    public void deleteBoard(String boardId) {
        Board board = boardRepository.findByIdAndIsDeletedFalse(UUID.fromString(boardId));
        if (board == null) {
            throw new RuntimeException("Board not found");
        }

        board.setDeleted(true);
        boardRepository.save(board);

        // 软删除画板下的所有组件
        List<Element> elements = elementRepository.findByBoardIdAndIsDeletedFalse(UUID.fromString(boardId));
        elements.forEach(element -> {
            element.setDeleted(true);
            elementRepository.save(element);
        });
    }

}
