package com.easydraw.service;

import com.easydraw.dto.AuthDto;
import com.easydraw.dto.UserDto;
import com.easydraw.entity.User;
import com.easydraw.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // 用户注册
    public UserDto register(AuthDto.RegisterRequest request) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsernameAndIsDeletedFalse(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        // 检查邮箱是否已存在
        if (userRepository.existsByEmailAndIsDeletedFalse(request.getEmail())) {
            throw new RuntimeException("邮箱已被注册");
        }

        // 验证密码强度
        validatePassword(request.getPassword());

        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("user");
        user.setDeleted(false);

        User savedUser = userRepository.save(user);

        return new UserDto(
                savedUser.getId().toString(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getCreatedAt()
        );
    }

    // 用户登录
    public AuthDto.LoginResponse login(AuthDto.LoginRequest request) {
        // 查找用户
        User user = userRepository.findByUsernameAndIsDeletedFalse(request.getUsername())
                .orElseThrow(() -> new RuntimeException("用户名或密码错误"));

        // 验证密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        // 生成JWT token
        String token = jwtService.generateToken(user);

        UserDto userDto = new UserDto(
                user.getId().toString(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );

        return new AuthDto.LoginResponse(token, userDto);
    }

    // 获取用户信息
    public UserDto getUser(String userId) {
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        if (user.isDeleted()) {
            throw new RuntimeException("用户不存在");
        }

        return new UserDto(
                user.getId().toString(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }

    // 验证密码强度
    private void validatePassword(String password) {
        if (password.length() < 6) {
            throw new RuntimeException("密码长度至少6位");
        }
        // 可以添加更多密码强度验证规则
    }

}
