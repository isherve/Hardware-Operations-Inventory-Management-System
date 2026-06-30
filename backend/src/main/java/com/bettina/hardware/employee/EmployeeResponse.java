package com.bettina.hardware.employee;

import com.bettina.hardware.common.enums.EmployeeRole;
import com.bettina.hardware.common.enums.EmployeeStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmployeeResponse {
    private Long employeeId;
    private String employeeName;
    private EmployeeRole role;
    private String username;
    private EmployeeStatus status;
    private boolean mustChangePassword;
}
