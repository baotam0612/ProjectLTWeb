package com.jewellery.ProjWEB.auth.exception;

public class RegistrationConflictException extends IllegalArgumentException {
    public RegistrationConflictException() {
        super("Tên đăng nhập hoặc email đã được sử dụng. Nếu đã đăng ký, hãy xác nhận tài khoản qua email.");
    }
}
