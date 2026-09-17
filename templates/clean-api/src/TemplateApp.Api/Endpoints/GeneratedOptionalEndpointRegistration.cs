namespace TemplateApp.Api.Endpoints;

public static partial class GeneratedOptionalEndpointRegistration
{
    public static IEndpointRouteBuilder MapGeneratedOptionalEndpoints(this IEndpointRouteBuilder endpoints)
    {
        MapOptionalEndpointGroup1(endpoints);
        MapOptionalEndpointGroup2(endpoints);
        return endpoints;
    }

    static partial void MapOptionalEndpointGroup1(IEndpointRouteBuilder endpoints);
    static partial void MapOptionalEndpointGroup2(IEndpointRouteBuilder endpoints);
}
