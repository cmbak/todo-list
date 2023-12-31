import { createProject, getProjects, projectsExists, checkIfProjectExists, deleteProject, storeActiveProject, getActiveProject, deleteTodo, getProjectWithName } from "./project_ls";
import { createTodo } from "./todo";
import { getProjectTodos } from "./todo_ls";
import { Project } from "./project";


// EVENT LISTENERS
// Cancel project btn
const cancelBtn = document.getElementById("cancel");
cancelBtn.addEventListener("click", toggleBtnFormVisibility);

// Create project btn
const createProjectBtn = document.getElementById("create-project-btn");
createProjectBtn.addEventListener("click", (event) => {
    event.preventDefault();
    toggleBtnFormVisibility();
});

// Add project button functionality
const addProjectBtn = document.getElementById("add-project-btn");
addProjectBtn.addEventListener("click", () => {
    const projectName = document.getElementById("project-input").value;
    if (projectName == "") {
        alert("Sorry, please enter a valid project name");
        return false;
    } else if (checkIfProjectExists(projectName)) {
        alert("Sorry, a project with that name already exists!");
        return false;
    }
    toggleBtnFormVisibility();
    createProject(projectName);
    addProjectToTab(projectName);
});

// ================================

// Displays the todos for the specified project
const displayTodos = (projectName) => {
    const todos = getProjectTodos(projectName);
    const container = document.getElementById("todos");
    container.innerHTML = "";

    todos.forEach(todo => {
        const todoElement = document.createElement("div");
        const deleteTodoBtn = document.createElement("button");

        todoElement.classList.add("todo-item");
        deleteTodoBtn.innerText = "Delete Todo";
        deleteTodoBtn.classList.add("delete-todo-btn");
        deleteTodoBtn.addEventListener("click", () => {
            deleteTodo(projectName, todo.title);
            displayTodos(projectName);
        });

        todoElement.innerHTML = `
            <h3 class="todo-title priority-${todo.priority}">${todo.title}</h3>
            <p class="todo-desc">${todo.description}</p>
            <p class="todo-date">Due: ${todo.dueDate}</p>
        `;
        todoElement.appendChild(deleteTodoBtn);
        container.appendChild(todoElement);
    })
}

// Used on first reload to add the projects to the sidebar
export const displayStoredProjects = () => {
    if (projectsExists()) {
        const projects = getProjects();
    
        clearProjectsTab();

        projects.forEach(project => {
            addProjectToTab(project);
        });
    }
}

// Gets rid of all the project HTML (NOT FROM LOCAL STORAGE)
const clearProjectsTab = () => {
    const listOfProjects = document.getElementById("projects");
    while (listOfProjects.firstChild) {
        listOfProjects.removeChild(listOfProjects.firstChild);
    }
}

// Toggles the visibility of the create project button and project form
function toggleBtnFormVisibility() {
    toggleCreateProject();
    displayProjectForm();
}

// Create project button events

// Display the form for creating a project 
export const toggleCreateProject = () => {
    createProjectBtn.classList.toggle("hidden");
}

// Display add project form
export const displayProjectForm = () => { // TODO rename to toggle
    const addProjectForm = document.getElementById("add-project-form");
    addProjectForm.classList.toggle("hidden");
    // Make sure input is empty once hidden
    document.getElementById("project-input").value = "";
};

// Project tab functionality

// Adds project to project tab
const addProjectToTab = projectName => {
    const listOfProjects = document.getElementById("projects");
    
    const projectElement = document.createElement("li");
    const projectNameButton = document.createElement("button");
    const projectContainer = document.createElement("div");
    const projectText = document.createTextNode(projectName);

    if (projectName == getActiveProject()) {
        setActiveProject(projectName, projectNameButton);
    }
    projectNameButton.classList.add("project-name-btn");
    projectNameButton.addEventListener("click", () => setActiveProject(projectName, projectNameButton));
    projectElement.classList.add("project-name");
    projectElement.appendChild(projectNameButton);
    projectContainer.classList.add('project-container');
    projectContainer.appendChild(projectElement);
    projectContainer.appendChild(createDeleteProjectForm(projectName));

    projectNameButton.appendChild(projectText);
    listOfProjects.appendChild(projectContainer);
}

// Delete project form (fn returns a html form)
const createDeleteProjectForm = (projectName) => {
    const form = document.createElement("form");
    const deleteBtn = document.createElement("button");    
    form.appendChild(deleteBtn);

    deleteBtn.innerText = "Delete";
    deleteBtn.value = projectName;
    deleteBtn.classList.add("delete-project-btn");
    deleteBtn.addEventListener("click", event => {
        event.preventDefault();
        deleteProject(projectName);
        clearActiveProjects();
        document.getElementById("todo-container").innerHTML = "";
        displayStoredProjects();
    });
    return form;
}

// should set value of submit to current active project
const setActiveProject = (projectName, projectNameButton) => {
    clearActiveProjects();
    projectNameButton.classList.toggle("active-project");
    addTodoFormsContainer(projectName);
    storeActiveProject(projectName);
    displayTodos(projectName);
}

// Gets rid of the active project class from project buttons
const clearActiveProjects = () => {
    Array.prototype.forEach.call(document.getElementsByClassName("project-name-btn"), projectBtn => {
        projectBtn.classList.remove("active-project");
    });
}

// Adds the create todo forms to the todo container
const addTodoFormsContainer = (projectName) => {
    const todoContainer = document.getElementById("todo-container");

    todoContainer.innerHTML = `
        <div id="todos"></div>
        <button id="create-todo-btn">Create Todo</button>
        <form id="create-todo-form" class="hidden">
            <label for="todo-form-title">Todo Name</label>
            <input type="text" name="title" id="todo-form-title" placeholder="Name of todo" required>
            <label for="todo-form-desc">Description</label>
            <textarea name="desc" id="todo-form-desc" cols="30" rows="10" placeholder="Optional description..."></textarea>
            <label for="todo-priority">Priority</label>
            <select name="priority" id="todo-priority" required>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select>
            <label for="todo-date-input">Due Date</label>
            <input type="date" name="due-date" id="todo-date-input" required>
            <button type="submit" id="add-todo-btn" value="${projectName}">Create Todo</button>
            <button id="add-todo-cancel-btn" class="delete-todo-btn">Cancel</button>
        </form>
    `;
    
    const createTodoForm = document.getElementById("create-todo-form");
    createTodoForm.addEventListener("submit", event => {
        event.preventDefault();
        if (Project.todoExists(getProjectWithName(projectName), new FormData(createTodoForm).get("title"))) {
            alert("Sorry, a todo with this name already exists!");
            return false;
        }
        createTodo(createTodoForm, projectName);
        displayTodos(projectName);
        createTodoForm.reset();
        toggleCreateTodoForm();
    })

    // TODO - PUT IN SEPARATE FUNCTION
    document.getElementById("create-todo-btn").addEventListener("click", event => {
        event.preventDefault();
        toggleCreateTodoForm();
    });

    document.getElementById("add-todo-cancel-btn").addEventListener("click", event => {
        event.preventDefault();
        toggleCreateTodoForm();
    });
}

const toggleCreateTodoForm = () => {
    const createTodoBtn = document.getElementById("create-todo-btn");
    const createTodoForm = document.getElementById("create-todo-form");
    createTodoBtn.classList.toggle("hidden");
    createTodoForm.classList.toggle("hidden");
}