package com.teknologiumum.pesto.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ApprovedUser {

    @JsonProperty("user_email")
    private String userEmail;
    private Boolean revoked;

    public ApprovedUser(String userEmail) {
        this.userEmail = userEmail;
        this.revoked = false;
    }

    public ApprovedUser() {
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public Boolean getRevoked() {
        return revoked;
    }

    public void setRevoked(Boolean revoked) {
        this.revoked = revoked;
    }
}
