package com.teknologiumum.pesto.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teknologiumum.pesto.database.DatabaseConnection;

@Service
public class StatusService {
    @Autowired
    DatabaseConnection connection;

    @Autowired
    ObjectMapper toJson;

    public Object getStatus() {
        try {
            return toJson.writeValueAsString(connection.getStatus());
        } catch (JsonProcessingException e) {
            System.err.println(e.getMessage());
            return null;
        }
    }
}
