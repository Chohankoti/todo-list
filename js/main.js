// Abstract class for TodoItemFormatter
class TodoItemFormatter {
  formatTask(task) {
    return task.length > 14 ? task.slice(0, 14) + "..." : task;
  }

  formatDueDate(dueDate) {
    return dueDate || "No due date";
  }

  formatStatus(completed) {
    return completed ? "Completed" : "Pending";
  }
}

// Class responsible for managing Todo items
class TodoManager {
  constructor(todoItemFormatter) {
    this.todos = JSON.parse(localStorage.getItem("todos")) || [];
    this.todoItemFormatter = todoItemFormatter;
  }

  addTodo(task, dueDate) {
    const newTodo = {
      id: this.getRandomId(),
      task: this.todoItemFormatter.formatTask(task),
      dueDate: this.todoItemFormatter.formatDueDate(dueDate),
      completed: false,
      status: "pending",
    };
    this.todos.push(newTodo);
    this.saveToLocalStorage();
    return newTodo;
  }

  editTodo(id, updatedTask) {
      /**
       * This method finds and returns the task with the specified id from the list of todos.
       * @param {number}  id - The identification number of the task to find.
       * @returns {object} The task object that matches the given id. It will return undefined if no matching task is found.
       */
      const todo = this.todos.find((t) => t.id === id);
      if (todo) {
        todo.task = updatedTask;
        this.saveToLocalStorage();
      }
      return todo;
    }
  
    deleteTodo(id) {
      /**
       * Filters and updates the 'todos' array, removing the todo item with the given id.
       * @param {number} id - The id of the todo item to be removed from the 'todos' array.
       * @returns {Array} The updated 'todos' array excluding the removed todo item.
       */
      this.todos = this.todos.filter((todo) => todo.id !== id);
      this.saveToLocalStorage();
    }
  
    toggleTodoStatus(id) {
      /**
       * Retrieves a todo item with a specific id from the list of todos.
       * @param {Number} id - The id of the todo item to be retrieved.
       * @returns {Object} The todo item matching the specified id.
       */
      const todo = this.todos.find((t) => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
        this.saveToLocalStorage();
      }
    }
  
    clearAllTodos() {
      if (this.todos.length > 0) {
        this.todos = [];
        this.saveToLocalStorage();
      }
    }
  
    filterTodos(status) {
      switch (status) {
        case "all":
          return this.todos;
        case "pending":
          /**
           * Filter out all todos that are not completed
           * @returns {Array} Array containing only todos that are yet to be completed
           */
          return this.todos.filter((todo) => !todo.completed);
        case "completed":
          /**
           * Filters the list of 'todos' and returns only the ones that are completed.
           * @returns {Array} An array of completed 'todos'.
           */
          return this.todos.filter((todo) => todo.completed);
        default:
          return [];
      }
    }
  
    getRandomId() {
      return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
      );
    }
  
    saveToLocalStorage() {
      localStorage.setItem("todos", JSON.stringify(this.todos));
    }
}

// Class responsible for managing the UI and handling events
class UIManager {
  constructor(todoManager, todoItemFormatter) {
    this.todoManager = todoManager;
    this.todoItemFormatter = todoItemFormatter;
    this.taskInput = document.querySelector("input");
    this.dateInput = document.querySelector(".schedule-date");
    this.addBtn = document.querySelector(".add-task-button");
    this.todosListBody = document.querySelector(".todos-list-body");
    this.alertMessage = document.querySelector(".alert-message");
    this.deleteAllBtn = document.querySelector(".delete-all-btn");

  this.addEventListeners();
  this.showAllTodos();
  }

  addEventListeners() {
      // Event listener for adding a new todo
      this.addBtn.addEventListener("click", () => {
          this.handleAddTodo();
      });

      // Event listener for pressing Enter key in the task input
      this.taskInput.addEventListener("keyup", (e) => {
          if (e.keyCode === 13 && this.taskInput.value.length > 0) {
              this.handleAddTodo();
          }
      });

      // Event listener for deleting all todos
      this.deleteAllBtn.addEventListener("click", () => {
          this.handleClearAllTodos();
      });

      // Event listeners for filter buttons
      const filterButtons = document.querySelectorAll(".todos-filter li");
      /**
       * Iterates over 'filterButtons' array and adds event listener to each button. 
       * When clicked, the text content of the button is converted to lowercase and passed on to 'handleFilterTodos' method.
       * @param {Array}  filterButtons - An array of button elements to which the event listener is added.
       * @returns {void} Does not return any value.
       */
      filterButtons.forEach((button) => {
          /**
           * This method is an event handler for a button click. It retrieves the button's text, converts it to lowercase and then passes it to the handleFilterTodos function.
           * @param {DOM Event} event - The click event on the button.
           * @returns {undefined} The method does not return anything.
           */
          button.addEventListener("click", () => {
              const status = button.textContent.toLowerCase();
              this.handleFilterTodos(status);
          });
      });
  }

  handleAddTodo() {
    const task = this.taskInput.value;
    const dueDate = this.dateInput.value;
    if (task === "") {
      this.showAlertMessage("Please enter a task", "error");
    } else {
      const newTodo = this.todoManager.addTodo(task, dueDate);
      this.showAllTodos();
      this.taskInput.value = "";
      this.dateInput.value = "";
      this.showAlertMessage("Task added successfully", "success");
    }
  }

  handleClearAllTodos() {
    this.todoManager.clearAllTodos();
    this.showAllTodos();
    this.showAlertMessage("All todos cleared successfully", "success");
  }

  showAllTodos() {
    const todos = this.todoManager.filterTodos("all");
    this.displayTodos(todos);
  }

  displayTodos(todos) {

      this.todosListBody.innerHTML = "";
      
      if (todos.length === 0) {
          this.todosListBody.innerHTML = `<tr><td colspan="5" class="text-center">No task found</td></tr>`;
          return;
        }
        
      /**
       * Iterates over the 'todos' array and for each 'todo' object, 
       * appends a formatted HTML string representation of the object to 'todosListBody' innerHTML.
       * Each 'todo' item and its properties are formatted using 'todoItemFormatter'.
       * Action buttons for 'Edit', 'Toggle Status' and 'Delete' are also included for each 'todo' item. 
       * On click of these buttons, respective functions from 'uiManager' get triggered.
       * @param {Array} todos - An array of 'todo' objects.
       */
      todos.forEach((todo) => {
        this.todosListBody.innerHTML += `
          <tr class="todo-item" data-id="${todo.id}">
            <td>${this.todoItemFormatter.formatTask(todo.task)}</td>
            <td>${this.todoItemFormatter.formatDueDate(todo.dueDate)}</td>
            <td>${this.todoItemFormatter.formatStatus(todo.completed)}</td>
            <td>
              <button class="btn btn-warning btn-sm" onclick="uiManager.handleEditTodo('${
                todo.id
              }')">
                <i class="bx bx-edit-alt bx-bx-xs"></i>    
              </button>
              <button class="btn btn-success btn-sm" onclick="uiManager.handleToggleStatus('${
                todo.id
              }')">
                <i class="bx bx-check bx-xs"></i>
              </button>
              <button class="btn btn-error btn-sm" onclick="uiManager.handleDeleteTodo('${
                todo.id
              }')">
                <i class="bx bx-trash bx-xs"></i>
              </button>
            </td>
          </tr>
        `;
      });
    }
    

  
handleEditTodo(id) {
  /**
   * Method to find a specific todo item using its ID.
   * @param {number}  id - ID of the todo item to be found.
   * @returns {object} Returns a todo item if found, else undefined.
   */
  
  const todo = this.todoManager.todos.find((t) => t.id === id);
  if (todo) {
    this.taskInput.value = todo.task;
    this.todoManager.deleteTodo(id);

    /**
     * Handles the action of updating todos. It changes the HTML content of 'addBtn' to display a plus icon,
     * displays a success alert message saying "Todo updated successfully", 
     * shows all todos, and finally, it removes the click event listener from 'addBtn'.
     * @returns {void} This method does not return anything.
     */
    const handleUpdate = () => {
      this.addBtn.innerHTML = "<i class='bx bx-plus bx-sm'></i>";
      this.showAlertMessage("Todo updated successfully", "success");
      this.showAllTodos();
      this.addBtn.removeEventListener("click", handleUpdate);
    };

    this.addBtn.innerHTML = "<i class='bx bx-check bx-sm'></i>";
    this.addBtn.addEventListener("click", handleUpdate);
  }
}


handleToggleStatus(id) {
this.todoManager.toggleTodoStatus(id);
this.showAllTodos();
}

handleDeleteTodo(id) {
this.todoManager.deleteTodo(id);
this.showAlertMessage("Todo deleted successfully", "success");
this.showAllTodos();
}


handleFilterTodos(status) {
  const filteredTodos = this.todoManager.filterTodos(status);
  this.displayTodos(filteredTodos);
}


showAlertMessage(message, type) {
const alertBox = `
  <div class="alert alert-${type} shadow-lg mb-5 w-full">
    <div>
      <span>${message}</span>
    </div>
  </div>
`;
this.alertMessage.innerHTML = alertBox;
this.alertMessage.classList.remove("hide");
this.alertMessage.classList.add("show");
/**
 * Sets a timeout to remove the 'show' class and add the 'hide' class to 'alertMessage' after 3 seconds.
 */
setTimeout(() => {
  this.alertMessage.classList.remove("show");
  this.alertMessage.classList.add("hide");
}, 3000);
}
}

// Class responsible for managing the theme switcher
class ThemeSwitcher {
constructor(themes, html) {
  this.themes = themes;
  this.html = html;
  this.init();
}

init() {
  const theme = this.getThemeFromLocalStorage();
  if (theme) {
    this.setTheme(theme);
  }

  this.addThemeEventListeners();
}

addThemeEventListeners() {
  /**
   * Processes each theme in the themes list, attaching a click event listener. On click, it retrieves the theme attribute
   * and sets it as the active theme as well as saving it to local storage for persistence.
   */
  this.themes.forEach((theme) => {
    /**
     * An EventListener function that applies a user-selected theme and saves it to localStorage. Triggered when a theme element is clicked.
     * @event 
     * @name theme#click 
     */
    theme.addEventListener("click", () => {
      const themeName = theme.getAttribute("theme");
      this.setTheme(themeName);
      this.saveThemeToLocalStorage(themeName);
    });
  });
}

setTheme(themeName) {
  this.html.setAttribute("data-theme", themeName);
}

saveThemeToLocalStorage(themeName) {
  localStorage.setItem("theme", themeName);
}

getThemeFromLocalStorage() {
  return localStorage.getItem("theme");
}
}



// Instantiating the classes
const todoItemFormatter = new TodoItemFormatter();
const todoManager = new TodoManager(todoItemFormatter);
const uiManager = new UIManager(todoManager, todoItemFormatter);
const themes = document.querySelectorAll(".theme-item");
const html = document.querySelector("html");
const themeSwitcher = new ThemeSwitcher(themes, html);
