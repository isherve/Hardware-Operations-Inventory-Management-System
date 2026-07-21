package com.bettina.hardware.employee;

import com.bettina.hardware.common.enums.EmployeeStatus;
import com.bettina.hardware.common.exception.BusinessException;
import com.bettina.hardware.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public List<EmployeeResponse> findAll() {
        return employeeRepository.findAll().stream().map(this::toResponse).toList();
    }

    public EmployeeResponse findById(Long id) {
        return toResponse(employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id)));
    }

    @Transactional
    public EmployeeResponse create(EmployeeRequest request) {
        if (employeeRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username already exists");
        }
        String password = StringUtils.hasText(request.getPassword()) ? request.getPassword() : "BuiltIn@2024";
        Employee employee = Employee.builder()
                .employeeName(request.getEmployeeName())
                .role(request.getRole())
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(password))
                .status(EmployeeStatus.ACTIVE)
                .mustChangePassword(request.isMustChangePassword() || !StringUtils.hasText(request.getPassword()))
                .build();
        return toResponse(employeeRepository.save(employee));
    }

    @Transactional
    public EmployeeResponse update(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
        if (!employee.getUsername().equals(request.getUsername())
                && employeeRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username already exists");
        }
        employee.setEmployeeName(request.getEmployeeName());
        employee.setRole(request.getRole());
        employee.setUsername(request.getUsername());
        if (StringUtils.hasText(request.getPassword())) {
            employee.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            employee.setMustChangePassword(request.isMustChangePassword());
        }
        return toResponse(employeeRepository.save(employee));
    }

    @Transactional
    public EmployeeResponse terminate(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
        employee.setStatus(EmployeeStatus.TERMINATED);
        return toResponse(employeeRepository.save(employee));
    }

    @Transactional
    public void resetPassword(Long id, String newPassword) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
        employee.setPasswordHash(passwordEncoder.encode(newPassword));
        employee.setMustChangePassword(true);
        employeeRepository.save(employee);
    }

    private EmployeeResponse toResponse(Employee employee) {
        return EmployeeResponse.builder()
                .employeeId(employee.getEmployeeId())
                .employeeName(employee.getEmployeeName())
                .role(employee.getRole())
                .username(employee.getUsername())
                .status(employee.getStatus())
                .mustChangePassword(employee.isMustChangePassword())
                .build();
    }
}
