package com.jewellery.ProjWEB.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.sql.Timestamp;
import java.util.Date;

@RestControllerAdvice
public class GlobalExceptionHandle {

    @ExceptionHandler({MethodArgumentNotValidException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidationException(Exception e, WebRequest request){
        ErrorResponse errorResponse = new ErrorResponse();
        errorResponse.setTimeStamp(new Date());
        errorResponse.setStatus(HttpStatus.BAD_REQUEST.value());
        errorResponse.setPath(request.getDescription(false).replace("uri=",""));
        errorResponse.setError(HttpStatus.BAD_REQUEST.getReasonPhrase());
        String messsage = e.getMessage();
        int start = messsage.lastIndexOf('[');
        int end = messsage.lastIndexOf(']');
        messsage = e.getMessage().substring(start+1,end-1);
        errorResponse.setMessage(messsage);
        System.out.println();
        return errorResponse;
    }

}
