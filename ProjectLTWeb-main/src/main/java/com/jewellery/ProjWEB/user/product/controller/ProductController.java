package com.jewellery.ProjWEB.user.product.controller;

import com.jewellery.ProjWEB.user.product.model.ProductDTO;
import com.jewellery.ProjWEB.user.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("userProductController")
public class ProductController {
    @Autowired
    private ProductService productService;
    @GetMapping(value="category/")
    public List<ProductDTO> getProduct(@RequestParam(required= false) Integer CategoryID){
        List<ProductDTO> result= productService.findByCategoryId(CategoryID);
        return result;
    }
}
