package com.easydraw.service;

import com.easydraw.dto.ElementDto;
import com.easydraw.entity.Element;
import com.easydraw.repository.ElementRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class ElementService {

    private static final Logger logger = LoggerFactory.getLogger(ElementService.class);

    private final ElementRepository elementRepository;

    @Autowired
    public ElementService(ElementRepository elementRepository) {
        this.elementRepository = elementRepository;
    }

    public ElementDto createElement(String boardId, Map<String, Object> data) {
        try {
            Element element = new Element();
            element.setId(UUID.randomUUID());
            
            // 检查boardId是否为有效UUID
            if (boardId == null || boardId.isEmpty()) {
                throw new IllegalArgumentException("Board ID cannot be null or empty");
            }
            element.setBoardId(UUID.fromString(boardId));
            
            // 添加类型检查和默认值处理
            element.setType(data.get("type") instanceof String ? (String) data.get("type") : "unknown");
            element.setName(data.get("name") instanceof String ? (String) data.get("name") : "untitled");
            element.setData(data);
            
            element = elementRepository.save(element);
            return convertToDto(element);
        } catch (Exception e) {
            logger.error("Error creating element: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create element", e);
        }
    }

    public ElementDto updateElement(String boardId, Map<String, Object> data) {
        try {
            // 检查data和id是否存在
            if (data == null) {
                throw new IllegalArgumentException("Data cannot be null");
            }
            
            Object idObj = data.get("id");
            if (idObj == null) {
                throw new IllegalArgumentException("Element ID cannot be null");
            }
            
            String elementId = idObj instanceof String ? (String) idObj : idObj.toString();
            
            // 检查elementId是否为有效UUID
            if (elementId == null || elementId.isEmpty()) {
                throw new IllegalArgumentException("Element ID cannot be null or empty");
            }
            
            Optional<Element> optionalElement = elementRepository.findById(UUID.fromString(elementId));
            
            if (optionalElement.isPresent()) {
                Element element = optionalElement.get();
                
                // 添加类型检查和默认值处理
                if (data.get("type") instanceof String) {
                    element.setType((String) data.get("type"));
                }
                if (data.get("name") instanceof String) {
                    element.setName((String) data.get("name"));
                }
                element.setData(data);
                
                element = elementRepository.save(element);
                return convertToDto(element);
            } else {
                throw new RuntimeException("Element not found");
            }
        } catch (Exception e) {
            logger.error("Error updating element: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update element", e);
        }
    }

    public void deleteElement(String boardId, String elementId) {
        try {
            // 检查elementId是否为有效UUID
            if (elementId == null || elementId.isEmpty()) {
                throw new IllegalArgumentException("Element ID cannot be null or empty");
            }
            
            elementRepository.deleteById(UUID.fromString(elementId));
        } catch (Exception e) {
            logger.error("Error deleting element: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete element", e);
        }
    }

    public ElementDto getElement(String boardId, String elementId) {
        try {
            // 检查elementId是否为有效UUID
            if (elementId == null || elementId.isEmpty()) {
                throw new IllegalArgumentException("Element ID cannot be null or empty");
            }
            
            Optional<Element> optionalElement = elementRepository.findById(UUID.fromString(elementId));
            return optionalElement.map(this::convertToDto).orElse(null);
        } catch (Exception e) {
            logger.error("Error getting element: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get element", e);
        }
    }

    private ElementDto convertToDto(Element element) {
        try {
            ElementDto dto = new ElementDto();
            dto.setId(element.getId() != null ? element.getId().toString() : null);
            dto.setBoardId(element.getBoardId() != null ? element.getBoardId().toString() : null);
            dto.setType(element.getType());
            dto.setName(element.getName());
            dto.setData(element.getData());
            dto.setCreatedAt(element.getCreatedAt());
            dto.setUpdatedAt(element.getUpdatedAt());
            return dto;
        } catch (Exception e) {
            logger.error("Error converting element to DTO: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to convert element to DTO", e);
        }
    }

}
