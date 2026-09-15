using TemplateApp.Domain.Common.Specifications;

namespace TemplateApp.Domain.Orders.Specifications;

public sealed class ListOrdersSpecification : Specification<Order>
{
    public ListOrdersSpecification(OrderStatus? status = null)
    {
        if (status is not null)
            Query.Where(order => order.Status == status.Value);

        Query.OrderByDescending(order => order.CreatedAt).AsNoTracking();
    }
}
