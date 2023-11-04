const updateBtn = document.getElementById("ResetPw")
console.log(updateBtn)
updateBtn.onclick = async (e) => {
    e.preventDefault()

    const password = document.forms["passwordForm"]["password"].value
    const confirmpassword = document.forms["passwordForm"]["Confirm-password"].value
    const userId = document.forms["passwordForm"]["userId"].value
    const requestId = document.forms["passwordForm"]["requestId"].value

    if (password !== confirmpassword) {
        alert("Password Mismatch")
        return
    } else {
        const PassWord = {
            password: password,
            confirmpassword: confirmpassword,
            userId: userId,
            requestId: requestId
        }
        try {
            const Response = await axios.post(`http://localhost:4000/UpdatePassword/${userId}`, PassWord)
            alert("Password is updated")
            window.location.replace("http://127.0.0.1:5500/Expense Frontend/Login.html")
            console.log(Response)
        } catch (err) {
            console.log(err)
            alert("Somthing wenghght wrong")
        }
    }
}