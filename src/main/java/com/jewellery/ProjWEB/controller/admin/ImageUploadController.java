package com.jewellery.ProjWEB.controller.admin;

import com.jewellery.ProjWEB.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/images")
@RequiredArgsConstructor
public class ImageUploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        Map data = cloudinaryService.uploadImage(file);
        return ResponseEntity.ok(data);
    }
}
