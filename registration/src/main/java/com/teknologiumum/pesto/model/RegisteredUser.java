package com.teknologiumum.pesto.model;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;

@JsonAutoDetect(setterVisibility = Visibility.ANY)
public class RegisteredUser {

    @JsonProperty("user_email")
    private String userEmail;
    @JsonProperty("monthly_limit")
    private Integer monthlyLimit;
    private Boolean revoked;

    public RegisteredUser(String userEmail, Integer monthlyLimit) {
        this.userEmail = userEmail;
        this.monthlyLimit = monthlyLimit;
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

    public Integer getMonthlyLimit() {
        return monthlyLimit;
    }

    public void setMonthlyLimit(Integer monthlyLimit) {
        this.monthlyLimit = monthlyLimit;
    }

    public void revoke() {
        setRevoked(true);
    }
}
