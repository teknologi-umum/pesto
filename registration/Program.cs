using StackExchange.Redis;
using Registration.Services;
using Sentry;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Configuration
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

var redisMultiplexer = ConnectionMultiplexer.Connect(builder.Configuration.GetValue<string>("RedisUrl"));
builder.Services.AddSingleton<IConnectionMultiplexer>(redisMultiplexer);
builder.Services.AddSingleton<WaitingListService>();
builder.Services.AddSingleton<ApprovalService>();
builder.Services.AddSingleton<TrialService>();

builder.Services.AddRouting();
builder.Services.AddHttpClient();
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddLogging();

builder.WebHost.UseSentry(
    options => {
        options.TracesSampler = context => {
            return context.TransactionContext.Name switch {
                "GET /healthz" => 0,
                "GET healthz" => 0,
                _              => 0.4
            };

        };
        options.StackTraceMode = StackTraceMode.Enhanced;
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

app.UseSentryTracing();

app.MapControllers();

app.Run();