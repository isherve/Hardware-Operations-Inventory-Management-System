package com.bettina.hardware.config;

import com.bettina.hardware.admin.Admin;
import com.bettina.hardware.admin.AdminRepository;
import com.bettina.hardware.common.enums.EmployeeStatus;
import com.bettina.hardware.common.enums.UserType;
import com.bettina.hardware.common.exception.BusinessException;
import com.bettina.hardware.employee.Employee;
import com.bettina.hardware.employee.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        throw new UsernameNotFoundException("Use login endpoint with user type");
    }

    public UserPrincipal loadAdmin(String username) {
        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Invalid credentials", HttpStatus.UNAUTHORIZED));
        return new UserPrincipal(
                admin.getAdminId(),
                admin.getUsername(),
                admin.getPasswordHash(),
                admin.getAdminName(),
                UserType.ADMIN,
                "ADMIN",
                admin.isMustChangePassword(),
                true
        );
    }

    public UserPrincipal loadEmployee(String username) {
        Employee employee = employeeRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Invalid credentials", HttpStatus.UNAUTHORIZED));
        if (employee.getStatus() == EmployeeStatus.TERMINATED) {
            throw new BusinessException("Account terminated", HttpStatus.FORBIDDEN);
        }
        return new UserPrincipal(
                employee.getEmployeeId(),
                employee.getUsername(),
                employee.getPasswordHash(),
                employee.getEmployeeName(),
                UserType.EMPLOYEE,
                employee.getRole().name(),
                employee.isMustChangePassword(),
                true
        );
    }
}
