package com.jewellery.ProjWEB.user.product.controller;

import com.jewellery.ProjWEB.user.product.model.ProductDTO;
import com.jewellery.ProjWEB.user.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.web.bind.annotation.RequestMapping;

@RestController("userProductController")
@RequestMapping("/api/public")
public class ProductController {
    @Autowired
    private ProductService productService;

    @GetMapping("/products")
    public List<ProductDTO> getAllPublicProducts() {
        return productService.findAllPublicProducts();
    }

    @GetMapping("/products/category")
    public List<ProductDTO> getProductByCategory(@RequestParam(required= false) Integer categoryId){
        return productService.findByCategoryId(categoryId);
    }
}
