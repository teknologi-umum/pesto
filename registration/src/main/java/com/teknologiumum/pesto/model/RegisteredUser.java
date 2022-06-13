package com.teknologiumum.pesto.model;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;

@JsonAutoDetect(setterVisibility = Visibility.ANY)
public class RegisteredUser {

    @JsonProperty("user_email")
    private String userEmail;
    private Boolean revoked;

    public RegisteredUser(String userEmail) {
        this.userEmail = userEmail;
        this.revoked = false;
    }

    public RegisteredUser() {
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

    private void setRevoked(Boolean revoked) {
        this.revoked = revoked;
    }

    public void revoke() {
        setRevoked(true);
    }
}
