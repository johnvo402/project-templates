using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Results;
using TemplateApp.Domain.Common;
using TemplateApp.Domain.Settings;
using TemplateApp.Domain.Settings.Specifications;

namespace TemplateApp.Application.Features.Settings.UpdateSettings;

public sealed class UpdateSettingsCommandHandler(IUnitOfWork unitOfWork)
    : ICommandHandler<UpdateSettingsCommand, Result>
{
    public async ValueTask<Result> Handle(UpdateSettingsCommand request, CancellationToken cancellationToken)
    {
        var repository = unitOfWork.Repository<StoreSettings>();
        var settings = await repository.FirstOrDefaultAsync(new StoreSettingsSpecification(), cancellationToken);
        var isNew = settings is null;
        settings ??= StoreSettings.CreateDefault();

        try
        {
            settings.Update(
                request.Model.StoreName,
                request.Model.StoreEmail,
                request.Model.StorePhone,
                request.Model.Currency,
                request.Model.Timezone,
                request.Model.LowStockThreshold);

            if (isNew) await repository.AddAsync(settings, cancellationToken);
            await unitOfWork.SaveAsync(cancellationToken);
            return Result.Success();
        }
        catch (DomainException exception)
        {
            return Result.Failure(new Error(exception.Code, exception.Message, ErrorType.Validation));
        }
    }
}
