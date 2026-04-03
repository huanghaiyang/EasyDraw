package com.easydraw.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ElementDto {

    private String id;
    private String boardId;
    private String type;
    private String name;
    private String data;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ElementDto(String id, String type, String name, String data) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.data = data;
    }

}
