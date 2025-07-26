document.addEventListener("DOMContentLoaded", () => {
  const dataList = document.getElementById("data-list");
  const dataForm = document.getElementById("data-form");
  const dataInput = document.getElementById("data-input");

  // Fetch and render all notes
  const fetchData = async () => {
    try {
      const response = await fetch("/data");
      const data = await response.json();
      dataList.innerHTML = ""; // Clear list

      data.forEach((item) => {
        const li = document.createElement("li");
        li.dataset.id = item.id;

        // Display area
        const textSpan = document.createElement("span");
        textSpan.textContent = item.text;

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.style.marginLeft = "10px";

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.style.marginLeft = "5px";
        deleteBtn.style.backgroundColor = "#dc3545"; // red
        deleteBtn.style.color = "white";

        li.appendChild(textSpan);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        dataList.appendChild(li);

        
        let isEditing = false;

        // Edit button
        editBtn.addEventListener("click", () => {
          if (!isEditing) {
            isEditing = true;

            // Replace textSpan with input box
            const input = document.createElement("input");
            input.type = "text";
            input.value = textSpan.textContent;
            input.style.width = "60%";

            // Change Edit button to Save
            editBtn.textContent = "Save";

            // Cancel
            const cancelBtn = document.createElement("button");
            cancelBtn.textContent = "Cancel";
            cancelBtn.style.marginLeft = "5px";

            li.insertBefore(input, textSpan);
            li.removeChild(textSpan);
            li.insertBefore(cancelBtn, deleteBtn);

            
            editBtn.onclick = async () => {
              const newText = input.value.trim();
              if (!newText) {
                alert("Note text cannot be empty");
                return;
              }

              try {
                const response = await fetch(`/data/${item.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ text: newText }),
                });
                if (response.ok) {
                  fetchData();
                } else {
                  alert("Failed to update note");
                }
              } catch (error) {
                console.error("Error updating data:", error);
              }
            };

            // Cancel 
            cancelBtn.onclick = () => {
              isEditing = false;
              li.removeChild(input);
              li.removeChild(cancelBtn);
              li.insertBefore(textSpan, editBtn);
              editBtn.textContent = "Edit";

              // Reset 
              editBtn.onclick = null;
            };
          }
        });

        // Delete 
        deleteBtn.addEventListener("click", async () => {
          if (confirm("Are you sure you want to delete this note?")) {
            try {
              const response = await fetch(`/data/${item.id}`, {
                method: "DELETE",
              });
              if (response.ok) {
                fetchData();
              } else {
                alert("Failed to delete note");
              }
            } catch (error) {
              console.error("Error deleting data:", error);
            }
          }
        });
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Add new note
  dataForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const newData = { text: dataInput.value.trim() };
    if (!newData.text) return alert("Please enter some text");

    try {
      const response = await fetch("/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        dataInput.value = "";
        fetchData();
      } else {
        alert("Failed to add note");
      }
    } catch (error) {
      console.error("Error adding data:", error);
    }
  });

  // Initial fetch on page load
  fetchData();
});
