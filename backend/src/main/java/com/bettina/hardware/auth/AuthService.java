package com.bettina.hardware.auth;

import com.bettina.hardware.admin.Admin;
import com.bettina.hardware.admin.AdminRepository;
import com.bettina.hardware.common.enums.UserType;
import com.bettina.hardware.common.exception.BusinessException;
import com.bettina.hardware.config.CustomUserDetailsService;
import com.bettina.hardware.config.JwtService;
import com.bettina.hardware.config.SecurityUtils;
import com.bettina.hardware.config.UserPrincipal;
import com.bettina.hardware.employee.Employee;
import com.bettina.hardware.employee.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AdminRepository adminRepository;
    private final EmployeeRepository employeeRepository;
    private final SecurityUtils securityUtils;

    public AuthResponse login(LoginRequest request) {
        UserPrincipal principal = request.getUserType() == UserType.ADMIN
                ? userDetailsService.loadAdmin(request.getUsername())
                : userDetailsService.loadEmployee(request.getUsername());

        if (!passwordEncoder.matches(request.getPassword(), principal.getPassword())) {
            throw new BusinessException("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtService.generateToken(principal);
        return toAuthResponse(token, principal);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        UserPrincipal current = securityUtils.getCurrentUser();

        if (current.getUserType() == UserType.ADMIN) {
            Admin admin = adminRepository.findById(current.getId())
                    .orElseThrow(() -> new BusinessException("User not found"));
            if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPasswordHash())) {
                throw new BusinessException("Current password is incorrect");
            }
            admin.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            admin.setMustChangePassword(false);
            adminRepository.save(admin);
        } else {
            Employee employee = employeeRepository.findById(current.getId())
                    .orElseThrow(() -> new BusinessException("User not found"));
            if (!passwordEncoder.matches(request.getCurrentPassword(), employee.getPasswordHash())) {
                throw new BusinessException("Current password is incorrect");
            }
            employee.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            employee.setMustChangePassword(false);
            employeeRepository.save(employee);
        }
    }

    public MeResponse me() {
        UserPrincipal principal = securityUtils.getCurrentUser();
        return MeResponse.builder()
                .userId(principal.getId())
                .username(principal.getUsername())
                .displayName(principal.getDisplayName())
                .userType(principal.getUserType())
                .role(principal.getRole())
                .mustChangePassword(principal.isMustChangePassword())
                .build();
    }

    private AuthResponse toAuthResponse(String token, UserPrincipal principal) {
        return AuthResponse.builder()
                .token(token)
                .userId(principal.getId())
                .username(principal.getUsername())
                .displayName(principal.getDisplayName())
                .userType(principal.getUserType())
                .role(principal.getRole())
                .mustChangePassword(principal.isMustChangePassword())
                .build();
    }
}
