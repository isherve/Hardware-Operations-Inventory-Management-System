package com.bettina.hardware.customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerRequest {
    @NotBlank
    private String customerName;
    private String phoneNumber;
    @Email
    private String email;
    private String address;
}
