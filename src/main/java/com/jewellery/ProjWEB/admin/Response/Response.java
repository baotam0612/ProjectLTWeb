package com.jewellery.ProjWEB.admin.Response;


import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

public class Response extends ResponseEntity<Response.Payload> {
    public Response(HttpStatusCode status, String message) {
        super(new Payload(status.value(),message), HttpStatus.OK);
    }

    // GET POST
    public Response(HttpStatusCode status, String message, Object data) {
        super(new Payload(status.value(),message,data), HttpStatus.OK);
    }



    public static class Payload {
        private final int status;
        private final String message;
        private Object data;

        public Payload(int status, String message) {
            this.status = status;
            this.message = message;
        }

        public Payload(int status, String message, Object data) {
            this.status = status;
            this.message = message;
            this.data = data;
        }

        public int getStatus() {
            return status;
        }

        public String getMessage() {
            return message;
        }

        public Object getData() {
            return data;
        }
    }
}