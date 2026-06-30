package com.bettina.hardware.auth;

import com.bettina.hardware.common.enums.UserType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MeResponse {
    private Long userId;
    private String username;
    private String displayName;
    private UserType userType;
    private String role;
    private boolean mustChangePassword;
}
