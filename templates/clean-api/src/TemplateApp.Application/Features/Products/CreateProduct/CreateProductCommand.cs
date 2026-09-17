using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Products.Common.Models;

namespace TemplateApp.Application.Features.Products.CreateProduct;

public sealed record CreateProductCommand(ProductModel Model) : ICommand<Result<Guid>>;
