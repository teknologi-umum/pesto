package com.teknologiumum.pesto.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teknologiumum.pesto.service.StatusService;
import com.teknologiumum.pesto.service.UserService;

@RestController
public class StatusController {

    @Autowired
    StatusService statusService;

    @GetMapping("/healthz")
    public ResponseEntity getPending() {

        Object status = statusService.getStatus();
        return ResponseEntity.ok(status);
    }

}
