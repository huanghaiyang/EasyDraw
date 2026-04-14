package com.easydraw.filter;

import com.easydraw.service.JwtService;
import com.easydraw.utils.AuthenticationUtils;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Autowired
    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authorizationHeader = request.getHeader("Authorization");
        String token = AuthenticationUtils.extractTokenFromHeader(authorizationHeader);

        if (token != null && jwtService.validateToken(token)) {
            Claims claims = jwtService.extractClaims(token);
            AuthenticationUtils.setAuthenticationFromClaims(claims);
        }

        filterChain.doFilter(request, response);
    }

}
