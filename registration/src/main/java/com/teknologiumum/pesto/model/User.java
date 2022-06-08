package com.teknologiumum.pesto.model;

import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

public class User implements Validator {

    private String name;
    private String email;
    private String building;
    private Integer calls;

    public User() {
    }

    public User(String name, String email, String building, Integer calls) {
        this.name = name;
        this.email = email;
        this.building = building;
        this.calls = calls;
    }

    @Override
    public boolean supports(Class<?> clazz) {
        // TODO Auto-generated method stub
        return false;
    }

    @Override
    public void validate(Object target, Errors errors) {
        // TODO Auto-generated method stub

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

}
