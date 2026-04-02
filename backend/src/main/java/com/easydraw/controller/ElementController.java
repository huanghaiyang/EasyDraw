package com.easydraw.controller;

import com.easydraw.dto.ElementDto;
import com.easydraw.service.ElementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/boards/{boardId}/elements")
public class ElementController {

    private final ElementService elementService;

    @Autowired
    public ElementController(ElementService elementService) {
        this.elementService = elementService;
    }

    @PostMapping
    public ElementDto createElement(@PathVariable String boardId, @RequestBody ElementRequest request) {
        return elementService.createElement(boardId, request.getData());
    }

    @PutMapping("/{elementId}")
    public ElementDto updateElement(@PathVariable String boardId, @PathVariable String elementId, @RequestBody ElementRequest request) {
        // 将elementId添加到data中，以便ElementService使用
        request.getData().put("id", elementId);
        return elementService.updateElement(boardId, request.getData());
    }

    @DeleteMapping("/{elementId}")
    public void deleteElement(@PathVariable String boardId, @PathVariable String elementId) {
        elementService.deleteElement(boardId, elementId);
    }

    @GetMapping("/{elementId}")
    public ElementDto getElement(@PathVariable String boardId, @PathVariable String elementId) {
        return elementService.getElement(boardId, elementId);
    }

    // 内部类，用于接收请求参数
    public static class ElementRequest {
        private Map<String, Object> data;

        public Map<String, Object> getData() {
            return data;
        }

        public void setData(Map<String, Object> data) {
            this.data = data;
        }
    }

}
