package com.bettina.hardware.employee;

import com.bettina.hardware.common.enums.EmployeeRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EmployeeRequest {
    @NotBlank
    private String employeeName;
    @NotNull
    private EmployeeRole role;
    @NotBlank
    private String username;
    private String password;
    private boolean mustChangePassword;
}
