using System.Text.Json.Serialization;

namespace TemplateApp.Application.Common.Querying;

public sealed class PaginationResponse<T>
{
    public IReadOnlyList<T> Data { get; }
    public Paging Paging { get; }

    [JsonConstructor]
    private PaginationResponse(IReadOnlyList<T> data, Paging paging)
    {
        Data = data;
        Paging = paging;
    }

    public static PaginationResponse<T> ForPage(
        IReadOnlyList<T> data,
        int totalCount,
        int currentPage,
        int pageSize)
    {
        var totalPage = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);
        return new(
            data,
            new Paging(
                totalPage,
                currentPage,
                pageSize,
                currentPage < totalPage,
                currentPage > 1));
    }

    public PaginationResponse<T> WithData(IReadOnlyList<T> data) => new(data, Paging);
}

public sealed class Paging
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? CurrentPage { get; }
    public int PageSize { get; }
    public int TotalPage { get; }
    public bool HasNextPage { get; }
    public bool HasPreviousPage { get; }

    [JsonConstructor]
    internal Paging(
        int totalPage,
        int? currentPage,
        int pageSize,
        bool hasNextPage,
        bool hasPreviousPage)
    {
        CurrentPage = currentPage;
        PageSize = pageSize;
        TotalPage = totalPage;
        HasNextPage = hasNextPage;
        HasPreviousPage = hasPreviousPage;
    }
}
