package com.bettina.hardware.common.exception;

public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String resource, Object id) {
        super(resource + " not found: " + id, org.springframework.http.HttpStatus.NOT_FOUND);
    }
}
