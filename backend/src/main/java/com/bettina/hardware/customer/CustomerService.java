package com.bettina.hardware.customer;

import com.bettina.hardware.common.exception.ResourceNotFoundException;
import com.bettina.hardware.config.SecurityUtils;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final SecurityUtils securityUtils;

    public List<CustomerResponse> findAll(String search) {
        return customerRepository.findAll((root, query, cb) -> {
            if (!StringUtils.hasText(search)) {
                return cb.conjunction();
            }
            String pattern = "%" + search.toLowerCase() + "%";
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.like(cb.lower(root.get("customerName")), pattern));
            predicates.add(cb.like(cb.lower(root.get("phoneNumber")), pattern));
            predicates.add(cb.like(cb.lower(root.get("email")), pattern));
            return cb.or(predicates.toArray(new Predicate[0]));
        }).stream().map(this::toResponse).toList();
    }

    public CustomerResponse findById(Long id) {
        return toResponse(customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id)));
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
        return toResponse(customerRepository.save(customer));
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        securityUtils.requireAnyRole("ADMIN", "MANAGER", "CASHIER", "SALES_ASSISTANT");
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        customer.setCustomerName(request.getCustomerName());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        return toResponse(customerRepository.save(customer));
    }

    @Transactional
    public void delete(Long id) {
        securityUtils.requireAnyRole("ADMIN", "MANAGER");
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer", id);
        }
        customerRepository.deleteById(id);
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
