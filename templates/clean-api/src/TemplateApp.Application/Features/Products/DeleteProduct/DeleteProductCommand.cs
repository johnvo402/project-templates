using Mediator;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Products.DeleteProduct;

public sealed record DeleteProductCommand(Guid Id) : ICommand<Result>;
