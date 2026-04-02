package com.easydraw.controller;

import com.easydraw.dto.WebSocketMessage;
import com.easydraw.service.ElementService;
import com.easydraw.service.HistoryService;
import com.easydraw.service.WebSocketService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);

    private final WebSocketService webSocketService;
    private final ElementService elementService;
    private final HistoryService historyService;

    @Autowired
    public WebSocketController(WebSocketService webSocketService, ElementService elementService, HistoryService historyService) {
        this.webSocketService = webSocketService;
        this.elementService = elementService;
        this.historyService = historyService;
    }

    @MessageMapping("/boards/{boardId}")
    public void handleMessage(@DestinationVariable String boardId, WebSocketMessage message) {
        // 处理消息，更新数据库
        String operationType = message.getType();
        switch (operationType) {
            case "create":
                elementService.createElement(boardId, message.getData());
                break;
            case "update":
                elementService.updateElement(boardId, message.getData());
                break;
            case "delete":
                elementService.deleteElement(boardId, (String) message.getData().get("id"));
                break;
            default:
                // 处理未知操作类型，记录警告日志
                logger.warn("Unknown operation type: {}", operationType);
                break;
        }

        // 记录操作历史
        historyService.recordHistory(boardId, operationType, message.getData());

        // 广播消息给其他用户
        webSocketService.sendMessage(boardId, message);
    }

}
