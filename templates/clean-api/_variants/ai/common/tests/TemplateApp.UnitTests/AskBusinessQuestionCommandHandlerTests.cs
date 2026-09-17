using TemplateApp.Application.Abstractions.AI;
using TemplateApp.Application.Abstractions.Reporting;
using TemplateApp.Application.Features.AI.BusinessChat;
using TemplateApp.Application.Features.AI.Common.Models;
using TemplateApp.Application.Features.Dashboard.Common.Projections;
using TemplateApp.Application.Features.Reports.Common.Projections;

namespace TemplateApp.UnitTests;

public sealed class AskBusinessQuestionCommandHandlerTests
{
    [Fact]
    public async Task Handle_OutOfScopeQuestion_DoesNotCallBusinessDataOrAiProvider()
    {
        var ai = new FakeAiService("unused");
        var reporting = new FakeReportingService(CreateDashboard());
        var handler = new AskBusinessQuestionCommandHandler(ai, reporting);

        var result = await handler.Handle(
            new AskBusinessQuestionCommand(new BusinessChatModel("Tell me a joke.")),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal(BusinessChatErrors.OutOfScope.Code, result.Error.Code);
        Assert.Equal(0, reporting.DashboardCalls);
        Assert.Equal(0, ai.Calls);
    }

    [Fact]
    public async Task Handle_BusinessDataFailure_ReturnsApplicationServiceUnavailableError()
    {
        var ai = new FakeAiService("unused");
        var reporting = new FakeReportingService(CreateDashboard())
        {
            DashboardException = new InvalidOperationException("database unavailable")
        };
        var handler = new AskBusinessQuestionCommandHandler(ai, reporting);

        var result = await handler.Handle(
            new AskBusinessQuestionCommand(new BusinessChatModel("How is revenue today?")),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal(BusinessChatErrors.BusinessDataUnavailable.Code, result.Error.Code);
        Assert.Equal(1, reporting.DashboardCalls);
        Assert.Equal(0, ai.Calls);
    }

    [Fact]
    public async Task Handle_AiProviderFailure_ReturnsApplicationServiceUnavailableError()
    {
        var ai = new FakeAiService("unused")
        {
            Exception = new InvalidOperationException("provider unavailable")
        };
        var reporting = new FakeReportingService(CreateDashboard());
        var handler = new AskBusinessQuestionCommandHandler(ai, reporting);

        var result = await handler.Handle(
            new AskBusinessQuestionCommand(new BusinessChatModel("Summarize the business situation.")),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal(BusinessChatErrors.ProviderUnavailable.Code, result.Error.Code);
        Assert.Equal(1, reporting.DashboardCalls);
        Assert.Equal(1, ai.Calls);
    }

    [Fact]
    public async Task Handle_EmptyAiResponse_ReturnsApplicationServiceUnavailableError()
    {
        var ai = new FakeAiService("   ");
        var reporting = new FakeReportingService(CreateDashboard());
        var handler = new AskBusinessQuestionCommandHandler(ai, reporting);

        var result = await handler.Handle(
            new AskBusinessQuestionCommand(new BusinessChatModel("Which products are selling best?")),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal(BusinessChatErrors.EmptyResponse.Code, result.Error.Code);
    }

    [Fact]
    public async Task Handle_ValidBusinessQuestion_GroundsProviderPromptInBusinessSnapshot()
    {
        var ai = new FakeAiService("Revenue is healthy based on the supplied snapshot.");
        var reporting = new FakeReportingService(CreateDashboard());
        var handler = new AskBusinessQuestionCommandHandler(ai, reporting);

        var result = await handler.Handle(
            new AskBusinessQuestionCommand(new BusinessChatModel("How is revenue today?")),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("Revenue", result.Value!.Topic);
        Assert.Equal("Revenue is healthy based on the supplied snapshot.", result.Value.Answer);
        Assert.Contains("Revenue today: 125", ai.LastPrompt);
        Assert.Contains("Revenue this month: 2400", ai.LastPrompt);
        Assert.Contains("LATEST QUESTION", ai.LastPrompt);
    }

    private static DashboardProjection CreateDashboard()
        => new(
            RevenueToday: 125m,
            RevenueThisMonth: 2_400m,
            TotalOrders: 18,
            PendingOrders: 3,
            TotalProducts: 12,
            LowStockProducts: 2,
            TotalEmployees: 4,
            Revenue: [new RevenuePointProjection(new DateOnly(2026, 9, 17), 125m)],
            OrdersByStatus: [new OrderStatusProjection("Pending", 3)],
            TopProducts: [new TopProductProjection(Guid.NewGuid(), "Coffee", 8, 320m)],
            RecentOrders: [new RecentOrderProjection(Guid.NewGuid(), "ORD-001", "Customer", "Pending", 50m, DateTimeOffset.UtcNow)]);

    private sealed class FakeAiService(string response) : IAiService
    {
        public int Calls { get; private set; }
        public string LastPrompt { get; private set; } = string.Empty;
        public Exception? Exception { get; init; }

        public Task<string> GenerateTextAsync(string prompt, CancellationToken cancellationToken = default)
        {
            Calls++;
            LastPrompt = prompt;
            if (Exception is not null)
                throw Exception;

            return Task.FromResult(response);
        }
    }

    private sealed class FakeReportingService(DashboardProjection dashboard) : IBusinessReportingService
    {
        public int DashboardCalls { get; private set; }
        public Exception? DashboardException { get; init; }

        public Task<DashboardProjection> GetDashboardAsync(CancellationToken cancellationToken = default)
        {
            DashboardCalls++;
            if (DashboardException is not null)
                throw DashboardException;

            return Task.FromResult(dashboard);
        }

        public Task<IReadOnlyList<RevenuePointProjection>> GetRevenueAsync(
            DateOnly from,
            DateOnly to,
            CancellationToken cancellationToken = default)
            => throw new NotSupportedException();

        public Task<IReadOnlyList<OrderStatusProjection>> GetOrdersByStatusAsync(
            CancellationToken cancellationToken = default)
            => throw new NotSupportedException();

        public Task<IReadOnlyList<TopProductProjection>> GetTopProductsAsync(
            int take,
            CancellationToken cancellationToken = default)
            => throw new NotSupportedException();
    }
}
