using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.AI.Common.Models;

namespace TemplateApp.Application.Features.AI.BusinessChat;

public static class BusinessQuestionPolicy
{
    private static readonly string[] BlockedTerms =
    [
        "medical", "doctor", "medicine", "health diagnosis", "bệnh", "thuốc", "bác sĩ", "chẩn đoán",
        "politics", "election", "president", "chính trị", "bầu cử", "tổng thống",
        "source code", "programming", "javascript", "python", "c#", "lập trình",
        "dating", "relationship advice", "tình yêu", "hẹn hò",
        "ignore previous instructions", "ignore all instructions", "system prompt", "hidden instructions", "jailbreak",
        "bỏ qua hướng dẫn", "bỏ qua chỉ dẫn", "prompt hệ thống"
    ];

    private static readonly string[] ReadOnlyMutationTerms =
    [
        "cancel this order", "cancel order", "create order", "update order",
        "delete product", "remove product", "update product", "change price", "set price",
        "adjust stock", "set stock", "disable employee", "enable employee", "change role",
        "hủy đơn", "huy don", "tạo đơn", "tao don", "cập nhật đơn", "cap nhat don",
        "xóa sản phẩm", "xoa san pham", "cập nhật sản phẩm", "cap nhat san pham",
        "đổi giá", "doi gia", "chỉnh giá", "chinh gia", "cập nhật tồn kho", "cap nhat ton kho",
        "khóa nhân viên", "khoa nhan vien", "mở khóa nhân viên", "mo khoa nhan vien",
        "đổi vai trò", "doi vai tro"
    ];

    private static readonly string[] UnsupportedDataTerms =
    [
        "profit", "gross margin", "net margin", "cogs", "cost", "expense",
        "lợi nhuận", "biên lợi nhuận", "giá vốn", "chi phí",
        "forecast", "prediction", "predict", "dự báo",
        "competitor", "market share", "đối thủ", "thị phần",
        "customer lifetime", "ltv", "retention", "tỷ lệ quay lại",
        "employee performance", "staff performance", "năng suất nhân viên", "hiệu suất nhân viên",
        "tax", "legal advice", "thuế", "tư vấn pháp lý"
    ];

    private static readonly (BusinessQuestionTopic Topic, string[] Terms)[] TopicTerms =
    [
        (BusinessQuestionTopic.Revenue, ["revenue", "sales", "turnover", "doanh thu", "doanh số", "doanh so", "bán hàng", "ban hang"]),
        (BusinessQuestionTopic.Orders, ["order", "orders", "pending", "processing", "completed", "cancelled", "đơn hàng", "don hang", "trạng thái đơn", "đơn chờ", "don cho"]),
        // Match inventory before the broader product terms so questions such as
        // "sản phẩm sắp hết tồn kho" are treated as inventory questions.
        (BusinessQuestionTopic.Inventory, ["inventory", "stock", "low stock", "out of stock", "restock", "reorder", "tồn kho", "ton kho", "hàng tồn", "hang ton", "kho hàng", "kho hang", "sắp hết", "sap het", "hết hàng"]),
        (BusinessQuestionTopic.Products, ["product", "products", "best seller", "best-selling", "bestseller", "top product", "sản phẩm", "san pham", "mặt hàng", "mat hang", "bán chạy", "ban chay"]),
        (BusinessQuestionTopic.Employees, ["employee", "employees", "staff", "workforce", "staff count", "nhân viên", "nhan vien", "nhân sự", "nhan su", "số nhân viên"]),
        (BusinessQuestionTopic.Operations, ["recent", "trend", "recommend", "recommendation", "improve", "action", "risk", "issue", "attention", "gần đây", "gan day", "xu hướng", "đề xuất", "cải thiện", "rủi ro", "rui ro", "vấn đề", "van de", "cần chú ý", "can chu y", "nên làm gì"]),
        (BusinessQuestionTopic.Overview, ["business", "store", "shop", "overview", "performance", "business performance", "store performance", "how are we doing", "kinh doanh", "cửa hàng", "cua hang", "tổng quan", "tình hình", "hoạt động", "hiệu quả kinh doanh", "hieu qua kinh doanh"])
    ];

    private static readonly string[] FollowUpTerms =
    [
        "what about", "how about", "and today", "and yesterday", "why did", "what should",
        "còn", "con ", "thế", "the ", "vậy", "vay ", "tại sao", "tai sao", "vì sao", "vi sao", "nên làm gì", "nen lam gi"
    ];

    public static Result<BusinessQuestionTopic> Assess(
        string question,
        IReadOnlyList<BusinessChatMessageModel>? history)
    {
        var normalized = Normalize(question);

        if (ContainsAny(normalized, BlockedTerms))
            return Result<BusinessQuestionTopic>.Failure(BusinessChatErrors.OutOfScope);

        if (ContainsAny(normalized, ReadOnlyMutationTerms))
            return Result<BusinessQuestionTopic>.Failure(BusinessChatErrors.ReadOnly);

        if (ContainsAny(normalized, UnsupportedDataTerms))
            return Result<BusinessQuestionTopic>.Failure(BusinessChatErrors.UnsupportedData);

        var topic = FindTopic(normalized);
        if (topic is not null)
            return Result<BusinessQuestionTopic>.Success(topic.Value);

        if (history is not null && ContainsAny(normalized, FollowUpTerms))
        {
            foreach (var message in history.Reverse())
            {
                if (!string.Equals(message.Role, "user", StringComparison.OrdinalIgnoreCase))
                    continue;

                var historyTopic = FindTopic(Normalize(message.Content));
                if (historyTopic is not null)
                    return Result<BusinessQuestionTopic>.Success(historyTopic.Value);
            }
        }

        return Result<BusinessQuestionTopic>.Failure(BusinessChatErrors.OutOfScope);
    }

    private static BusinessQuestionTopic? FindTopic(string text)
    {
        foreach (var (topic, terms) in TopicTerms)
        {
            if (ContainsAny(text, terms))
                return topic;
        }

        return null;
    }

    private static bool ContainsAny(string text, IEnumerable<string> terms)
        => terms.Any(term => text.Contains(term, StringComparison.Ordinal));

    private static string Normalize(string value)
        => value.Trim().ToLowerInvariant();
}
