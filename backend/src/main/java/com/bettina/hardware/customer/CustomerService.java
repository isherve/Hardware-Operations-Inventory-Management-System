package com.bettina.hardware.customer;

import com.bettina.hardware.audit.AuditService;
import com.bettina.hardware.common.exception.ResourceNotFoundException;
import com.bettina.hardware.config.SecurityUtils;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final SecurityUtils securityUtils;
    private final AuditService auditService;

    public List<CustomerResponse> findAll(String search) {
        return customerRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("deletedAt")));
            if (StringUtils.hasText(search)) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("customerName")), pattern),
                        cb.like(cb.lower(root.get("phoneNumber")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        }).stream().map(this::toResponse).toList();
    }

    public CustomerResponse findById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        if (customer.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Customer", id);
        }
        return toResponse(customer);
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        securityUtils.requireAnyRole("ADMIN", "MANAGER", "CASHIER", "SALES_ASSISTANT");
        Customer customer = Customer.builder()
                .customerName(request.getCustomerName())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .address(request.getAddress())
                .loyaltyPoints(0)
                .build();
        customer = customerRepository.save(customer);
        auditService.log("CUSTOMER_CREATED", "Customer", customer.getCustomerId(), customer.getCustomerName());
        return toResponse(customer);
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        securityUtils.requireAnyRole("ADMIN", "MANAGER", "CASHIER", "SALES_ASSISTANT");
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        if (customer.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Customer", id);
        }
        customer.setCustomerName(request.getCustomerName());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customerRepository.save(customer);
        auditService.log("CUSTOMER_UPDATED", "Customer", id, customer.getCustomerName());
        return toResponse(customer);
    }

    @Transactional
    public void delete(Long id) {
        securityUtils.requireAnyRole("ADMIN", "MANAGER");
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        customer.setDeletedAt(LocalDateTime.now());
        customerRepository.save(customer);
        auditService.log("CUSTOMER_SOFT_DELETED", "Customer", id, customer.getCustomerName());
    }

    private CustomerResponse toResponse(Customer customer) {
        return CustomerResponse.builder()
                .customerId(customer.getCustomerId())
                .customerName(customer.getCustomerName())
                .phoneNumber(customer.getPhoneNumber())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .loyaltyPoints(customer.getLoyaltyPoints())
                .build();
    }
}
