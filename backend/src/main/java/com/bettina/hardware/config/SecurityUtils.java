package com.bettina.hardware.config;

import com.bettina.hardware.common.enums.UserType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal;
        }
        throw new IllegalStateException("No authenticated user");
    }

    public boolean isAdmin() {
        return getCurrentUser().getUserType() == UserType.ADMIN;
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
