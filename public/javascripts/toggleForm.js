const toggleBtn = document.querySelector("#toggler");
const Form = document.querySelector("#hiddenForm");
const list = Form.classList;
toggleBtn.addEventListener("click", () => {
  if (list.contains("isHidden")) {
    list.remove("isHidden");
  } else {
    list.add("isHidden");
  }
});
