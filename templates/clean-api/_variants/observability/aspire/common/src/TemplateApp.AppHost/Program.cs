var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.TemplateApp_Api>("api")
    .WithHttpHealthCheck("/health");

builder.Build().Run();
