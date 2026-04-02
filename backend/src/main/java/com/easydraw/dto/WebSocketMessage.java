package com.easydraw.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
public class WebSocketMessage {

    private String type;
    private Map<String, Object> data;

    public WebSocketMessage(String type, Map<String, Object> data) {
        this.type = type;
        this.data = data;
    }

}
