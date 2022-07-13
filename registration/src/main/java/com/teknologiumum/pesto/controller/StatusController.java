package com.teknologiumum.pesto.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teknologiumum.pesto.service.StatusService;

@RestController
public class StatusController {

    @Autowired
    StatusService statusService;

    @GetMapping(path="/healthz", consumes = MediaType.ALL_VALUE, produces = MediaType.TEXT_PLAIN_VALUE )
    public ResponseEntity<Object> getPending() {

        Object status = statusService.getStatus();
        return ResponseEntity.ok(status);
    }

}
