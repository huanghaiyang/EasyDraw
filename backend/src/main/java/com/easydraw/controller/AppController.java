package com.easydraw.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AppController {

    @GetMapping("/user")
    public Map<String, Object> getUser() {
        Map<String, Object> user = new HashMap<>();
        user.put("id", "550e8400-e29b-41d4-a716-446655440001");
        user.put("name", "测试用户");
        user.put("email", "test@example.com");
        user.put("role", "user");
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", user);
        response.put("status", "success");
        return response;
    }

    @GetMapping("/config")
    public Map<String, Object> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("appName", "EasyDraw");
        config.put("appVersion", "1.0.0");
        config.put("apiBaseUrl", "/api");
        config.put("websocketUrl", "ws://localhost:8080/ws");
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", config);
        response.put("status", "success");
        return response;
    }

    @GetMapping("/version")
    public Map<String, Object> getVersion() {
        Map<String, Object> response = new HashMap<>();
        response.put("data", "1.0.0");
        response.put("status", "success");
        return response;
    }
}
