package com.bettina.hardware.employee;

import com.bettina.hardware.common.enums.EmployeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByUsername(String username);
    boolean existsByUsername(String username);
    List<Employee> findByStatus(EmployeeStatus status);
}
