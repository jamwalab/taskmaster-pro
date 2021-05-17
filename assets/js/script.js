var tasks = {};
//AUDIT TASK FUNCTION
var auditTask = function(taskEl) {
  //get date from task element
  var date = $(taskEl).find("span").text().trim();
  //convert to moment object at 5:00pm
  var time = moment(date,"L").set("hour",17);
  //remove any old calsses from elements
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
  //apply new class if near or over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger")
  }
  else if (Math.abs(moment().diff(time, "days")) <=2) {
    $(taskEl).addClass("list-group-item-warning")
  }
  console.log(taskEl);
};
var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  auditTask(taskLi);
  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);

};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//edit text on click
$(".list-group").on("click", "p", function() {
  //Get the text in p
  var text = $(this)
    .text()
    .trim();
  //Create textarea
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  //replace p with textarea
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

//save text when clicked outside
$(".list-group").on("blur", "textarea", function() {
  //get the text in text area
  var text = $(this)
    .val()
    .trim();
  //get parent element id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  //get the position of the list in list element
  var index = $(this)
    .closest(".list-group-item")
    .index();

  tasks[status][index].text = text;
  saveTasks();

  //recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  //replace text area p
  $(this).replaceWith(taskP);
});

//edit date when clicked
$(".list-group").on("click", "span", function() {
  //Get the text in span
  var date = $(this)
    .text()
    .trim();
  //Create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
  //replace p with textarea
  $(this).replaceWith(dateInput);
  //Datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // when calendar is closed, force a "change" event
      $(this).trigger("change");
    }
  });
  dateInput.trigger("focus");
});

//edit date when clicked outside
$(".list-group").on("change", "input[type='text']", function() {
  //get the current text
  var date = $(this)
  .val()
  .trim();
  //get parent element id attribute
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");
  //get the position of the list in list element
  var index = $(this)
    .closest(".list-group-item")
    .index();

  tasks[status][index].date = date;
  saveTasks();
  //recreate span element
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  //replace text area p
  $(this).replaceWith(taskSpan);
  //pass li element to audit task
  auditTask($(taskSpan).closest(".list-group-item"));
});

//JQUERY UI - MAKE LIST DRAGGABLE AND SORTABLE
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",

  update: function(event) {
    var tempArr = [];
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();
      
        var date = $(this)
        .find("span")
        .text()
        .trim();
      
        tempArr.push({
        text: text,
        date: date
      });
    });
    var arrName = $(this)
      .attr("id")
      .replace("list-","");
    
    tasks[arrName] = tempArr;
    saveTasks();
    console.log(tempArr);
  }
});
//TRASH DROPPABLE CODE
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
  }
});
//MODAL DATE PICKER
$("#modalDueDate").datepicker({
  minDate:1
});
// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();

setInterval(function() {
  $(".card .list-group-item").each(function(index, el) {
    auditTask(el);
  });
}, 1800000);