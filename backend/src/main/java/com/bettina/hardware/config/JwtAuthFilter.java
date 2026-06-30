package com.bettina.hardware.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            String username = jwtService.extractUsername(token);
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                String userType = jwtService.extractUserType(token);
                UserPrincipal principal = buildPrincipalFromToken(token, username, userType);
                if (jwtService.isTokenValid(token, principal)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception ignored) {
            // Invalid token — leave unauthenticated
        }

        filterChain.doFilter(request, response);
    }

    private UserPrincipal buildPrincipalFromToken(String token, String username, String userType) {
        var claims = jwtService.extractClaim(token, c -> c);
        return new UserPrincipal(
                claims.get("userId", Long.class),
                username,
                "",
                claims.get("displayName", String.class),
                com.bettina.hardware.common.enums.UserType.valueOf(userType),
                claims.get("role", String.class),
                Boolean.TRUE.equals(claims.get("mustChangePassword", Boolean.class)),
                true
        );
    }
}
