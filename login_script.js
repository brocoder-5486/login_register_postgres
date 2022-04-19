function login(e) {
  let email = document.getElementById("userName").value;
  let password = document.getElementById("userPassword").value;

  let formData = JSON.parse(localStorage.getItem("formData")) || [];
  let exist =
    formData.length &&
    JSON.parse(localStorage.getItem("formData")).some(
      (data) => data.email == email && data.password == password
    );

  if (!exist) {
    alert("Username or Password is incorrect");
  } else {
    alert("Logged-In");
    location.href = "../html/to_do.html";
    window.onload = () => {
      document.getElementByClassName("user_details").innerHTML = email;
    };
  }
  e.preventDefault();
}
