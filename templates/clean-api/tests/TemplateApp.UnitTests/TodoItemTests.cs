using TemplateApp.Domain.Common;
using TemplateApp.Domain.Todos;
using TemplateApp.Domain.Todos.Events;

namespace TemplateApp.UnitTests;

public sealed class TodoItemTests
{
    [Fact]
    public void Create_ValidTitle_CreatesAggregateAndRaisesEvent()
    {
        var todo = TodoItem.Create(" Ship template ");

        Assert.NotEqual(Guid.Empty, todo.Id.Value);
        Assert.Equal("Ship template", todo.Title.Value);
        Assert.False(todo.IsCompleted);
        Assert.Single(todo.DomainEvents);
        Assert.IsType<TodoCreatedDomainEvent>(todo.DomainEvents.Single());
    }

    [Fact]
    public void Create_EmptyTitle_ThrowsDomainException()
    {
        var exception = Assert.Throws<DomainException>(() => TodoItem.Create(" "));
        Assert.Equal("Todos.TitleRequired", exception.Code);
    }

    [Fact]
    public void Complete_FirstCall_CompletesAggregateAndRaisesEvent()
    {
        var todo = TodoItem.Create("Ship template");
        todo.ClearDomainEvents();

        todo.Complete();

        Assert.True(todo.IsCompleted);
        Assert.NotNull(todo.CompletedAtUtc);
        Assert.Single(todo.DomainEvents);
        Assert.IsType<TodoCompletedDomainEvent>(todo.DomainEvents.Single());
    }

    [Fact]
    public void Complete_SecondCall_IsIdempotent()
    {
        var todo = TodoItem.Create("Ship template");
        todo.ClearDomainEvents();

        todo.Complete();
        todo.ClearDomainEvents();
        todo.Complete();

        Assert.Empty(todo.DomainEvents);
    }
}
