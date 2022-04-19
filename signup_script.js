//for register

const register = (e) => {
  let fullName = document.getElementById("fullName").value;
  let phone = document.getElementById("phone").value;
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  let confirmPassword = document.getElementById("confirmPassword").value;

  if (password === confirmPassword) {
    let formData = JSON.parse(localStorage.getItem("formData")) || [];

    let exist_data =
      formData.length &&
      formData.some((data) => data.email === email || data.phone === phone);

    console.log(formData);
    console.log(typeof phone);

    // if(formData.find(user => user.email===email && user.phone===phone)){
    //     alert('email or phone number already exist')
    // }

    if (!exist_data) {
      formData.push({ fullName, phone, email, password });
      localStorage.setItem("formData", JSON.stringify(formData));
      document.querySelector("form").reset();
      alert("Account Created");
      location.href = "../html/login.html";
    } else {
      alert("Duplicate data found");
    }

    e.preventDefault();
  } else {
    alert("Passwords does not match");
  }
};

//for login
// function login(e){
//     let email = document.getElementById('email').value;
//     let password = document.getElementById('password').value;

//     let formData = JSON.parse(localStorage.getItem('formData')) || [];
//     let exist = formData.length && JSON.parse(localStorage.getItem('formData')).some(data => data.email == email && data.password == password);

//     if(!exist){
//         alert('Username or Password is incorrect');
//     }else{
//         alert('LoggedIn')

//     }
//     e.preventDefault();

// }
