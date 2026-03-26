document.addEventListener("DOMContentLoaded", function () {

  document.querySelectorAll(".slider").forEach(slider => {
    let images = slider.querySelectorAll("img");

    if (images.length <= 1) return;

    let index = 0;

    setInterval(() => {
      images[index].classList.remove("active");
      index = (index + 1) % images.length;
      images[index].classList.add("active");
    }, 2500);
  });

  // Password show/hide toggle for auth pages
  document.querySelectorAll(".toggle-password").forEach(toggle => {
    const togglePassword = () => {
      const targetId = toggle.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;

      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      toggle.textContent = isHidden ? "🙈" : "👁️";
      toggle.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
      toggle.setAttribute("aria-pressed", String(isHidden));
    };

    toggle.addEventListener("click", togglePassword);
    toggle.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        togglePassword();
      }
    });
  });

});

function confirmDelete(){

  Swal.fire({
    title: "Are you sure?",
    text: "This listing will be permanently deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel"
  }).then((result) => {

    if (result.isConfirmed) {

      document.getElementById("deleteForm").submit();

    }

  });

}

document.querySelectorAll(".slider").forEach(slider => {

  const images = slider.querySelectorAll("img");
  const dots = slider.querySelectorAll(".dot");

  let index = 0;

  if(images.length <= 1) return;

  setInterval(()=>{

    images[index].classList.remove("active");
    dots[index].classList.remove("active-dot");

    index = (index + 1) % images.length;

    images[index].classList.add("active");
    dots[index].classList.add("active-dot");

  },3000);

});
// =============================
// Booking Success Popup
// =============================

document.addEventListener("DOMContentLoaded", () => {

  const seatsInput = document.querySelector("input[name='seats']");

  if (seatsInput) {
    seatsInput.addEventListener("input", function () {
      let max = this.max || 100; // fallback

      if (Number(this.value) > Number(max)) {
        this.value = max;
      }
    });
  }

});


document.querySelector("input[name='seats']").addEventListener("input", function(){
  let max = this.max;
  if(this.value > max){
    this.value = max;
  }
});


function confirmDelete() {

Swal.fire({
title: "Delete Listing?",
text: "You won't be able to recover this listing!",
icon: "warning",
showCancelButton: true,
confirmButtonColor: "#d33",
cancelButtonColor: "#3085d6",
confirmButtonText: "Yes, delete it!"
}).then((result) => {

if (result.isConfirmed) {
document.getElementById("deleteForm").submit();
}

});

}
