package com.arpit.Skedula.Skedula.controller;

import com.arpit.Skedula.Skedula.dto.BusinessDTO;
import com.arpit.Skedula.Skedula.dto.BusinessServiceOfferedDTO;
import com.arpit.Skedula.Skedula.services.BusinessService;
import com.arpit.Skedula.Skedula.services.BusinessServiceOfferedService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping(path = "/public")
@RequiredArgsConstructor
public class PublicController {

    private final BusinessService businessService;
    private final BusinessServiceOfferedService businessServiceOfferedService;

    // Get All Businesses
    @GetMapping("/getAllBusiness")
    public ResponseEntity<Page<BusinessDTO>> getAllBusiness(@RequestParam(defaultValue = "0") Integer pageOffset,
                                                            @RequestParam(defaultValue = "10", required = false) Integer pageSize) {
        return ResponseEntity.ok(businessService.getAllBusiness(pageOffset, pageSize));
    }

    @GetMapping("/getBusiness/{id}")
    public ResponseEntity<BusinessDTO> getBusiness(@PathVariable Long id) {
        return ResponseEntity.ok(businessService.getBusinessById(id));
    }


    // Get Services By Paging
    @GetMapping("/getAllServices")
    public ResponseEntity<List<BusinessServiceOfferedDTO>> getAllServices()  {
        return ResponseEntity.ok(businessServiceOfferedService.getAllServices());
    }

    // Get Business By City By State By Country BY Keyword
    @GetMapping("/getBusinessByKeyword")
    public ResponseEntity<Page<BusinessDTO>> getBusinessByKeyword(@RequestParam String Keyword,
                                                                  @RequestParam(defaultValue = "0") Integer pageOffset,
                                                                  @RequestParam(defaultValue = "10", required = false) Integer pageSize) {
        return ResponseEntity.ok(businessService.getBusinessByKeyword(pageOffset, pageSize, Keyword));
    }

    @GetMapping("getService/{id}")
    public ResponseEntity<BusinessServiceOfferedDTO> getService(@PathVariable Long id) {
        return ResponseEntity.ok(businessServiceOfferedService.getServiceById(id));
    }

    @GetMapping("/getServiceByKeyword")
    public ResponseEntity<Page<BusinessServiceOfferedDTO>> getServiceByKeyword(@RequestParam String Keyword,
                                                                               @RequestParam(defaultValue = "0") Integer pageOffset,
                                                                               @RequestParam(defaultValue = "10", required = false) Integer pageSize) {
        return ResponseEntity.ok(businessServiceOfferedService.getServiceByKeyword(pageOffset, pageSize, Keyword));
    }

}
