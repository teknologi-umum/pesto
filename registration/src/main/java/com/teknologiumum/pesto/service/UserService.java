package com.teknologiumum.pesto.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teknologiumum.pesto.database.DatabaseConn;
import com.teknologiumum.pesto.model.User;

@Service
public class UserService {

    public void putUserToWaitlist(User user) {
        try {
            List<User> waitingList = getUserInWaitlist();
            waitingList.add(user);

            ObjectMapper om = new ObjectMapper();
            String waitingListInJson = om.writeValueAsString(waitingList);
            new DatabaseConn().put(DatabaseConn.CommonKey.waitlist.toString(), waitingListInJson);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    public List<User> getUserInWaitlist() {
        String content = new DatabaseConn().get(DatabaseConn.CommonKey.waitlist.toString());

        try {
            ObjectMapper om = new ObjectMapper();
            List<User> listOfUser = om.readValue(content, new TypeReference<List<User>>() {
            });
            return listOfUser;
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return new ArrayList<User>();
        }
    }

}
