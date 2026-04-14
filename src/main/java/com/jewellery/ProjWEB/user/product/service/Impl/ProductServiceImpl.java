package com.jewellery.ProjWEB.user.product.service.Impl;

import com.jewellery.ProjWEB.entity.ProductEntity;
import com.jewellery.ProjWEB.user.product.model.ProductDTO;
import com.jewellery.ProjWEB.user.product.model.ProductSearchRequest;
import com.jewellery.ProjWEB.user.product.repository.ProductRepository;
import com.jewellery.ProjWEB.user.product.service.ProductService;
import com.jewellery.ProjWEB.user.product.specification.ProductSpecification;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
@Service("userProductService")
public class ProductServiceImpl implements ProductService {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ModelMapper modelMapper;

//    public List<ProductDTO> findByCategoryId(Integer CategoryID){
//        List<ProductEntity> productEntities= productRepository.findByCategoryId(CategoryID);
//        List<ProductDTO> result = new ArrayList<>();
//        for(ProductEntity item: productEntities){
//            ProductDTO product= new ProductDTO();
//            product.setProductName(item.getProductName());
//            product.setPrice(item.getPrice());
//            product.setDescription(item.getDescription());
//            product.setStatus(item.getStatus());
//            product.setImageURL(item.getImageUrl());
//            result.add(product);
//        }
//        return result;
//    }

//    public List<ProductEntity> searchAndSort(String name, String type){
//        Sort sort;
//        if(type == null){
//            sort= Sort.unsorted();
//        }
//        else {
//            switch (type) {
//                case "name_asc":
//                    sort = Sort.by("productName").ascending(); // tên phải giống trong file entity
//                    break;
//                case "name_desc":
//                    sort = Sort.by("productName").descending();
//                    break;
//                case "price_asc":
//                    sort = Sort.by("price").ascending();
//                    break;
//                case "price_desc":
//                    sort = Sort.by("price").descending();
//                    break;
//                default:
//                    sort = Sort.unsorted();
//            }
//        }
//        List<ProductEntity> entities;
//        if(name == null || name.trim().isEmpty()){
//            entities=productRepository.findAll(sort);
//        }
//        else {
//            entities = productRepository.findByProductNameContaining(name, sort);
//        }
//        return entities;
//    }
//
//    public List<ProductDTO> findByProductNameContaining(String name, String type){
//        List<ProductEntity> productEntities= searchAndSort(name, type);
//        List<ProductDTO> result = new ArrayList<>();
//        for(ProductEntity item: productEntities){
//            ProductDTO product = new ProductDTO();
//            product.setProductName(item.getProductName());
//            product.setPrice(item.getPrice());
//            product.setDescription(item.getDescription());
//            product.setStatus(item.getStatus());
//            product.setImageURL(item.getImageUrl());
//            result.add(product);
//        }
//        return result;
//    }
    public List<ProductDTO> searchandfindProduct(ProductSearchRequest request){

        String sortBy = (request.getSortBy() != null && !request.getSortBy().isEmpty())
                ? request.getSortBy()
                : "productName"; // mặc định sắp xếp theo trường

        String sortDir = (request.getSortDir() != null && !request.getSortDir().isEmpty())
                ? request.getSortDir()
                : "asc"; // mặc định là tăng dần

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Specification<ProductEntity> spec= ProductSpecification.getProduct(request);
        List<ProductEntity> product= productRepository.findAll(spec, sort);
        List<ProductDTO> result = new ArrayList<>();
        for(ProductEntity item: product) {
            ProductDTO p = modelMapper.map(item, ProductDTO.class);
            result.add(p);
        }
        return result;
    }

}
