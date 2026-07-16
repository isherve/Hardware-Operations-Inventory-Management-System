package com.bettina.hardware.config;

import com.bettina.hardware.common.enums.UserType;
import com.bettina.hardware.common.exception.BusinessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

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

    public String getRole() {
        UserPrincipal user = getCurrentUser();
        if (user.getUserType() == UserType.ADMIN) {
            return "ADMIN";
        }
        return user.getRole();
    }

    public boolean hasAnyRole(String... roles) {
        String current = getRole();
        return Arrays.asList(roles).contains(current);
    }

    public void requireAnyRole(String... roles) {
        if (!hasAnyRole(roles)) {
            throw new BusinessException("You do not have permission for this action.");
        }
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public boolean canCreateSales() {
        return hasAnyRole("MANAGER", "CASHIER", "SALES_ASSISTANT");
    }

    public boolean canRefundSales() {
        return hasAnyRole("ADMIN", "MANAGER");
    }

    public boolean canAdjustInventory() {
        return hasAnyRole("ADMIN", "MANAGER");
    }

    public boolean canManageEmployees() {
        return hasAnyRole("ADMIN");
    }

    public boolean canManageProducts() {
        return hasAnyRole("ADMIN");
    }

    public boolean canViewReports() {
        return hasAnyRole("ADMIN", "MANAGER");
    }

    public boolean canManageCustomers() {
        return hasAnyRole("ADMIN", "MANAGER", "CASHIER", "SALES_ASSISTANT");
    }

    public boolean canDeleteCustomers() {
        return hasAnyRole("ADMIN", "MANAGER");
    }

    public boolean canViewSales() {
        return hasAnyRole("ADMIN", "MANAGER", "CASHIER", "SALES_ASSISTANT");
    }

    public boolean seesOnlyOwnSales() {
        return hasAnyRole("CASHIER", "SALES_ASSISTANT");
    }
}
