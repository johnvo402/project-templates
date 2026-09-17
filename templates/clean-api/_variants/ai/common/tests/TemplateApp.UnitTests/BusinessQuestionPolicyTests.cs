using TemplateApp.Application.Features.AI.BusinessChat;
using TemplateApp.Application.Features.AI.Common.Models;

namespace TemplateApp.UnitTests;

public sealed class BusinessQuestionPolicyTests
{
    [Theory]
    [InlineData("Doanh thu tháng này thế nào?", BusinessQuestionTopic.Revenue)]
    [InlineData("How many pending orders do we have?", BusinessQuestionTopic.Orders)]
    [InlineData("Sản phẩm nào đang bán chạy?", BusinessQuestionTopic.Products)]
    [InlineData("Có bao nhiêu sản phẩm sắp hết tồn kho?", BusinessQuestionTopic.Inventory)]
    [InlineData("Tình hình kinh doanh hiện tại ra sao?", BusinessQuestionTopic.Overview)]
    public void Assess_AllowsSupportedBusinessQuestions(string question, BusinessQuestionTopic expectedTopic)
    {
        var result = BusinessQuestionPolicy.Assess(question, null);

        Assert.True(result.IsSuccess);
        Assert.Equal(expectedTopic, result.Value);
    }

    [Fact]
    public void Assess_RejectsUnrelatedQuestion()
    {
        var result = BusinessQuestionPolicy.Assess("Write Python code to scrape a website", null);

        Assert.True(result.IsFailure);
        Assert.Equal(BusinessChatErrors.OutOfScope.Code, result.Error.Code);
    }

    [Fact]
    public void Assess_RejectsMetricThatStarterDoesNotTrack()
    {
        var result = BusinessQuestionPolicy.Assess("Lợi nhuận tháng này là bao nhiêu?", null);

        Assert.True(result.IsFailure);
        Assert.Equal(BusinessChatErrors.UnsupportedData.Code, result.Error.Code);
    }

    [Fact]
    public void Assess_AllowsBusinessFollowUpFromHistory()
    {
        BusinessChatMessageModel[] history =
        [
            new("user", "Doanh thu tháng này thế nào?"),
            new("assistant", "Doanh thu tháng này đang được tổng hợp từ dữ liệu cửa hàng.")
        ];

        var result = BusinessQuestionPolicy.Assess("Còn hôm nay thì sao?", history);

        Assert.True(result.IsSuccess);
        Assert.Equal(BusinessQuestionTopic.Revenue, result.Value);
    }
}
