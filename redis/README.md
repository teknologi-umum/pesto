# Redis

This directory provides custom Docker image for a more persistent Redis by using
Append Only File and save dump to disk per 60 seconds.

According to redis documentation:

> By default Redis asynchronously dumps the dataset on disk. This mode is
> good enough in many applications, but an issue with the Redis process or
> a power outage may result into a few minutes of writes lost (depending on
> the configured save points).
> 
> The Append Only File is an alternative persistence mode that provides
> much better durability. For instance using the default data fsync policy
> (see later in the config file) Redis can lose just one second of writes in a
> dramatic event like a server power outage, or a single write if something
> wrong with the Redis process itself happens, but the operating system is
> still running correctly.
> 
> AOF and RDB persistence can be enabled at the same time without problems.
> If the AOF is enabled on startup Redis will load the AOF, that is the file
> with the better durability guarantees.
> 
> Please check https://redis.io/topics/persistence for more information.