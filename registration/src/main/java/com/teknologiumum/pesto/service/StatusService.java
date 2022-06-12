package com.teknologiumum.pesto.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teknologiumum.pesto.database.DatabaseConnection;

@Service
public class StatusService {
    @Autowired
    DatabaseConnection connection;

    @Autowired
    ObjectMapper toJson;

    public Object getStatus() {
        return connection.getStatus();
    }
}
