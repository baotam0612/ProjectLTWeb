package com.jewellery.ProjWEB.admin.material.controller;


import com.jewellery.ProjWEB.admin.Response.Response;
import com.jewellery.ProjWEB.admin.category.model.CategoryDTO;
import com.jewellery.ProjWEB.admin.category.service.CategoryService;
import com.jewellery.ProjWEB.admin.material.model.MaterialDTO;
import com.jewellery.ProjWEB.admin.material.model.MaterialRequest;
import com.jewellery.ProjWEB.admin.material.service.MaterialService;
import com.jewellery.ProjWEB.entity.MaterialEntity;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class MaterialController {

    private final MaterialService materialService;
    private final CategoryService categoryService;

    public MaterialController(MaterialService materialService, CategoryService categoryService) {
        this.materialService = materialService;
        this.categoryService = categoryService;
    }

    @GetMapping("/materials")
    public Response materialHomePage(){
        List<MaterialDTO> materialDTOList = materialService.findAll();
        return new Response(HttpStatus.OK, "Query All Materials Success!", materialDTOList);
    }

    @PostMapping("/materials/search")
    public Response materialSearchView(@RequestParam("name") String materialName){
        List<MaterialDTO> materialDTO = materialService.findByName(materialName);
        return new Response(HttpStatus.OK,"Find Success!", materialDTO);
    }

    @PostMapping("/materials")
    public Response createMaterial(@Valid @RequestBody MaterialRequest materialRequest){
        MaterialDTO materialDTO = materialService.findOneByName(materialRequest.getMaterialName());
        System.out.println("ok");
        if(materialDTO != null){
            return new Response(HttpStatus.OK,"Material Name existed!", materialDTO);
        }else{
            MaterialDTO res = new MaterialDTO();
            res = materialService.CreateMaterial(materialRequest);
            return new Response(HttpStatus.CREATED, "Created Success!", res);
        }
    }

    @PutMapping("/materials/{id}")
    public Response updateMaterial(@RequestBody MaterialRequest materialRequest, @PathVariable Integer id){
        MaterialDTO check = materialService.findOneByName(materialRequest.getMaterialName());
        MaterialDTO materialDTO = materialService.UpdateMaterial(materialRequest, id);
        if(materialDTO == null) return new Response(HttpStatus.OK,"MaterialName existed!", "");
        return new Response(HttpStatus.ACCEPTED,"Update Successfully!", materialDTO);
    }

    @DeleteMapping("/materials/{id}")
    public Response deleteMaterial(@PathVariable("id") Integer id) {
        try {
            materialService.deleteMaterial(id);
            return new Response(HttpStatus.OK, "Material deleted successfully!", null);
        } catch (RuntimeException e) {
            return new Response(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }
}
