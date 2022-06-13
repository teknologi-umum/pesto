package com.teknologiumum.pesto.model;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;

public class User {

    @NotNull
    private String name;
    @NotNull
    @Email
    private String email;
    @NotNull
    private String building;
    @NotNull
    private Integer calls;

    public User() {
    }

    public User(String name, String email, String building, Integer calls) {
        this.name = name;
        this.email = email;
        this.building = building;
        this.calls = calls;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public Integer getCalls() {
        return calls;
    }

    public void setCalls(Integer calls) {
        this.calls = calls;
    }

    @Override
    public boolean equals(Object arg0) {
        if (arg0 instanceof User) {
            User instance = (User) arg0;
            if (instance.getEmail().equals(this.email)) {
                return true;
            }
        }
        return false;
    }

}
