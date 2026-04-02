package com.easydraw.service;

import com.easydraw.dto.WebSocketMessage;
import com.easydraw.entity.BoardSession;
import com.easydraw.repository.BoardSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;
    private final BoardSessionRepository sessionRepository;

    @Autowired
    public WebSocketService(SimpMessagingTemplate messagingTemplate, BoardSessionRepository sessionRepository) {
        this.messagingTemplate = messagingTemplate;
        this.sessionRepository = sessionRepository;
    }

    @SuppressWarnings("null")
    public void sendMessage(String boardId, WebSocketMessage message) {
        messagingTemplate.convertAndSend("/topic/boards/" + boardId, (Object) message);
    }

    public void createSession(String boardId, String userId) {
        BoardSession session = new BoardSession();
        session.setBoardId(UUID.fromString(boardId));
        session.setUserId(UUID.fromString(userId));
        session.setActive(true);
        sessionRepository.save(session);
    }

    public void updateSession(String boardId, String userId) {
        BoardSession session = sessionRepository.findByBoardIdAndUserIdAndIsActiveTrue(
                UUID.fromString(boardId),
                UUID.fromString(userId)
        );
        if (session != null) {
            sessionRepository.save(session);
        }
    }

    public void closeSession(String boardId, String userId) {
        BoardSession session = sessionRepository.findByBoardIdAndUserIdAndIsActiveTrue(
                UUID.fromString(boardId),
                UUID.fromString(userId)
        );
        if (session != null) {
            session.setActive(false);
            sessionRepository.save(session);
        }
    }

}
