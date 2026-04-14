package com.jewellery.ProjWEB.user.product.controller;

import com.jewellery.ProjWEB.user.product.model.ProductDTO;
import com.jewellery.ProjWEB.user.product.model.ProductSearchRequest;
import com.jewellery.ProjWEB.user.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("userProductController")
@CrossOrigin(origins = "*")
public class ProductController {
    @Autowired
    private ProductService productService;
//    @GetMapping(value="category/")
//    public List<ProductDTO> getProduct(@RequestParam(required= false) Integer CategoryID){
//        List<ProductDTO> result= productService.findByCategoryId(CategoryID);
//        return result;
//    }

    @GetMapping(value = "/category/")
    public List<ProductDTO> getProductsByCategoryId(
            @RequestParam(value = "id", required = false) Integer categoryId,
            ProductSearchRequest request) {

        // 1. Đồng bộ ID từ tham số ?id= vào đối tượng request
        if (categoryId != null) {
            request.setCategoryId(categoryId);
        }
        System.out.println("ID nhận được là: " + categoryId);
        // 2. Gọi service xử lý (Service này đã có logic lọc, sắp xếp, tìm kiếm theo request)
        List<ProductDTO> result = productService.searchandfindProduct(request);

        return result;
    }

//    @GetMapping(value = "user/product/")
//    public List<ProductDTO> getProductSearch(@RequestParam(required = false) String name,
//                                             @RequestParam(required= false) String type){
//        List<ProductDTO> result= productService.findByProductNameContaining(name, type);
//        return result;
//    }
    @GetMapping(value = "user/product/")
    public List<ProductDTO> getProductSearch( ProductSearchRequest request){
        List<ProductDTO> result = productService.searchandfindProduct(request);
        return result;
    }
//    @GetMapping(value = "category/search/")
//    public List<ProductDTO> getCategoryProductSearch(@RequestParam(required= false) Integer categoryID, ProductSearchRequest request){
//        request.setCategoryId(categoryID);
//        List<ProductDTO> result = productService.searchandfindProduct(request);
//        return result;
//    }

}
