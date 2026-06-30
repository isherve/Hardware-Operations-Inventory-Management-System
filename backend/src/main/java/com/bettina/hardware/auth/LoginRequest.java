package com.bettina.hardware.auth;

import com.bettina.hardware.common.enums.UserType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String username;
    @NotBlank
    private String password;
    @NotNull
    private UserType userType;
}
