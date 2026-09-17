using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Settings.Common.Projections;

namespace TemplateApp.Application.Features.Settings.GetSettings;

public sealed record GetSettingsQuery : IQuery<Result<StoreSettingsProjection>>;
