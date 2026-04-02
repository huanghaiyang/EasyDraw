package com.easydraw.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
public class BoardDto {

    private String id;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ElementDto> elements;

    public BoardDto(String id, String name, LocalDateTime createdAt, LocalDateTime updatedAt, List<ElementDto> elements) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.elements = elements;
    }

}
