using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Settings.Common.Projections;
using TemplateApp.Domain.Settings;
using TemplateApp.Domain.Settings.Specifications;

namespace TemplateApp.Application.Features.Settings.GetSettings;

public sealed class GetSettingsQueryHandler(IUnitOfWork unitOfWork)
    : IQueryHandler<GetSettingsQuery, Result<StoreSettingsProjection>>
{
    public async ValueTask<Result<StoreSettingsProjection>> Handle(GetSettingsQuery request, CancellationToken cancellationToken)
    {
        var settings = await unitOfWork.ReadOnlyRepository<StoreSettings>().FirstOrDefaultAsync(
            new StoreSettingsSpecification(asNoTracking: true),
            GetSettingsMapping.Selector(),
            cancellationToken);

        return Result<StoreSettingsProjection>.Success(settings ?? GetSettingsMapping.Default());
    }
}
