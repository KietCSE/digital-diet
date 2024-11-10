import browser from "webextension-polyfill";

console.log("hello from content ts");

export function BlockWebSite() {
    const blocker = document.createElement("div");
    blocker.id = "blocker-screen";
    blocker.style.position = "fixed";
    blocker.style.top = "0";
    blocker.style.left = "0";
    blocker.style.width = "100vw";
    blocker.style.height = "100vh";
    blocker.style.backgroundColor = "black";
    blocker.style.color = "white";
    blocker.style.display = "flex";
    blocker.style.justifyContent = "center";
    blocker.style.alignItems = "center";
    blocker.style.zIndex = "999999"; // Đảm bảo màn hình chặn ở trên cùng
    blocker.innerHTML = `
        <div style="line-height: 1.8; text-align: center;">
            <h1 style="font-size: 4rem">You are blocked by Digital diet!!!</h1>   
            <h1 style="font-size: 3rem">You’ve taken a step towards productivity!</h1>
            <h1>Remember, your time is valuable. Stay focused and achieve your goals.</h1>
            <h1>It's okay to take a break—come back when you're ready to stay productive!</h1>
        </div>
    `;
    document.body.appendChild(blocker);
}

function DelayWebSite(timeLeft: number) {

    const delayScreen = document.createElement("div");
    delayScreen.id = "delay-screen";
    delayScreen.style.position = "fixed";
    delayScreen.style.top = "0";
    delayScreen.style.left = "0";
    delayScreen.style.width = "100vw";
    delayScreen.style.height = "100vh";
    delayScreen.style.backgroundColor = "black";
    delayScreen.style.color = "white";
    delayScreen.style.display = "flex";
    delayScreen.style.justifyContent = "center";
    delayScreen.style.alignItems = "center";
    delayScreen.style.zIndex = "999999"; // Đảm bảo màn hình chặn ở trên cùng
    delayScreen.innerHTML = `
        <div style="line-height: 1.8; text-align: center;">
            <h1 style="font-size: 4rem">You are blocked by Digital diet!!!</h1>   
            <h1 style="font-size: 3rem">You’ve taken a step towards productivity!</h1>
            <h1>Remember, your time is valuable. Stay focused and achieve your goals.</h1>
            <h1>It's okay to take a break—come back when you're ready to stay productive!</h1>
            <h2 id="countdown-timer" style="font-size: 2rem; margin-top: 20px;">${timeLeft} seconds remaining</h2>
        </div>
    `;

    document.body.appendChild(delayScreen); // Thêm màn hình chặn lên trang

    // Cập nhật bộ đếm ngược mỗi giây
    const countdownInterval = setInterval(() => {
        timeLeft -= 1;
        const countdownElement = document.getElementById("countdown-timer");
        if (countdownElement) {
            countdownElement.textContent = `${timeLeft} seconds remaining`;
        }

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            delayScreen.remove();
        }
    }, 1000);
}

browser.runtime.onMessage.addListener((content, sender, sendResponse) => {
    console.log(content);
    if (content.delay) {
        DelayWebSite(content.delay);
    } else {
        BlockWebSite();
    }
});
