package com.teknologiumum.pesto.model;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;

public class UserToken {

    @Email
    private String email;
    @NotNull
    private String token;
    @NotNull
    private Integer limit;

    public UserToken() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Integer getLimit() {
        return limit;
    }

    public void setLimit(Integer limit) {
        this.limit = limit;
    }

}
