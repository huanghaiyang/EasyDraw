package com.easydraw.controller;

import com.easydraw.dto.AuthDto;
import com.easydraw.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // 用户注册
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody AuthDto.RegisterRequest request) {
        try {
            userService.register(request);
            Map<String, Object> response = new HashMap<>();
            response.put("data", null);
            response.put("status", "success");
            response.put("message", "注册成功");
            return response;
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("data", null);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return response;
        }
    }

    // 用户登录
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody AuthDto.LoginRequest request) {
        try {
            AuthDto.LoginResponse loginResponse = userService.login(request);
            Map<String, Object> response = new HashMap<>();
            response.put("data", loginResponse);
            response.put("status", "success");
            response.put("message", "登录成功");
            return response;
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("data", null);
            response.put("status", "error");
            response.put("message", e.getMessage());
            return response;
        }
    }

}
