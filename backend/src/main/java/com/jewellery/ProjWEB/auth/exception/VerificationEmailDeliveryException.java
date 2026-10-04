package com.jewellery.ProjWEB.auth.exception;

public class VerificationEmailDeliveryException extends RuntimeException {
    public VerificationEmailDeliveryException(Throwable cause) {
        super("Máy chủ chưa gửi được email xác nhận. Vui lòng thử lại sau.", cause);
    }
}
