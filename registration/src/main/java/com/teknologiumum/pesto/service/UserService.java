package com.teknologiumum.pesto.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teknologiumum.pesto.database.DatabaseConnection;
import com.teknologiumum.pesto.model.User;

@Service
public class UserService {

    @Autowired
    DatabaseConnection connection;

    @Autowired
    ObjectMapper toJson;

    public void putUserToWaitlist(User user) {
        try {
            List<User> waitingList = getUserInWaitlist();
            waitingList.add(user);

            String waitingListInJson = toJson.writeValueAsString(waitingList);
            connection.put(DatabaseConnection.CommonKey.waitlist.toString(), waitingListInJson);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    public List<User> getUserInWaitlist() {
        String content = connection.get(DatabaseConnection.CommonKey.waitlist.toString());

        try {
            List<User> listOfUser = toJson.readValue(content, new TypeReference<List<User>>() {
            });
            return listOfUser;
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return new ArrayList<User>();
        }
    }

}
