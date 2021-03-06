package com.teknologiumum.pesto.controller;

import java.util.List;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.teknologiumum.pesto.model.PendingList;
import com.teknologiumum.pesto.model.User;
import com.teknologiumum.pesto.model.UserToken;
import com.teknologiumum.pesto.service.UserService;

@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    UserService userService;

    @PostMapping("/register")
    @ResponseBody
    public ResponseEntity<Object> register(@Valid @RequestBody(required = true) User user) {
        boolean isSuccess = userService.putUserToWaitlist(user);
        if (isSuccess) {
            ResponseEntity.ok(user);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } else {
            return ResponseEntity.accepted().build();
        }

    }

    @GetMapping("/pending")
    public ResponseEntity<Object> getPending() {
        List<User> waitlist = userService.getUserInWaitlist();
        if (waitlist.size() != 0) {
            PendingList pendingList = new PendingList(waitlist);
            return ResponseEntity.ok(pendingList);
        }
        return ResponseEntity.ok(waitlist);
    }

    @PutMapping("/approve")
    public ResponseEntity<Object> approve(@Valid @RequestBody(required = true) UserToken user) {
        boolean isDeleted = userService.removeUserFromWaitlist(user.getEmail());
        if (!isDeleted) {
            return ResponseEntity.notFound().build();
        }
        userService.approveUser(user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/revoke")
    public ResponseEntity<Object> revoke(@Valid @RequestBody(required = true) UserToken token) {
        boolean isFound = userService.findUserInApprovalList(token.getToken());
        if (isFound == false) {
            return ResponseEntity.notFound().build();
        }
        userService.revokeUser(token.getToken());
        return ResponseEntity.ok().build();
    }

}
