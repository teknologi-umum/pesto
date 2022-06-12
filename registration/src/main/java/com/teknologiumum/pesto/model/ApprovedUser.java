package com.teknologiumum.pesto.model;

public class ApprovedUser {

    private String user_email;
    private Boolean revoked;

    public ApprovedUser() {
    }

    public ApprovedUser(String user_email, Boolean revoked) {
        this.user_email = user_email;
        this.revoked = revoked;
    }

    public String getUser_email() {
        return user_email;
    }

    public void setUser_email(String user_email) {
        this.user_email = user_email;
    }

    public Boolean getRevoked() {
        return revoked;
    }

    public void setRevoked(Boolean revoked) {
        this.revoked = revoked;
    }
}
