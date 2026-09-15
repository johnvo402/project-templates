using TemplateApp.Domain.Common.Specifications;

namespace TemplateApp.Domain.Orders.Specifications;

public sealed class OrderByIdSpecification : Specification<Order>
{
    public OrderByIdSpecification(OrderId id, bool asNoTracking = false)
    {
        Query.Where(order => order.Id == id).Include(order => order.Items);
        if (asNoTracking) Query.AsNoTracking();
    }
}
