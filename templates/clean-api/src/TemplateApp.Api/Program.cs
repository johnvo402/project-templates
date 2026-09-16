using Mediator;
using TemplateApp.Api.Authentication;
using TemplateApp.Api.Endpoints;
using TemplateApp.Api.Errors;
using TemplateApp.Application;
using TemplateApp.Application.Common.Behaviors;
using TemplateApp.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy
        .WithOrigins("http://localhost:5173", "http://localhost:4200")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

builder.Services.AddMediator(options =>
{
    options.ServiceLifetime = ServiceLifetime.Scoped;
    options.PipelineBehaviors = [typeof(ValidationBehavior<,>)];
});

builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration)
    .AddAppAuthenticationAndAuthorization(builder.Configuration);

var app = builder.Build();

await app.Services.ApplyDatabaseMigrationsAsync();

app.UseExceptionHandler();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().AllowAnonymous();
}

app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
    .WithName("Health")
    .AllowAnonymous();

app.MapAuthEndpoints();
app.MapProfileEndpoints();
app.MapOptionalProfileAvatarEndpoints();
app.MapDashboardEndpoints();
app.MapProductEndpoints();
app.MapOptionalProductImageEndpoints();
app.MapOrderEndpoints();
app.MapEmployeeEndpoints();
app.MapReportEndpoints();
app.MapSettingsEndpoints();
app.MapOptionalAiEndpoints();

app.Run();

public partial class Program;
