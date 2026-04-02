package com.easydraw.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class HistoryDto {

    private String id;
    private String operationType;
    private LocalDateTime operationAt;

    public HistoryDto(String id, String operationType, LocalDateTime operationAt) {
        this.id = id;
        this.operationType = operationType;
        this.operationAt = operationAt;
    }

}
