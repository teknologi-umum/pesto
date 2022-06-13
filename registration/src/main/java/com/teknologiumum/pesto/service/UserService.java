package com.teknologiumum.pesto.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teknologiumum.pesto.database.DatabaseConnection;
import com.teknologiumum.pesto.model.ApprovedUser;
import com.teknologiumum.pesto.model.User;
import com.teknologiumum.pesto.model.UserToken;

import io.netty.util.internal.StringUtil;

@Service
public class UserService {

    @Autowired
    DatabaseConnection connection;

    @Autowired
    ObjectMapper toJson;

    public boolean putUserToWaitlist(User user) {
        try {
            List<User> waitingList = getUserInWaitlist();

            for (User iterator : waitingList) {
                if (iterator.equals(user)) {
                    return false;
                }
            }
            waitingList.add(user);
            String waitingListInJson = toJson.writeValueAsString(waitingList);
            connection.put(DatabaseConnection.CommonKey.waitlist.toString(), waitingListInJson);
            return true;
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return false;
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

    public boolean removeUserFromWaitlist(String email) {
        List<User> waitingList = getUserInWaitlist();
        boolean isRemoved = waitingList.removeIf(user -> (user.getEmail().equalsIgnoreCase(email)));

        if (isRemoved) {
            try {
                String waitingListInJson = toJson.writeValueAsString(waitingList);
                connection.put(DatabaseConnection.CommonKey.waitlist.toString(), waitingListInJson);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
        }

        return isRemoved;
    }

    public void approveUser(UserToken user) {
        ApprovedUser approved = new ApprovedUser(user.getEmail());

        try {
            String dbKey = user.getToken();
            String dbValue = toJson.writeValueAsString(approved);
            connection.put(dbKey, dbValue);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    public void revokeUser(String token) {
        String content = connection.get(token);

        try {
            ApprovedUser revokedUser = toJson.readValue(content, new TypeReference<ApprovedUser>() {
            });
            revokedUser.revoke();

            String revokedUserJson = toJson.writeValueAsString(revokedUser);
            connection.put(token, revokedUserJson);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    public boolean findUserInApprovalList(String token) {
        String content = connection.get(token);
        return !StringUtil.isNullOrEmpty(content);
    }

}
