const taskList = document.getElementById("item-list");

function generateTodos() {
  // read the todos 
  axios.get('/read-item')
    .then((res) => {
      const todos = [...res.data.data];
        taskList.insertAdjacentHTML("beforeend", todos.map((item) => {
          return `
<li class="border flex justify-between items-center p-2 rounded-md mb-2">
<span class="item-text">${item.todo}</span>
<div class="flex border justify-between">
<button data-id="${item._id}"
class="edit-me bg-gray-500 text-white rounded mr-1 px-4 py-2 hover:bg-gray-600 transition">Edit</button>
<button data-id="${item._id}"
class="delete-me bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600 transition">Delete</button>
</div>
</li>
`
        }).join(""));
    })
    .catch((error) => {
      alert(error);
      console.log(error);
    })
  // map the todos
}

window.onload = () => {
  generateTodos();
}

document.addEventListener('click', (e) => {
  let id;
  if(e.target.classList.contains('add-item')) {
    e.preventDefault();
    const text = document.getElementById("create_field");
    if(text.value === "") {
      alert("Please enter some task");
      return;
    }
    axios.post("/create-item", {todo: text.value})
      .then((res) => {
        const newTaskId = res.data.data._id;
        let li = document.createElement("li");
        let span = document.createElement("span");
        let div = document.createElement("div");
        let editButton = document.createElement("button");
        let deleteButton = document.createElement("button");

        li.classList.add("border", "flex", "justify-between", "items-center", "p-2", "rounded-md", "mb-2");

        span.classList.add("item-text");
        span.textContent = `${text.value}`;

        div.classList.add("flex", "justify-between");

        editButton.setAttribute("data-id", `${newTaskId}`);
        editButton.textContent = "Edit";
        editButton.classList.add("edit-me", "bg-gray-500", "text-white", "rounded", "mr-1", "px-4", "py-2", "hover:bg-gray-600", "transition");


        deleteButton.setAttribute("data-id", `${newTaskId}`);
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-me", "bg-red-500", "text-white", "rounded", "px-4", "py-2", "hover:bg-red-600", "transition");

        div.appendChild(editButton);
        div.appendChild(deleteButton);

        li.appendChild(span);
        li.appendChild(div);

        taskList.appendChild(li);
        text.value = "";  
      })
      .catch((error) => {
        alert(error);
      })
    return;
  }
  if(e.target.classList.contains("edit-me")) {
    id = e.target.dataset.id;
    const textToEdit = e.target.parentElement.parentElement.querySelector(".item-text").innerText;
    const newData = prompt("Enter your new todo text", textToEdit);

    if(newData) {
      axios.post("/edit-item", {id: id, newData: newData})
        .then((res) => {
          if(res.data.status !== 200) {
            alert(res.data.message);
            return;
          }
          e.target.parentElement.parentElement.querySelector(".item-text").innerHTML = newData;

        })
        .catch((error) => {
          console.log(error);
          alert(error);
        })
    }

  } else if(e.target.classList.contains("delete-me")) {
    id = e.target.dataset.id;
    axios.post("/delete-item", {id: id})
      .then((res) => {
        if(res.data.status !== 200) {
          alert(res.data.message);
          return;
        }
        e.target.parentElement.parentElement.remove();
        return;
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      })
  }
})
