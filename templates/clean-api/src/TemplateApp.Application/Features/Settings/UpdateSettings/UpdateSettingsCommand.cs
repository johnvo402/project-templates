using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Settings.Common.Models;

namespace TemplateApp.Application.Features.Settings.UpdateSettings;

public sealed record UpdateSettingsCommand(StoreSettingsModel Model) : ICommand<Result>;
