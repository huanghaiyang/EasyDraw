package com.easydraw.utils;

import io.jsonwebtoken.Claims;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;

public class AuthenticationUtils {

    /**
     * 从JWT claims创建并设置认证对象
     * @param claims JWT claims
     */
    public static void setAuthenticationFromClaims(Claims claims) {
        String userId = (String) claims.get("userId");
        String role = (String) claims.get("role");
        
        // 创建认证对象
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userId,
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
        );

        // 设置认证信息到上下文
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    /**
     * 从请求头中提取token
     * @param authorizationHeader Authorization请求头
     * @return token字符串，如果没有则返回null
     */
    public static String extractTokenFromHeader(String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }
        return null;
    }

}
