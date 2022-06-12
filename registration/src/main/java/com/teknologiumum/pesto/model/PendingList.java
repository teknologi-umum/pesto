package com.teknologiumum.pesto.model;

import java.util.List;

public class PendingList {
    private List<User> waitlist;

    public PendingList() {
    }

    public PendingList(List<User> waitlist) {
        this.waitlist = waitlist;
    }

    public List<User> getWaitlist() {
        return waitlist;
    }

    public void setWaitlist(List<User> waitlist) {
        this.waitlist = waitlist;
    }
}
