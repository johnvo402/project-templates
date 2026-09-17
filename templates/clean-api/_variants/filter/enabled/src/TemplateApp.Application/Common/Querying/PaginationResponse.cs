using System.Text;
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

    public PaginationResponse<TNext> WithData<TNext>(IReadOnlyList<TNext> data)
        => new(data, Paging);

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

    public static PaginationResponse<T> ForCursor(
        IReadOnlyList<T> data,
        int totalCount,
        int offset,
        int pageSize)
    {
        var totalPage = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);
        var hasPrevious = offset > 0;
        var hasNext = offset + pageSize < totalCount;
        return new(
            data,
            new Paging(
                totalPage,
                null,
                pageSize,
                hasNext,
                hasPrevious,
                hasPrevious ? CursorCodec.Encode(Math.Max(0, offset - pageSize)) : null,
                hasNext ? CursorCodec.Encode(offset + pageSize) : null));
    }
}

public sealed class Paging
{
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? CurrentPage { get; }
    public int PageSize { get; }
    public int TotalPage { get; }
    public bool HasNextPage { get; }
    public bool HasPreviousPage { get; }
    public string? Before { get; }
    public string? After { get; }

    [JsonConstructor]
    internal Paging(
        int totalPage,
        int? currentPage,
        int pageSize,
        bool hasNextPage,
        bool hasPreviousPage,
        string? before = null,
        string? after = null)
    {
        CurrentPage = currentPage;
        PageSize = pageSize;
        TotalPage = totalPage;
        HasNextPage = hasNextPage;
        HasPreviousPage = hasPreviousPage;
        Before = before;
        After = after;
    }
}

public static class CursorCodec
{
    private const string Prefix = "offset:";

    public static string Encode(int offset)
        => Convert.ToBase64String(Encoding.UTF8.GetBytes($"{Prefix}{Math.Max(offset, 0)}"));

    public static bool TryDecode(string? cursor, out int offset)
    {
        offset = 0;
        if (string.IsNullOrWhiteSpace(cursor)) return false;
        try
        {
            var value = Encoding.UTF8.GetString(Convert.FromBase64String(cursor));
            return value.StartsWith(Prefix, StringComparison.Ordinal)
                && int.TryParse(value[Prefix.Length..], out offset)
                && offset >= 0;
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
