package com.easydraw.service;

import com.easydraw.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationTime = 86400000; // 24小时

    public JwtService() {
        // 使用固定的密钥，确保token在应用重启后仍然有效
        // 注意：在生产环境中，应该使用环境变量或配置文件来管理密钥
        String secret = "your-secret-key-for-jwt-token-generation"; // 替换为更安全的密钥
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
    }

    // 生成token
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId().toString());
        claims.put("username", user.getUsername());
        claims.put("role", user.getRole());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(secretKey)
                .compact();
    }

    // 验证token
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // 从token中获取claims
    public Claims extractClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody();
    }

    // 从token中获取用户名
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    // 从token中获取用户ID
    public String extractUserId(String token) {
        return (String) extractClaims(token).get("userId");
    }

}
