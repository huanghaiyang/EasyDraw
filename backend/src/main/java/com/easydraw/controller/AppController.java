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
    
    /**
     * 模糊处理邮箱地址
     * @param email 邮箱地址
     * @return 模糊处理后的邮箱地址
     */
    private String maskEmail(String email) {
        if (email == null || email.isEmpty()) {
            return email;
        }
        int atIndex = email.indexOf('@');
        if (atIndex <= 2) {
            // 邮箱前缀太短，只显示第一个字符
            return email.substring(0, 1) + "***" + email.substring(atIndex);
        } else {
            // 显示前两个字符，其余用***替换
            return email.substring(0, 2) + "***" + email.substring(atIndex);
        }
    }
    
    /**
     * 模糊处理ID
     * @param id ID字符串
     * @return 模糊处理后的ID
     */
    private String maskId(String id) {
        if (id == null || id.isEmpty()) {
            return id;
        }
        if (id.length() <= 8) {
            // ID太短，只显示前4个字符
            return id.substring(0, Math.min(4, id.length())) + "***";
        } else {
            // 显示前4个字符和后4个字符，中间用***替换
            return id.substring(0, 4) + "***" + id.substring(id.length() - 4);
        }
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
                user.put("id", maskId(userDto.getId()));
                user.put("name", userDto.getUsername());
                user.put("email", maskEmail(userDto.getEmail()));
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
