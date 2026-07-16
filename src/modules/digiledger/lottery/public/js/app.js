// ORBIS Lottery Module Logic
console.log("Lottery Module Loaded Successfully");

function startLottery() {
    const randomNum = Math.floor(Math.random() * 1000);
    const resultDiv = document.getElementById('result');
    if(resultDiv) {
        resultDiv.innerHTML = `<h3>Lucky Number: ${randomNum}</h3>`;
    }
}
