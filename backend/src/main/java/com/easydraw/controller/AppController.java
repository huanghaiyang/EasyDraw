package com.easydraw.controller;

import com.easydraw.dto.UserDto;
import com.easydraw.service.UserService;
import com.easydraw.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AppController {

    private final UserService userService;
    private final JwtService jwtService;

    @Autowired
    public AppController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @GetMapping("/user")
    public Map<String, Object> getUser(@RequestHeader(value = "Authorization", required = false) String authorization) {
        try {
            // 从Authorization header中获取token
            if (authorization != null && authorization.startsWith("Bearer ")) {
                String token = authorization.substring(7);
                // 解析token获取用户ID
                String userId = jwtService.extractUserId(token);
                // 从数据库中获取真实用户信息
                UserDto userDto = userService.getUser(userId);
                
                Map<String, Object> user = new HashMap<>();
                user.put("id", userDto.getId());
                user.put("name", userDto.getUsername());
                user.put("email", userDto.getEmail());
                user.put("role", userDto.getRole());
                
                Map<String, Object> response = new HashMap<>();
                response.put("data", user);
                response.put("status", "success");
                return response;
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("data", null);
                response.put("status", "error");
                response.put("message", "未授权");
                return response;
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("data", null);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return response;
        }
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
