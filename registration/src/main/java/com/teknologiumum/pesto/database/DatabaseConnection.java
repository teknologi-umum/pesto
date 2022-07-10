package com.teknologiumum.pesto.database;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.etcd.jetcd.ByteSequence;
import io.etcd.jetcd.Client;
import io.etcd.jetcd.KV;
import io.etcd.jetcd.KeyValue;
import io.etcd.jetcd.Maintenance;
import io.etcd.jetcd.kv.GetResponse;
import io.etcd.jetcd.maintenance.StatusResponse;

@Component
public class DatabaseConnection {
    private String ETCD_ENDPOINT;
    private Client client;

    public DatabaseConnection(@Value("#{environment.ETCD_URL}") String etcdEndpoint) {
        if (etcdEndpoint != null && etcdEndpoint != "") {
            ETCD_ENDPOINT = etcdEndpoint;
        } else {
            ETCD_ENDPOINT = "http://localhost:2379";
        }

        client = Client.builder().endpoints(ETCD_ENDPOINT).build();
    }

    public enum CommonKey {
        waitlist
    }

    public void put(String key, String value) {
        ByteSequence keyBS = ByteSequence.from(key.getBytes());
        ByteSequence valueBS = ByteSequence.from(value.getBytes());
        client.getKVClient().put(keyBS, valueBS);
    }

    public String get(String key) {
        ByteSequence keyBS = ByteSequence.from(key.getBytes());
        KV kvClient = client.getKVClient();

        // get the CompletableFuture
        CompletableFuture<GetResponse> getFuture = kvClient.get(keyBS);

        try {
            // get the value from CompletableFuture
            GetResponse response = getFuture.get();

            // because the return is in List, real value is in the last array
            // idk why tf the librarian design it this way, just use HashMap lah >:(
            List<KeyValue> values = response.getKvs();
            ByteSequence value = values.get(values.size() - 1).getValue();

            return value.toString();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        } catch (IndexOutOfBoundsException e) {
            return "";
        }
        return "";
    }

    public StatusResponse getStatus() {
        Maintenance maintenance = client.getMaintenanceClient();
        try {
            StatusResponse status = maintenance.statusMember(ETCD_ENDPOINT).get();
            return status;
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
        return null;
    }
}
