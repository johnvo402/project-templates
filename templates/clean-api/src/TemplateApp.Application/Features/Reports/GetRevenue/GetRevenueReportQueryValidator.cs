using FluentValidation;

namespace TemplateApp.Application.Features.Reports.GetRevenue;

public sealed class GetRevenueReportQueryValidator : AbstractValidator<GetRevenueReportQuery>
{
    public GetRevenueReportQueryValidator()
    {
        RuleFor(x => x.To).GreaterThanOrEqualTo(x => x.From);
        RuleFor(x => x).Must(x => x.To.DayNumber - x.From.DayNumber <= 366)
            .WithMessage("Revenue report range cannot exceed 366 days.");
    }
}
